import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { XCircle } from 'lucide-react';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import Table from '../../components/common/Table';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { appointmentService } from '../../api/appointmentService';
import { getErrorMessage } from '../../api/axios';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'no-show', label: 'No-show' },
];

const ManageAppointments = () => {
  const { openMobileSidebar } = useOutletContext();
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentService.adminGetAll({
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 10,
      });
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => setPage(1), [status, dateFrom, dateTo]);

  const handleCancel = async (reason) => {
    setActionLoading(true);
    try {
      await appointmentService.cancel(cancelTarget._id, reason);
      toast.success('Appointment cancelled');
      setCancelTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.patient.user.name} size="sm" />
          <span className="font-medium text-slate-800">{row.patient.user.name}</span>
        </div>
      ),
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.doctor.user.name}</p>
          <p className="text-xs text-slate-400">{row.doctor.specialization.name}</p>
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'time', header: 'Time', render: (row) => formatTime(row.startTime) },
    { key: 'fee', header: 'Fee', render: (row) => formatCurrency(row.consultationFee) },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        ['pending', 'confirmed'].includes(row.status) ? (
          <Button size="sm" variant="outlineDanger" icon={XCircle} onClick={() => setCancelTarget(row)}>
            Cancel
          </Button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <>
      <DashboardTopbar title="All Appointments" subtitle="System-wide appointment records." onOpenMobile={openMobileSidebar} />

      <main className="flex-1 p-4 sm:p-6">
        <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
          <Select placeholder="All statuses" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
          {(status || dateFrom || dateTo) && (
            <Button variant="ghost" onClick={() => { setStatus(''); setDateFrom(''); setDateTo(''); }}>
              Clear filters
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          data={result.data}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle="No appointments found"
          emptyDescription="Try adjusting your filters."
        />

        {!loading && !error && result.data.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Pagination page={page} pages={result.pages} total={result.total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel appointment"
        message="This will cancel the appointment and notify both parties."
        confirmLabel="Yes, cancel it"
        requireReason
        loading={actionLoading}
      />
    </>
  );
};

export default ManageAppointments;
