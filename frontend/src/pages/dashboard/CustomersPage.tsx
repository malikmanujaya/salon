import { useState } from 'react';
import { Alert, Box, Button, Chip, FormControlLabel, Stack, Switch } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { AppDataTable, type AppTableColumn } from '@/components/ui/AppDataTable';
import { CreateModal } from '@/components/ui/CreateModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { EditModal } from '@/components/ui/EditModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LabeledSelect } from '@/components/ui/LabeledSelect';
import { LabeledTextField } from '@/components/ui/LabeledTextField';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import type { CustomerAccountStatus, CustomerSummary } from '@/types/booking';

const SUPER_ADMIN_SALON_ID = 'cmofwb8i70001jbrc1f7zigpf';
const DEFAULT_PAGE_SIZE = 10;

type CustomersPageResponse = { items: CustomerSummary[]; total: number; page: number; pageSize: number };

const ACCOUNT_STATUS_OPTIONS: { value: CustomerAccountStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'BLOCKED', label: 'Temporarily blocked' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
];

function accountStatusChipColor(
  s: CustomerAccountStatus,
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  switch (s) {
    case 'ACTIVE':
      return 'success';
    case 'BLOCKED':
      return 'warning';
    case 'DEACTIVATED':
      return 'default';
    default:
      return 'default';
  }
}

function accountStatusLabel(s: CustomerAccountStatus) {
  return ACCOUNT_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

export default function CustomersPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const salonId = user?.salonId;
  const qc = useQueryClient();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'SALON_OWNER';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [editing, setEditing] = useState<CustomerSummary | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAccountStatus, setEditAccountStatus] = useState<CustomerAccountStatus>('ACTIVE');
  const [updating, setUpdating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CustomerSummary | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const effectiveSalonId = isSuperAdmin ? SUPER_ADMIN_SALON_ID : salonId;

  const customersQuery = useQuery({
    queryKey: ['customers', effectiveSalonId, search, page, pageSize, includeInactive],
    queryFn: async () => {
      const { data } = await api.get<CustomersPageResponse>('/customers', {
        params: {
          q: search.trim() || undefined,
          page,
          pageSize,
          ...(includeInactive ? { includeInactive: true } : {}),
        },
      });
      return data;
    },
    enabled: Boolean(effectiveSalonId),
  });

  const rows = customersQuery.data?.items ?? [];
  const total = customersQuery.data?.total ?? 0;

  const columns: AppTableColumn<CustomerSummary>[] = [
    { id: 'fullName', label: 'Name', minWidth: 180 },
    { id: 'phone', label: 'Phone', minWidth: 140 },
    { id: 'email', label: 'Email', minWidth: 220, render: (c) => c.email ?? '—' },
    {
      id: 'accountStatus',
      label: 'Status',
      minWidth: 160,
      render: (c) => (
        <Chip
          size="small"
          label={accountStatusLabel(c.accountStatus)}
          color={accountStatusChipColor(c.accountStatus)}
          variant="outlined"
        />
      ),
    },
    // {
    //   id: 'salon',
    //   label: 'Salon',
    //   minWidth: 160,
    //   render: (c) => c.salon?.name ?? '—',
    // },
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

  const openEdit = (c: CustomerSummary) => {
    setEditing(c);
    setEditName(c.fullName);
    setEditPhone(c.phone);
    setEditEmail(c.email ?? '');
    setEditAccountStatus(c.accountStatus);
    setActionError(null);
  };

  const submitEdit = async () => {
    if (!editing) return;
    setActionError(null);
    if (!editName.trim()) {
      setActionError('Full name is required.');
      return;
    }
    const digits = editPhone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setActionError('Phone must be exactly 10 digits.');
      return;
    }
    setUpdating(true);
    try {
      await api.patch(`/customers/${editing.id}`, {
        fullName: editName.trim(),
        phone: digits,
        email: editEmail.trim() ? editEmail.trim() : null,
        accountStatus: editAccountStatus,
      });
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ['customers'] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not update customer.'));
    } finally {
      setUpdating(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!deleteTarget) return;
    setDeactivating(true);
    setActionError(null);
    try {
      await api.delete(`/customers/${deleteTarget.id}`);
      setDeleteTarget(null);
      await qc.invalidateQueries({ queryKey: ['customers'] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not deactivate customer.'));
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Customers"
        description={
          isSuperAdmin
            ? `Showing customers for salon.`
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

      <AppDataTable
        columns={columns}
        rows={rows}
        loading={customersQuery.isLoading}
        total={total}
        page={page}
        onPageChange={setPage}
        defaultRowsPerPage={DEFAULT_PAGE_SIZE}
        onRowsPerPageChange={(next) => {
          setPageSize(next);
          setPage(1);
        }}
        showActions={canManage}
        onEdit={canManage ? openEdit : undefined}
        onDelete={canManage ? (row) => setDeleteTarget(row) : undefined}
        searchPlaceholder="Name, phone, email"
        searchQuery={search}
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
        }}
        clientSearch={false}
        toolbar={
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {total} customer{total === 1 ? '' : 's'}
            </Box>
            {canManage ? (
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={includeInactive}
                    onChange={(_e, checked) => {
                      setIncludeInactive(checked);
                      setPage(1);
                    }}
                  />
                }
                label="Show inactive"
              />
            ) : null}
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

      <EditModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit customer"
        submitLabel="Save changes"
        onSubmit={submitEdit}
        loading={updating}
      >
        <LabeledTextField label="Full name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
        <LabeledTextField
          label="Phone"
          value={editPhone}
          onChange={(e) => setEditPhone(e.target.value)}
          required
          helperText="Exactly 10 digits (non-digits are stripped on save)."
        />
        <LabeledTextField label="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email" />
        <LabeledSelect
          label="Account status"
          value={editAccountStatus}
          onChange={(e) => setEditAccountStatus(e.target.value as CustomerAccountStatus)}
          options={ACCOUNT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          required
        />
      </EditModal>

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Deactivate this customer?"
        entityLabel={deleteTarget?.fullName}
        description="They will be marked deactivated and hidden from the default list. Booking history is kept."
        confirmLabel="Deactivate"
        loading={deactivating}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeactivate}
      />
    </Box>
  );
}
