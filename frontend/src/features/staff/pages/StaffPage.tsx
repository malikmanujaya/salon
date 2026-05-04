import { useState } from 'react';
import { Alert, Box, Button, Chip, Stack } from '@mui/material';
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
import { createStaffMember, deactivateStaffMember, updateStaffMember } from '@/features/staff/api';
import { staffKeys, useStaffMembersList } from '@/features/staff/queries';
import { getApiErrorMessage } from '@/lib/apiError';
import type { CreateSalonStaffRole, SalonStaffMember, StaffUserStatus } from '@/types/staff';

const ROLE_OPTIONS: { value: CreateSalonStaffRole; label: string }[] = [
  { value: 'SALON_OWNER', label: 'Admin (salon owner)' },
  { value: 'RECEPTIONIST', label: 'Receptionist' },
  { value: 'STAFF', label: 'Staff (stylist)' },
];

function roleLabel(role: string) {
  switch (role) {
    case 'SALON_OWNER':
      return 'Admin';
    case 'RECEPTIONIST':
      return 'Receptionist';
    case 'STAFF':
      return 'Staff';
    default:
      return role;
  }
}

function roleChipColor(
  role: string,
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  switch (role) {
    case 'SALON_OWNER':
      return 'primary';
    case 'RECEPTIONIST':
      return 'info';
    case 'STAFF':
      return 'success';
    default:
      return 'default';
  }
}

const STAFF_USER_STATUS_OPTIONS: { value: StaffUserStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Temporarily blocked (cannot sign in)' },
  { value: 'DISABLED', label: 'Deactivated' },
];

