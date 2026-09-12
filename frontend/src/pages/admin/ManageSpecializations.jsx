import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { specializationService } from '../../api/specializationService';
import { getErrorMessage } from '../../api/axios';

const EMPTY_FORM = { name: '', description: '', icon: 'Stethoscope' };

const ManageSpecializations = () => {
  const { openMobileSidebar } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await specializationService.getAll({ includeInactive: true });
      setItems(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description, icon: item.icon });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.name.trim().length < 2) {
      toast.error('Please enter a valid name');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await specializationService.update(editing._id, form);
        toast.success('Specialization updated');
      } else {
        await specializationService.create(form);
        toast.success('Specialization created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    try {
      await specializationService.update(item._id, { isActive: !item.isActive });
      toast.success(item.isActive ? 'Deactivated' : 'Activated');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await specializationService.remove(deleteTarget._id);
      toast.success('Specialization deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-slate-800">{row.name}</span> },
    { key: 'description', header: 'Description', className: 'max-w-xs truncate', render: (row) => row.description || '—' },
    { key: 'status', header: 'Status', render: (row) => <Badge color={row.isActive ? 'green' : 'gray'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" icon={Pencil} onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="secondary" onClick={() => toggleActive(row)}>
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button size="sm" variant="outlineDanger" icon={Trash2} onClick={() => setDeleteTarget(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DashboardTopbar
        title="Specializations"
        subtitle="Manage the medical specialties offered on the platform."
        onOpenMobile={openMobileSidebar}
        actions={<Button size="sm" icon={Plus} onClick={openAdd}>Add Specialization</Button>}
      />

      <main className="flex-1 p-4 sm:p-6">
        <Table
          columns={columns}
          data={items}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle="No specializations yet"
          emptyDescription="Add your first specialization to get started."
        />
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit specialization' : 'Add specialization'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input
            label="Icon name"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            helperText="Any lucide-react icon name, e.g. HeartPulse, Brain, Eye"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete specialization"
        message={`Delete "${deleteTarget?.name}"? This is only possible if no doctors are assigned to it.`}
        confirmLabel="Delete"
        loading={actionLoading}
      />
    </>
  );
};

export default ManageSpecializations;
