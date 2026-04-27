import { useState } from 'react';
import { Alert, Box, Button, Pagination, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { AppDataTable, type AppTableColumn } from '@/components/ui/AppDataTable';
import { CreateModal } from '@/components/ui/CreateModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LabeledTextField } from '@/components/ui/LabeledTextField';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import type { CustomerSummary } from '@/types/booking';

const SUPER_ADMIN_SALON_ID = 'cmofwb8i70001jbrc1f7zigpf';
const PAGE_SIZE = 20;
type CustomersPageResponse = { items: CustomerSummary[]; total: number; page: number; pageSize: number };

export default function CustomersPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const salonId = user?.salonId;
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const effectiveSalonId = isSuperAdmin ? SUPER_ADMIN_SALON_ID : salonId;

  const customersQuery = useQuery({
    queryKey: ['customers', effectiveSalonId, search, page],
    queryFn: async () => {
      const { data } = await api.get<CustomersPageResponse>('/customers', {
        params: {
          q: search.trim() || undefined,
          page,
          pageSize: PAGE_SIZE,
        },
      });
      return data;
    },
    enabled: Boolean(effectiveSalonId),
  });

  const rows = customersQuery.data?.items ?? [];
  const total = customersQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns: AppTableColumn<CustomerSummary>[] = [
    { id: 'fullName', label: 'Name', minWidth: 180 },
    { id: 'phone', label: 'Phone', minWidth: 140 },
    { id: 'email', label: 'Email', minWidth: 220, render: (c) => c.email ?? '—' },
    {
      id: 'salon',
      label: 'Salon',
      minWidth: 160,
      render: (c) => c.salon?.name ?? '—',
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 140,
      render: (c) => new Date(c.createdAt).toLocaleDateString(),
    },
  ];

  if (!isSuperAdmin && !salonId) {
    return (
      <Box>
        <PageHeader title="Customers" description="Customer CRM for your salon." />
        <EmptyState
          title="No salon linked"
          description="Sign in with a salon account to access customer records."
        />
      </Box>
    );
  }

  const submitCreate = async () => {
    setActionError(null);
    if (!newName.trim() || !newPhone.trim()) {
      setActionError('Full name and phone are required.');
      return;
    }
    if (!effectiveSalonId) {
      setActionError('No salon selected.');
      return;
    }
    setCreating(true);
    try {
      await api.post('/customers', {
        fullName: newName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
      });
      setOpenCreate(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      await qc.invalidateQueries({ queryKey: ['customers'] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not create customer.'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Customers"
        description={
          isSuperAdmin
            ? `Showing customers for salon ${SUPER_ADMIN_SALON_ID}.`
            : 'Manage your salon customer records.'
        }
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setOpenCreate(true);
            }}
            disabled={!effectiveSalonId}
          >
            Add customer
          </Button>
        }
      />

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

      {customersQuery.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(customersQuery.error, 'Could not load customers.')}
        </Alert>
      ) : null}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search customers"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Name, phone, email"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <AppDataTable
        columns={columns}
        rows={rows}
        showActions={false}
        toolbar={
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            sx={{ width: '100%' }}
            spacing={1.5}
          >
            <Typography variant="body2" color="text.secondary">
              {total} customer{total === 1 ? '' : 's'} total
            </Typography>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_e, p) => setPage(p)}
              color="primary"
              shape="rounded"
              size="small"
            />
          </Stack>
        }
        emptyTitle="No customers found"
        emptyDescription="Try a different search or add your first customer."
      />

      <CreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Add customer"
        submitLabel="Create customer"
        onSubmit={submitCreate}
        loading={creating}
      >
        <LabeledTextField label="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        <LabeledTextField label="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
        <LabeledTextField label="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
      </CreateModal>
    </Box>
  );
}
