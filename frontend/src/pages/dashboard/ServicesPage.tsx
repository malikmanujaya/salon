import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  Stack,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { AppDataTable, type AppTableColumn } from '@/components/ui/AppDataTable';
import { CreateModal } from '@/components/ui/CreateModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { EditModal } from '@/components/ui/EditModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LabeledTextField } from '@/components/ui/LabeledTextField';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import type { StaffSummary } from '@/types/booking';
import type { ServiceRow } from '@/types/service';

function formatMoney(priceCents: number, currency: string): string {
  const amount = priceCents / 100;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'LKR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function ServicesPage() {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'SALON_OWNER';

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ServiceRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [staffIds, setStaffIds] = useState<string[]>([]);

  const servicesQuery = useQuery({
    queryKey: ['services', 'all'],
    queryFn: async () => {
      const { data } = await api.get<ServiceRow[]>('/salon-services', {
        params: { includeInactive: true },
      });
      return data;
    },
    enabled: !authLoading && user?.role !== 'CUSTOMER',
  });

  const staffQuery = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get<StaffSummary[]>('/staff');
      return data;
    },
    enabled: !authLoading && user?.role !== 'CUSTOMER',
  });

  const rows = servicesQuery.data ?? [];
  const staffOptions = staffQuery.data ?? [];

  const columns: AppTableColumn<ServiceRow>[] = [
    { id: 'name', label: 'Service', minWidth: 170 },
    {
      id: 'durationMinutes',
      label: 'Duration',
      minWidth: 100,
      render: (s) => `${s.durationMinutes} min`,
    },
    {
      id: 'priceCents',
      label: 'Price',
      minWidth: 120,
      render: (s) => formatMoney(s.priceCents, s.currency),
    },
    {
      id: 'staff',
      label: 'Assigned staff',
      minWidth: 180,
      render: (s) =>
        s.staff.length ? s.staff.map((x) => x.user.fullName).join(', ') : 'Unassigned',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      render: (s) => (
        <Chip
          size="small"
          label={s.isActive ? 'ACTIVE' : 'INACTIVE'}
          color={s.isActive ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
  ];

  const resetForm = () => {
    setName('');
    setDescription('');
    setDurationMinutes('60');
    setPrice('');
    setCurrency('LKR');
    setStaffIds([]);
  };

  const loadFromRow = (row: ServiceRow) => {
    setName(row.name);
    setDescription(row.description ?? '');
    setDurationMinutes(String(row.durationMinutes));
    setPrice(String(row.priceCents / 100));
    setCurrency(row.currency || 'LKR');
    setStaffIds(row.staff.map((x) => x.id));
  };

  const payload = useMemo(() => {
    const duration = Number(durationMinutes);
    const priceMinor = Math.round(Number(price || 0) * 100);
    return {
      name: name.trim(),
      description: description.trim() || undefined,
      durationMinutes: duration,
      priceCents: priceMinor,
      currency: currency.trim().toUpperCase() || 'LKR',
      staffIds,
    };
  }, [name, description, durationMinutes, price, currency, staffIds]);

  const validatePayload = (): string | null => {
    if (!payload.name) return 'Service name is required.';
    if (!Number.isFinite(payload.durationMinutes) || payload.durationMinutes < 5) {
      return 'Duration must be at least 5 minutes.';
    }
    if (!Number.isFinite(payload.priceCents) || payload.priceCents < 0) {
      return 'Price must be zero or more.';
    }
    return null;
  };

  const submitCreate = async () => {
    const issue = validatePayload();
    setActionError(null);
    if (issue) {
      setActionError(issue);
      return;
    }
    setSaving(true);
    try {
      await api.post('/salon-services', payload);
      setOpenCreate(false);
      resetForm();
      await qc.invalidateQueries({ queryKey: ['services'] });
      await qc.invalidateQueries({ queryKey: ['salon-services'] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not create service.'));
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async () => {
    if (!editing) return;
    const issue = validatePayload();
    setActionError(null);
    if (issue) {
      setActionError(issue);
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/salon-services/${editing.id}`, payload);
      setEditing(null);
      resetForm();
      await qc.invalidateQueries({ queryKey: ['services'] });
      await qc.invalidateQueries({ queryKey: ['salon-services'] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not update service.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    setActionError(null);
    try {
      await api.delete(`/salon-services/${deactivateTarget.id}`);
      setDeactivateTarget(null);
      await qc.invalidateQueries({ queryKey: ['services'] });
      await qc.invalidateQueries({ queryKey: ['salon-services'] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not deactivate service.'));
    } finally {
      setDeactivating(false);
    }
  };

  if (authLoading) {
    return (
      <Box>
        <PageHeader title="Services" description="Service catalog" />
        <AppDataTable columns={columns} rows={[]} loading emptyTitle="Loading services..." />
      </Box>
    );
  }

  if (user?.role === 'CUSTOMER') {
    return (
      <Box>
        <PageHeader title="Services" description="Service catalog" />
        <EmptyState title="Not available" description="Customers cannot access this page." />
      </Box>
    );
  }

  const openEdit = (row: ServiceRow) => {
    setEditing(row);
    setActionError(null);
    loadFromRow(row);
  };

  return (
    <Box>
      <PageHeader
        title="Services"
        description="Create and manage salon services. Assign one or more staff members to each service."
        actions={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                resetForm();
                setActionError(null);
                setOpenCreate(true);
              }}
            >
              Add service
            </Button>
          ) : null
        }
      />

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

      {servicesQuery.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(servicesQuery.error, 'Could not load services.')}
        </Alert>
      ) : null}

      {!canManage ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can view services. Only admin users can add/edit/deactivate services.
        </Alert>
      ) : null}

      <AppDataTable
        columns={columns}
        rows={rows}
        loading={servicesQuery.isLoading}
        showActions={canManage}
        onEdit={canManage ? openEdit : undefined}
        onDelete={canManage ? (row) => setDeactivateTarget(row) : undefined}
        toolbar={
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {rows.length} service{rows.length === 1 ? '' : 's'}
            </Box>
          </Stack>
        }
        emptyTitle="No services yet"
        emptyDescription="Add your first service to start taking bookings."
      />

      <CreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Add service"
        submitLabel="Create service"
        onSubmit={submitCreate}
        loading={saving}
      >
        <LabeledTextField label="Service name" value={name} onChange={(e) => setName(e.target.value)} required />
        <LabeledTextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
        />
        <LabeledTextField
          label="Duration (minutes)"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          required
          type="number"
        />
        <LabeledTextField
          label="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          type="number"
          helperText="Major units (e.g. 2500.00)"
        />
        <LabeledTextField label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required />
        <FormControl fullWidth>
          <InputLabel id="service-create-staff-label" shrink>
            Assign staff
          </InputLabel>
          <Select<string[]>
            multiple
            labelId="service-create-staff-label"
            value={staffIds}
            onChange={(e: SelectChangeEvent<string[]>) =>
              setStaffIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
            }
            input={<OutlinedInput label="Assign staff" />}
            renderValue={(selected) =>
              selected
                .map((id) => staffOptions.find((s) => s.id === id)?.user.fullName)
                .filter(Boolean)
                .join(', ')
            }
          >
            {staffOptions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                <Checkbox checked={staffIds.includes(s.id)} />
                <ListItemText primary={s.user.fullName} secondary={s.title ?? 'Stylist'} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CreateModal>

      <EditModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit service"
        submitLabel="Save changes"
        onSubmit={submitEdit}
        loading={saving}
      >
        <LabeledTextField label="Service name" value={name} onChange={(e) => setName(e.target.value)} required />
        <LabeledTextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
        />
        <LabeledTextField
          label="Duration (minutes)"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          required
          type="number"
        />
        <LabeledTextField
          label="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          type="number"
          helperText="Major units (e.g. 2500.00)"
        />
        <LabeledTextField label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required />
        <FormControl fullWidth>
          <InputLabel id="service-edit-staff-label" shrink>
            Assign staff
          </InputLabel>
          <Select<string[]>
            multiple
            labelId="service-edit-staff-label"
            value={staffIds}
            onChange={(e: SelectChangeEvent<string[]>) =>
              setStaffIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
            }
            input={<OutlinedInput label="Assign staff" />}
            renderValue={(selected) =>
              selected
                .map((id) => staffOptions.find((s) => s.id === id)?.user.fullName)
                .filter(Boolean)
                .join(', ')
            }
          >
            {staffOptions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                <Checkbox checked={staffIds.includes(s.id)} />
                <ListItemText primary={s.user.fullName} secondary={s.title ?? 'Stylist'} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </EditModal>

      <DeleteConfirmModal
        open={Boolean(deactivateTarget)}
        title="Deactivate this service?"
        entityLabel={deactivateTarget?.name}
        description="The service will be hidden from active bookings."
        confirmLabel="Deactivate"
        loading={deactivating}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={confirmDeactivate}
      />
    </Box>
  );
}

