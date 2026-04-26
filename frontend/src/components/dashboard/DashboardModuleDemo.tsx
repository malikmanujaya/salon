import { useMemo, useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import {
  AppDataTable,
  CreateModal,
  DeleteConfirmModal,
  EditModal,
  LabeledSelect,
  LabeledTextField,
  PageHeader,
  SearchableDropdown,
  type AppTableColumn,
  type SearchableOption,
  type SelectChangeEvent,
} from '../ui';

type DemoRow = { id: string; time: string; client: string; service: string };

const columns: AppTableColumn<DemoRow>[] = [
  { id: 'time', label: 'Time', minWidth: 88 },
  { id: 'client', label: 'Client', minWidth: 140 },
  { id: 'service', label: 'Service', minWidth: 160 },
];

const staffOptions: SearchableOption[] = [
  { value: 'any', label: 'Any stylist' },
  { value: 'nimesha', label: 'Nimesha' },
  { value: 'tharushi', label: 'Tharushi' },
];

export type DashboardModuleDemoProps = {
  title: string;
  description: string;
};

/**
 * Shared “module shell” preview: filters + table + create / edit / delete modals using the UI kit.
 */
export function DashboardModuleDemo({ title, description }: DashboardModuleDemoProps) {
  const [branch, setBranch] = useState('colombo');
  const [staff, setStaff] = useState<SearchableOption | null>(staffOptions[0] ?? null);
  const [rows, setRows] = useState<DemoRow[]>([
    { id: '1', time: '10:00', client: 'Nimesha P.', service: 'Bridal trial' },
    { id: '2', time: '11:30', client: 'Tharushi D.', service: 'Hair colour' },
  ]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [active, setActive] = useState<DemoRow | null>(null);
  const [formTime, setFormTime] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formService, setFormService] = useState('');
  const [saving, setSaving] = useState(false);

  const branchOptions = useMemo(
    () => [
      { value: 'colombo', label: 'Colombo flagship' },
      { value: 'kandy', label: 'Kandy branch' },
    ],
    [],
  );

  const openCreate = () => {
    setFormTime('');
    setFormClient('');
    setFormService('');
    setCreateOpen(true);
  };

  const openEdit = (row: DemoRow) => {
    setActive(row);
    setFormTime(row.time);
    setFormClient(row.client);
    setFormService(row.service);
    setEditOpen(true);
  };

  const openDelete = (row: DemoRow) => {
    setActive(row);
    setDeleteOpen(true);
  };

  const handleCreateSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const id = String(Date.now());
    setRows((r) => [...r, { id, time: formTime || '—', client: formClient || 'Walk-in', service: formService || 'Service' }]);
    setSaving(false);
    setCreateOpen(false);
  };

  const handleEditSave = async () => {
    if (!active) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setRows((list) =>
      list.map((r) =>
        r.id === active.id ? { ...r, time: formTime, client: formClient, service: formService } : r,
      ),
    );
    setSaving(false);
    setEditOpen(false);
    setActive(null);
  };

  const handleDeleteConfirm = async () => {
    if (!active) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    setRows((list) => list.filter((r) => r.id !== active.id));
    setSaving(false);
    setDeleteOpen(false);
    setActive(null);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
            New row
          </Button>
        }
      />

      <AppDataTable<DemoRow>
        columns={columns}
        rows={rows}
        onEdit={openEdit}
        onDelete={openDelete}
        toolbar={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', alignItems: { sm: 'center' } }}>
            <Box sx={{ minWidth: { sm: 200 }, flex: { sm: '0 0 200px' } }}>
              <LabeledSelect
                label="Branch"
                value={branch}
                onChange={(e: SelectChangeEvent<string>) => setBranch(e.target.value)}
                options={branchOptions}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: { sm: 220 } }}>
              <SearchableDropdown
                label="Assignee"
                options={staffOptions}
                value={staff}
                onChange={(_, v) => setStaff(v)}
              />
            </Box>
          </Stack>
        }
      />

      <CreateModal
        open={createOpen}
        onClose={() => !saving && setCreateOpen(false)}
        title="Add booking row"
        subtitle="Demo only — wired to local state."
        loading={saving}
        onSubmit={handleCreateSave}
      >
        <LabeledTextField label="Time" value={formTime} onChange={(e) => setFormTime(e.target.value)} placeholder="10:30" />
        <LabeledTextField label="Client" value={formClient} onChange={(e) => setFormClient(e.target.value)} required />
        <LabeledTextField label="Service" value={formService} onChange={(e) => setFormService(e.target.value)} />
      </CreateModal>

      <EditModal
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        title="Edit booking row"
        loading={saving}
        onSubmit={handleEditSave}
      >
        <LabeledTextField label="Time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
        <LabeledTextField label="Client" value={formClient} onChange={(e) => setFormClient(e.target.value)} required />
        <LabeledTextField label="Service" value={formService} onChange={(e) => setFormService(e.target.value)} />
      </EditModal>

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => !saving && setDeleteOpen(false)}
        entityLabel={active ? `${active.client} · ${active.time}` : undefined}
        loading={saving}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
