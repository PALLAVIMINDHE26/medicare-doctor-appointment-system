import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Check, X, Ban, PlayCircle, Trash2 } from 'lucide-react';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import Table from '../../components/common/Table';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AddDoctorModal from '../../components/admin/AddDoctorModal';
import { useDebounce } from '../../hooks/useDebounce';
import { doctorService } from '../../api/doctorService';
import { getErrorMessage } from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';

const STATUS_OPTIONS = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE_COLOR = { approved: 'green', pending: 'amber', rejected: 'red' };

const ManageDoctors = () => {
  const { openMobileSidebar } = useOutletContext();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.adminGetAll({ search: debouncedSearch, status: status || undefined, page, limit: 10 });
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => setPage(1), [debouncedSearch, status]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await doctorService.adminUpdateStatus(id, { status: 'approved' });
      toast.success('Doctor approved');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await doctorService.adminUpdateStatus(id, { status: 'rejected' });
      toast.success('Doctor rejected');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (row) => {
    setActionLoading(true);
    try {
      await doctorService.adminUpdateStatus(row._id, { isActive: !row.isActive });
      toast.success(row.isActive ? 'Doctor deactivated' : 'Doctor activated');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await doctorService.adminDelete(deleteTarget._id);
      toast.success('Doctor deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Doctor',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.user.name} size="sm" />
          <div>
            <p className="font-medium text-slate-800">{row.user.name}</p>
            <p className="text-xs text-slate-400">{row.user.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'specialization', header: 'Specialization', render: (row) => row.specialization.name },
    { key: 'fee', header: 'Fee', render: (row) => formatCurrency(row.consultationFee) },
    { key: 'experience', header: 'Experience', render: (row) => `${row.experienceYears} yrs` },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge color={STATUS_BADGE_COLOR[row.status]}>{row.status}</Badge>
          {!row.isActive && <Badge color="gray">Deactivated</Badge>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.status === 'pending' && (
            <>
              <Button size="sm" variant="success" icon={Check} onClick={() => handleApprove(row._id)}>Approve</Button>
              <Button size="sm" variant="outlineDanger" icon={X} onClick={() => handleReject(row._id)}>Reject</Button>
            </>
          )}
          {row.status === 'approved' && (
            <Button
              size="sm"
              variant="secondary"
              icon={row.isActive ? Ban : PlayCircle}
              onClick={() => handleToggleActive(row)}
            >
              {row.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
          <Button size="sm" variant="outlineDanger" icon={Trash2} onClick={() => setDeleteTarget(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DashboardTopbar
        title="Manage Doctors"
        subtitle="Approve, activate and manage doctor accounts."
        onOpenMobile={openMobileSidebar}
        actions={<Button size="sm" icon={Plus} onClick={() => setAddOpen(true)}>Add Doctor</Button>}
      />

      <main className="flex-1 p-4 sm:p-6">
        <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
          <Select placeholder="All statuses" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>

        <Table
          columns={columns}
          data={result.data}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle="No doctors found"
          emptyDescription="Try adjusting your search or add a new doctor."
        />

        {!loading && !error && result.data.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Pagination page={page} pages={result.pages} total={result.total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </main>

      <AddDoctorModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSuccess={load} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete doctor"
        message={`This will permanently delete ${deleteTarget?.user?.name}'s account. This cannot be undone.`}
        confirmLabel="Delete Doctor"
        loading={actionLoading}
      />
    </>
  );
};

export default ManageDoctors;