function staffStatusLabel(s: string) {
  return STAFF_USER_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

function staffStatusChipColor(
  s: string,
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  switch (s) {
    case 'ACTIVE':
      return 'success';
    case 'SUSPENDED':
      return 'warning';
    case 'DISABLED':
      return 'default';
    default:
      return 'default';
  }
}

export default function StaffPage() {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const canManage =
    user?.role === 'SUPER_ADMIN' || user?.role === 'SALON_OWNER';

  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SalonStaffMember | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<SalonStaffMember | null>(null);
  const [search, setSearch] = useState('');

  const membersQuery = useStaffMembersList(
    { q: search.trim() || undefined },
    !authLoading && user?.role !== 'CUSTOMER',
  );

  const rows = membersQuery.data ?? [];

  const columns: AppTableColumn<SalonStaffMember>[] = [
    {
      id: 'fullName',
      label: 'Name',
      minWidth: 160,
      render: (m) => (
        <Box>
          <Box sx={{ fontWeight: 600 }}>{m.fullName}</Box>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{m.email}</Box>
        </Box>
      ),
    },
    { id: 'phone', label: 'Phone', minWidth: 120, render: (m) => m.phone ?? '—' },
    {
      id: 'role',
      label: 'Role',
      minWidth: 120,
      render: (m) => (
        <Chip size="small" label={roleLabel(m.role)} color={roleChipColor(m.role)} variant="outlined" />
      ),
    },
    {
      id: 'title',
      label: 'Title / profile',
      minWidth: 140,
      render: (m) =>
        m.staffProfile ? (m.staffProfile.title ?? 'Stylist') : '—',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 200,
      render: (m) => (
        <Chip
          size="small"
          label={staffStatusLabel(m.status)}
          color={staffStatusChipColor(m.status)}
          variant="outlined"
        />
      ),
    },
  ];

  if (authLoading) {
    return (
      <Box>
        <PageHeader title="Staff" description="Team directory" />
        <AppDataTable columns={columns} rows={[]} loading emptyTitle="Loading staff..." />
      </Box>
    );
  }

  if (user?.role === 'CUSTOMER') {
    return (
      <Box>
        <PageHeader title="Staff" description="Team directory" />
        <EmptyState title="Not available" description="You do not have access to this page." />
      </Box>
    );
  }

  const createFormik = useFormik({
    initialValues: {
      role: 'STAFF' as CreateSalonStaffRole,
      fullName: '',
      email: '',
      password: '',
      phone: '',
      title: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
      if (!values.email.trim()) errors.email = 'Email is required.';
      if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.';
      return errors;
    },
    onSubmit: async (values, helpers) => {
      setActionError(null);
      setCreating(true);
      try {
        await createStaffMember({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password,
          phone: values.phone.trim() || undefined,
          role: values.role,
          title: values.role === 'STAFF' ? values.title.trim() || undefined : undefined,
        });
        setOpenCreate(false);
        helpers.resetForm();
        await qc.invalidateQueries({ queryKey: staffKeys.all });
        await qc.invalidateQueries({ queryKey: ['staff'] });
      } catch (err) {
        setActionError(getApiErrorMessage(err, 'Could not create user.'));
      } finally {
        setCreating(false);
      }
    },
  });

  const openEdit = (member: SalonStaffMember) => {
    setEditing(member);
    setActionError(null);
  };

  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      role: (editing?.role as CreateSalonStaffRole) ?? 'STAFF',
      fullName: editing?.fullName ?? '',
      phone: editing?.phone ?? '',
      title: editing?.staffProfile?.title ?? '',
      accountStatus: ((editing?.status as StaffUserStatus) ?? 'ACTIVE') as StaffUserStatus,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
      return errors;
    },
    onSubmit: async (values) => {
      if (!editing) return;
      setActionError(null);
      setUpdating(true);
      try {
        await updateStaffMember(editing.id, {
          fullName: values.fullName.trim(),
          phone: values.phone.trim() || null,
          role: values.role,
          title: values.role === 'STAFF' ? values.title.trim() || null : null,
          status: values.accountStatus,
        });
        setEditing(null);
        await qc.invalidateQueries({ queryKey: staffKeys.all });
        await qc.invalidateQueries({ queryKey: ['staff'] });
      } catch (err) {
        setActionError(getApiErrorMessage(err, 'Could not update member.'));
      } finally {
        setUpdating(false);
      }
    },
  });

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    setActionError(null);
    try {
      await deactivateStaffMember(deactivateTarget.id);
      setDeactivateTarget(null);
      await qc.invalidateQueries({ queryKey: staffKeys.all });
      await qc.invalidateQueries({ queryKey: ['staff'] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not deactivate member.'));
    } finally {
      setDeactivating(false);
    }
  };

  const roleChoices =
    user?.role === 'SALON_OWNER'
      ? ROLE_OPTIONS.filter((o) => o.value !== 'SALON_OWNER')
      : ROLE_OPTIONS;

  return (
    <Box>
      <PageHeader
        title="Staff"
        description="Create receptionists and stylists. Only a platform admin can add another salon admin."
        actions={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                createFormik.resetForm();
                setOpenCreate(true);
              }}
            >
              Add team member
            </Button>
          ) : null
        }
      />

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

      {membersQuery.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(membersQuery.error, 'Could not load staff.')}
        </Alert>
      ) : null}

      {!canManage ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can view the team directory. Only salon owners (or platform admin) can add accounts.
        </Alert>
      ) : null}

      <AppDataTable
        columns={columns}
        rows={rows}
        loading={membersQuery.isLoading || membersQuery.isFetching}
        searchPlaceholder="Name, email, phone, title"
        searchQuery={search}
        onSearch={(q) => setSearch(q)}
        clientSearch={false}
        showActions={canManage}
        onEdit={canManage ? openEdit : undefined}
        onDelete={canManage ? (row) => setDeactivateTarget(row) : undefined}
        toolbar={
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {rows.length} team member{rows.length === 1 ? '' : 's'}
            </Box>
          </Stack>
        }
        emptyTitle="No team members yet"
        emptyDescription="Add a receptionist, admin, or stylist to get started."
      />

      <CreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Add team member"
        submitLabel="Create account"
        onSubmit={createFormik.submitForm}
        loading={creating}
      >
        <LabeledSelect
          label="Role"
          value={createFormik.values.role}
          onChange={(e) => createFormik.setFieldValue('role', e.target.value as CreateSalonStaffRole)}
          options={roleChoices.map((o) => ({ value: o.value, label: o.label }))}
          required
        />
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
          label="Email"
          name="email"
          value={createFormik.values.email}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
          error={createFormik.touched.email && Boolean(createFormik.errors.email)}
          helperText={createFormik.touched.email ? createFormik.errors.email : undefined}
          required
          type="email"
        />
        <LabeledTextField
          label="Password"
          name="password"
          value={createFormik.values.password}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
          error={createFormik.touched.password && Boolean(createFormik.errors.password)}
          helperText={
            createFormik.touched.password && createFormik.errors.password
              ? createFormik.errors.password
              : 'At least 8 characters. They will use this to sign in.'
          }
          required
          type="password"
        />
        <LabeledTextField
          label="Phone"
          name="phone"
          value={createFormik.values.phone}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
        />
        {createFormik.values.role === 'STAFF' ? (
          <LabeledTextField
            label="Title (optional)"
            name="title"
            value={createFormik.values.title}
            onChange={createFormik.handleChange}
            onBlur={createFormik.handleBlur}
            placeholder="e.g. Senior stylist"
          />
        ) : null}
      </CreateModal>

      <EditModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit team member"
        submitLabel="Save changes"
        onSubmit={editFormik.submitForm}
        loading={updating}
      >
        <LabeledSelect
          label="Role"
          value={editFormik.values.role}
          onChange={(e) => editFormik.setFieldValue('role', e.target.value as CreateSalonStaffRole)}
          options={roleChoices.map((o) => ({ value: o.value, label: o.label }))}
          required
        />
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
        />
        {editFormik.values.role === 'STAFF' ? (
          <LabeledTextField
            label="Title (optional)"
            name="title"
            value={editFormik.values.title}
            onChange={editFormik.handleChange}
            onBlur={editFormik.handleBlur}
            placeholder="e.g. Senior stylist"
          />
        ) : null}
        <LabeledSelect
          label="Account status"
          value={editFormik.values.accountStatus}
          onChange={(e) => editFormik.setFieldValue('accountStatus', e.target.value as StaffUserStatus)}
          options={STAFF_USER_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          required
        />
      </EditModal>

      <DeleteConfirmModal
        open={Boolean(deactivateTarget)}
        title="Deactivate this team member?"
        entityLabel={deactivateTarget?.fullName}
        description="The account will be disabled and won't be able to sign in."
        confirmLabel="Deactivate"
        loading={deactivating}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={confirmDeactivate}
      />
    </Box>
  );
}
