import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, X, CalendarCheck, UserX, CalendarX2 } from 'lucide-react';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import Table from '../../components/common/Table';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CompleteModal from '../../components/doctor/CompleteModal';
import { appointmentService } from '../../api/appointmentService';
import { getErrorMessage } from '../../api/axios';
import { formatDate, formatTime } from '../../utils/formatters';

const STATUS_FILTER_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'no-show', label: 'No-show' },
];

const DoctorAppointments = () => {
  const { openMobileSidebar } = useOutletContext();
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [noShowTarget, setNoShowTarget] = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentService.getMyAsDoctor({
        status: status || undefined,
        date: date || undefined,
        page,
        limit: 10,
      });
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, date, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => setPage(1), [status, date]);

  const handleConfirm = async (id) => {
    setActionLoading(true);
    try {
      await appointmentService.confirm(id);
      toast.success('Appointment confirmed');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    try {
      await appointmentService.reject(rejectTarget._id, reason);
      toast.success('Appointment rejected');
      setRejectTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

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

  const handleNoShow = async () => {
    setActionLoading(true);
    try {
      await appointmentService.markNoShow(noShowTarget._id);
      toast.success('Marked as no-show');
      setNoShowTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (notes) => {
    setActionLoading(true);
    try {
      await appointmentService.complete(completeTarget._id, notes);
      toast.success('Appointment marked as completed');
      setCompleteTarget(null);
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
        <div className="flex items-center gap-3">
          <Avatar name={row.patient.user.name} src={row.patient.user.avatarUrl} size="sm" />
          <div>
            <p className="font-medium text-slate-800">{row.patient.user.name}</p>
            <p className="text-xs text-slate-400">{row.patient.user.phone}</p>
          </div>
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'time', header: 'Time', render: (row) => formatTime(row.startTime) },
    { key: 'reason', header: 'Reason', className: 'max-w-[220px] truncate', render: (row) => row.reasonForVisit },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.status === 'pending' && (
            <>
              <Button size="sm" variant="success" icon={Check} onClick={() => handleConfirm(row._id)}>Confirm</Button>
              <Button size="sm" variant="outlineDanger" icon={X} onClick={() => setRejectTarget(row)}>Reject</Button>
            </>
          )}
          {row.status === 'confirmed' && (
            <>
              <Button size="sm" variant="success" icon={CalendarCheck} onClick={() => setCompleteTarget(row)}>Complete</Button>
              <Button size="sm" variant="secondary" icon={UserX} onClick={() => setNoShowTarget(row)}>No-show</Button>
              <Button size="sm" variant="outlineDanger" icon={CalendarX2} onClick={() => setCancelTarget(row)}>Cancel</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DashboardTopbar title="Appointments" subtitle="Confirm, reject and manage patient bookings." onOpenMobile={openMobileSidebar} />

      <main className="flex-1 p-4 sm:p-6">
        <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
          <Select
            placeholder="All statuses"
            options={STATUS_FILTER_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {(status || date) && (
            <Button variant="ghost" onClick={() => { setStatus(''); setDate(''); }}>
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
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        title="Reject appointment"
        message={`Reject the appointment request from ${rejectTarget?.patient?.user?.name}?`}
        confirmLabel="Reject"
        requireReason
        reasonLabel="Reason for rejecting (optional)"
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel appointment"
        message={`Cancel the confirmed appointment with ${cancelTarget?.patient?.user?.name}?`}
        confirmLabel="Yes, cancel it"
        requireReason
        reasonLabel="Reason for cancelling (optional)"
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={!!noShowTarget}
        onClose={() => setNoShowTarget(null)}
        onConfirm={handleNoShow}
        title="Mark as no-show"
        message={`Mark ${noShowTarget?.patient?.user?.name} as a no-show for this appointment?`}
        confirmLabel="Mark No-show"
        variant="danger"
        loading={actionLoading}
      />

      <CompleteModal
        appointment={completeTarget}
        isOpen={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        onConfirm={handleComplete}
        loading={actionLoading}
      />
    </>
  );
};

export default DoctorAppointments;
