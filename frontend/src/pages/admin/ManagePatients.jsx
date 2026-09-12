import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Ban, PlayCircle } from 'lucide-react';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import Table from '../../components/common/Table';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useDebounce } from '../../hooks/useDebounce';
import { patientService } from '../../api/patientService';
import { getErrorMessage } from '../../api/axios';
import { formatDate } from '../../utils/formatters';

const ManagePatients = () => {
  const { openMobileSidebar } = useOutletContext();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await patientService.adminGetAll({ search: debouncedSearch, page, limit: 10 });
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => setPage(1), [debouncedSearch]);

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      await patientService.adminUpdateStatus(toggleTarget._id, !toggleTarget.user.isActive);
      toast.success(toggleTarget.user.isActive ? 'Patient account deactivated' : 'Patient account activated');
      setToggleTarget(null);
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
      header: 'Patient',
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
    { key: 'phone', header: 'Phone', render: (row) => row.user.phone },
    { key: 'gender', header: 'Gender', render: (row) => <span className="capitalize">{row.gender?.replace(/_/g, ' ')}</span> },
    { key: 'joined', header: 'Joined', render: (row) => formatDate(row.createdAt) },
    { key: 'status', header: 'Status', render: (row) => <Badge color={row.user.isActive ? 'green' : 'gray'}>{row.user.isActive ? 'Active' : 'Deactivated'}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          icon={row.user.isActive ? Ban : PlayCircle}
          onClick={() => setToggleTarget(row)}
        >
          {row.user.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <>
      <DashboardTopbar title="Manage Patients" subtitle="Search and manage patient accounts." onOpenMobile={openMobileSidebar} />

      <main className="flex-1 p-4 sm:p-6">
        <div className="mb-5 max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
        </div>

        <Table
          columns={columns}
          data={result.data}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle="No patients found"
          emptyDescription="Try adjusting your search."
        />

        {!loading && !error && result.data.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Pagination page={page} pages={result.pages} total={result.total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={toggleTarget?.user?.isActive ? 'Deactivate account' : 'Activate account'}
        message={`${toggleTarget?.user?.isActive ? 'Deactivate' : 'Activate'} ${toggleTarget?.user?.name}'s account?`}
        confirmLabel={toggleTarget?.user?.isActive ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.user?.isActive ? 'danger' : 'success'}
        loading={actionLoading}
      />
    </>
  );
};

export default ManagePatients;
