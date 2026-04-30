import { useState } from 'react';
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
import { useFormik } from 'formik';

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
  const [search, setSearch] = useState('');

  const servicesQuery = useQuery({
    queryKey: ['services', 'all', search],
    queryFn: async () => {
      const { data } = await api.get<ServiceRow[]>('/salon-services', {
        params: { includeInactive: true, q: search.trim() || undefined },
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

  const buildPayload = (values: {
    name: string;
    description: string;
    durationMinutes: string;
    price: string;
    currency: string;
    staffIds: string[];
  }) => ({
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    durationMinutes: Number(values.durationMinutes),
    priceCents: Math.round(Number(values.price || 0) * 100),
    currency: values.currency.trim().toUpperCase() || 'LKR',
    staffIds: values.staffIds,
  });

  const validateValues = (values: {
    name: string;
    durationMinutes: string;
    price: string;
  }) => {
    const errors: Record<string, string> = {};
    if (!values.name.trim()) errors.name = 'Service name is required.';
    const duration = Number(values.durationMinutes);
    if (!Number.isFinite(duration) || duration < 5) errors.durationMinutes = 'Duration must be at least 5 minutes.';
    const priceCents = Math.round(Number(values.price || 0) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) errors.price = 'Price must be zero or more.';
    return errors;
  };

  const createFormik = useFormik({
    initialValues: {
      name: '',
      description: '',
      durationMinutes: '60',
      price: '',
      currency: 'LKR',
      staffIds: [] as string[],
    },
    validate: validateValues,
    onSubmit: async (values, helpers) => {
      setActionError(null);
      setSaving(true);
      try {
        await api.post('/salon-services', buildPayload(values));
        setOpenCreate(false);
        helpers.resetForm();
        await qc.invalidateQueries({ queryKey: ['services'] });
        await qc.invalidateQueries({ queryKey: ['salon-services'] });
      } catch (err) {
        setActionError(getApiErrorMessage(err, 'Could not create service.'));
      } finally {
        setSaving(false);
      }
    },
  });

  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: editing?.name ?? '',
      description: editing?.description ?? '',
      durationMinutes: editing ? String(editing.durationMinutes) : '60',
      price: editing ? String(editing.priceCents / 100) : '',
      currency: editing?.currency || 'LKR',
      staffIds: editing?.staff.map((x) => x.id) ?? [],
    },
    validate: validateValues,
    onSubmit: async (values) => {
      if (!editing) return;
      setActionError(null);
      setSaving(true);
      try {
        await api.patch(`/salon-services/${editing.id}`, buildPayload(values));
        setEditing(null);
        await qc.invalidateQueries({ queryKey: ['services'] });
        await qc.invalidateQueries({ queryKey: ['salon-services'] });
      } catch (err) {
        setActionError(getApiErrorMessage(err, 'Could not update service.'));
      } finally {
        setSaving(false);
      }
    },
  });


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
                createFormik.resetForm();
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
        searchPlaceholder="Service, description, currency, staff"
        searchQuery={search}
        onSearch={(q) => setSearch(q)}
        clientSearch={false}
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
        onSubmit={createFormik.submitForm}
        loading={saving}
      >
        <LabeledTextField
          label="Service name"
          name="name"
          value={createFormik.values.name}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
          error={createFormik.touched.name && Boolean(createFormik.errors.name)}
          helperText={createFormik.touched.name ? createFormik.errors.name : undefined}
          required
        />
        <LabeledTextField
          label="Description"
          name="description"
          value={createFormik.values.description}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
          multiline
          minRows={2}
        />
        <LabeledTextField
          label="Duration (minutes)"
          name="durationMinutes"
          value={createFormik.values.durationMinutes}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
          error={createFormik.touched.durationMinutes && Boolean(createFormik.errors.durationMinutes)}
          helperText={createFormik.touched.durationMinutes ? createFormik.errors.durationMinutes : undefined}
          required
          type="number"
        />
        <LabeledTextField
          label="Price"
          name="price"
          value={createFormik.values.price}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
          error={createFormik.touched.price && Boolean(createFormik.errors.price)}
          helperText={
            createFormik.touched.price && createFormik.errors.price
              ? createFormik.errors.price
              : 'Major units (e.g. 2500.00)'
          }
          required
          type="number"
        />
        <LabeledTextField
          label="Currency"
          name="currency"
          value={createFormik.values.currency}
          onChange={createFormik.handleChange}
          onBlur={createFormik.handleBlur}
          required
        />
        <FormControl fullWidth>
          <InputLabel id="service-create-staff-label" shrink>
            Assign staff
          </InputLabel>
          <Select<string[]>
            multiple
            labelId="service-create-staff-label"
            value={createFormik.values.staffIds}
            onChange={(e: SelectChangeEvent<string[]>) =>
              createFormik.setFieldValue(
                'staffIds',
                typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
              )
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
                <Checkbox checked={createFormik.values.staffIds.includes(s.id)} />
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
        onSubmit={editFormik.submitForm}
        loading={saving}
      >
        <LabeledTextField
          label="Service name"
          name="name"
          value={editFormik.values.name}
          onChange={editFormik.handleChange}
          onBlur={editFormik.handleBlur}
          error={editFormik.touched.name && Boolean(editFormik.errors.name)}
          helperText={editFormik.touched.name ? editFormik.errors.name : undefined}
          required
        />
        <LabeledTextField
          label="Description"
          name="description"
          value={editFormik.values.description}
          onChange={editFormik.handleChange}
          onBlur={editFormik.handleBlur}
          multiline
          minRows={2}
        />
        <LabeledTextField
          label="Duration (minutes)"
          name="durationMinutes"
          value={editFormik.values.durationMinutes}
          onChange={editFormik.handleChange}
          onBlur={editFormik.handleBlur}
          error={editFormik.touched.durationMinutes && Boolean(editFormik.errors.durationMinutes)}
          helperText={editFormik.touched.durationMinutes ? editFormik.errors.durationMinutes : undefined}
          required
          type="number"
        />
        <LabeledTextField
          label="Price"
          name="price"
          value={editFormik.values.price}
          onChange={editFormik.handleChange}
          onBlur={editFormik.handleBlur}
          error={editFormik.touched.price && Boolean(editFormik.errors.price)}
          helperText={
            editFormik.touched.price && editFormik.errors.price
              ? editFormik.errors.price
              : 'Major units (e.g. 2500.00)'
          }
          required
          type="number"
        />
        <LabeledTextField
          label="Currency"
          name="currency"
          value={editFormik.values.currency}
          onChange={editFormik.handleChange}
          onBlur={editFormik.handleBlur}
          required
        />
        <FormControl fullWidth>
          <InputLabel id="service-edit-staff-label" shrink>
            Assign staff
          </InputLabel>
          <Select<string[]>
            multiple
            labelId="service-edit-staff-label"
            value={editFormik.values.staffIds}
            onChange={(e: SelectChangeEvent<string[]>) =>
              editFormik.setFieldValue(
                'staffIds',
                typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
              )
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
                <Checkbox checked={editFormik.values.staffIds.includes(s.id)} />
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

