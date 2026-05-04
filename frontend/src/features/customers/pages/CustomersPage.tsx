import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Chip, FormControlLabel, Stack, Switch } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';

import { AppDataTable, type AppTableColumn } from '@/components/ui/AppDataTable';
import { CreateModal } from '@/components/ui/CreateModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { EditModal } from '@/components/ui/EditModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LabeledSelect } from '@/components/ui/LabeledSelect';
import { LabeledTextField } from '@/components/ui/LabeledTextField';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { createCustomer, deactivateCustomer, updateCustomer } from '@/features/customers/api';
import { customersKeys, useCustomersList } from '@/features/customers/queries';
import { getApiErrorMessage } from '@/lib/apiError';
import type { CustomerAccountStatus, CustomerSummary } from '@/types/booking';

const SUPER_ADMIN_SALON_ID = 'cmofwb8i70001jbrc1f7zigpf';
const DEFAULT_PAGE_SIZE = 10;

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

  const [editing, setEditing] = useState<CustomerSummary | null>(null);
  const [updating, setUpdating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CustomerSummary | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const effectiveSalonId = isSuperAdmin ? SUPER_ADMIN_SALON_ID : salonId;

  const customersQuery = useCustomersList(
    {
      q: search.trim() || undefined,
      page,
      pageSize,
      ...(includeInactive ? { includeInactive: true } : {}),
    },
    Boolean(effectiveSalonId),
  );

  const rows = customersQuery.data?.items ?? [];
  /** While React Query switches page keys, `data` can be briefly undefined; keep last total so pagination does not clamp page back to 1. */
  const lastListTotalRef = useRef(0);
  useEffect(() => {
    if (customersQuery.data?.total != null) {
      lastListTotalRef.current = customersQuery.data.total;
    }
  }, [customersQuery.data?.total]);
  const total = customersQuery.data?.total ?? lastListTotalRef.current;

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

  const createFormik = useFormik({
    initialValues: {
      fullName: '',
      phone: '',
      email: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
      if (!values.phone.trim()) errors.phone = 'Phone is required.';
      return errors;
    },
    onSubmit: async (values) => {
      setActionError(null);
      if (!effectiveSalonId) {
        setActionError('No salon selected.');
        return;
      }
      setCreating(true);
      try {
        await createCustomer({
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
          email: values.email.trim() || undefined,
        });
        setOpenCreate(false);
        createFormik.resetForm();
        await qc.invalidateQueries({ queryKey: customersKeys.all });
      } catch (err) {
        setActionError(getApiErrorMessage(err, 'Could not create customer.'));
      } finally {
        setCreating(false);
      }
    },
  });

  const openEdit = (c: CustomerSummary) => {
    setEditing(c);
    setActionError(null);
  };

  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: editing?.fullName ?? '',
      phone: editing?.phone ?? '',
      email: editing?.email ?? '',
      accountStatus: (editing?.accountStatus ?? 'ACTIVE') as CustomerAccountStatus,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
      const digits = values.phone.replace(/\D/g, '');
      if (digits.length !== 10) errors.phone = 'Phone must be exactly 10 digits.';
      return errors;
    },
    onSubmit: async (values) => {
      if (!editing) return;
      setActionError(null);
      const digits = values.phone.replace(/\D/g, '');
      setUpdating(true);
      try {
        await updateCustomer(editing.id, {
          fullName: values.fullName.trim(),
          phone: digits,
          email: values.email.trim() ? values.email.trim() : null,
          accountStatus: values.accountStatus,
        });
        setEditing(null);
        await qc.invalidateQueries({ queryKey: customersKeys.all });
      } catch (err) {
        setActionError(getApiErrorMessage(err, 'Could not update customer.'));
      } finally {
        setUpdating(false);
      }
    },
  });

  const confirmDeactivate = async () => {
    if (!deleteTarget) return;
    setDeactivating(true);
    setActionError(null);
    try {
      await deactivateCustomer(deleteTarget.id);
      setDeleteTarget(null);
      await qc.invalidateQueries({ queryKey: customersKeys.all });
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
              createFormik.resetForm();
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
        loading={customersQuery.isLoading || customersQuery.isFetching}
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
        onSubmit={createFormik.submitForm}
        loading={creating}
      >
        <LabeledTextField
          label="Full name"
          name="fullName"
          value={createFormik.values.fullName}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
          error={createFormik.touched.fullName && Boolean(createFormik.errors.fullName)}
          helperText={createFormik.touched.fullName ? createFormik.errors.fullName : undefined}
          required
        />
        <LabeledTextField
          label="Phone"
          name="phone"
          value={createFormik.values.phone}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
          error={createFormik.touched.phone && Boolean(createFormik.errors.phone)}
          helperText={createFormik.touched.phone ? createFormik.errors.phone : undefined}
          required
        />
        <LabeledTextField
          label="Email"
          name="email"
          value={createFormik.values.email}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
          type="email"
        />
      </CreateModal>

      <EditModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit customer"
        submitLabel="Save changes"
        onSubmit={editFormik.submitForm}
        loading={updating}
      >
        <LabeledTextField
          label="Full name"
          name="fullName"
          value={editFormik.values.fullName}
          onChange={editFormik.handleChange}
          onBlur={editFormik.handleBlur}
          error={editFormik.touched.fullName && Boolean(editFormik.errors.fullName)}
          helperText={editFormik.touched.fullName ? editFormik.errors.fullName : undefined}
          required
        />
        <LabeledTextField
          label="Phone"
          name="phone"
          value={editFormik.values.phone}
          onChange={editFormik.handleChange}
          onBlur={editFormik.handleBlur}
          error={editFormik.touched.phone && Boolean(editFormik.errors.phone)}
          helperText={
            editFormik.touched.phone && editFormik.errors.phone
              ? editFormik.errors.phone
              : 'Exactly 10 digits (non-digits are stripped on save).'
          }
          required
        />
        <LabeledTextField
          label="Email"
          name="email"
          value={editFormik.values.email}
          onChange={editFormik.handleChange}
          onBlur={editFormik.handleBlur}
          type="email"
        />
        <LabeledSelect
          label="Account status"
          value={editFormik.values.accountStatus}
          onChange={(e) => editFormik.setFieldValue('accountStatus', e.target.value as CustomerAccountStatus)}
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
