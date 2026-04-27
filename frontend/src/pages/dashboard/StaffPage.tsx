import { useState } from 'react';
import { Alert, Box, Button, Chip, Stack } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { AppDataTable, type AppTableColumn } from '@/components/ui/AppDataTable';
import { CreateModal } from '@/components/ui/CreateModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LabeledSelect } from '@/components/ui/LabeledSelect';
import { LabeledTextField } from '@/components/ui/LabeledTextField';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import type { CreateSalonStaffRole, SalonStaffMember } from '@/types/staff';

const SUPER_ADMIN_SALON_ID = 'cmofwb8i70001jbrc1f7zigpf';

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

export default function StaffPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const salonId = user?.salonId;
  const canManage =
    user?.role === 'SUPER_ADMIN' || user?.role === 'SALON_OWNER';
  const effectiveSalonId = isSuperAdmin ? SUPER_ADMIN_SALON_ID : salonId;

  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<CreateSalonStaffRole>('STAFF');
  const [title, setTitle] = useState('');

  const membersQuery = useQuery({
    queryKey: ['staff-members', effectiveSalonId],
    queryFn: async () => {
      const { data } = await api.get<SalonStaffMember[]>('/staff/members');
      return data;
    },
    enabled: Boolean(effectiveSalonId) && user?.role !== 'CUSTOMER' && user?.role !== 'STAFF',
  });

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
      minWidth: 100,
      render: (m) => <Chip size="small" label={m.status} variant="outlined" />,
    },
  ];

  if (user?.role === 'CUSTOMER' || user?.role === 'STAFF') {
    return (
      <Box>
        <PageHeader title="Staff" description="Team directory" />
        <EmptyState title="Not available" description="You do not have access to this page." />
      </Box>
    );
  }

  if (!isSuperAdmin && !salonId) {
    return (
      <Box>
        <PageHeader title="Staff" description="Manage salon team accounts." />
        <EmptyState
          title="No salon linked"
          description="Sign in with a salon admin account to manage staff."
        />
      </Box>
    );
  }

  const submitCreate = async () => {
    setActionError(null);
    if (!fullName.trim() || !email.trim() || password.length < 8) {
      setActionError('Name, email, and a password of at least 8 characters are required.');
      return;
    }
    setCreating(true);
    try {
      await api.post('/staff/members', {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        role,
        title: role === 'STAFF' ? title.trim() || undefined : undefined,
      });
      setOpenCreate(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('STAFF');
      setTitle('');
      await qc.invalidateQueries({ queryKey: ['staff-members'] });
      await qc.invalidateQueries({ queryKey: ['staff'] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not create user.'));
    } finally {
      setCreating(false);
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
        description={
          isSuperAdmin
            ? `Salon team for ${SUPER_ADMIN_SALON_ID}. Create receptionists, admins, and stylists.`
            : 'Create receptionists and stylists. Only a platform admin can add another salon admin.'
        }
        actions={
          canManage ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpenCreate(true)}>
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
        showActions={false}
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
        onSubmit={submitCreate}
        loading={creating}
      >
        <LabeledSelect
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as CreateSalonStaffRole)}
          options={roleChoices.map((o) => ({ value: o.value, label: o.label }))}
          required
        />
        <LabeledTextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <LabeledTextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
        <LabeledTextField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          helperText="At least 8 characters. They will use this to sign in."
        />
        <LabeledTextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {role === 'STAFF' ? (
          <LabeledTextField
            label="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior stylist"
          />
        ) : null}
      </CreateModal>
    </Box>
  );
}
