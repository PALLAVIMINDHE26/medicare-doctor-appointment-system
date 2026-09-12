import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { CalendarClock, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import PatientAppointmentCard from '../../components/patient/PatientAppointmentCard';
import RescheduleModal from '../../components/patient/RescheduleModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { CardSkeleton } from '../../components/common/Skeleton';
import { appointmentService } from '../../api/appointmentService';
import { getErrorMessage } from '../../api/axios';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

const PatientAppointments = () => {
  const { openMobileSidebar } = useOutletContext();
  const [tab, setTab] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentService.getMyAsPatient({ timeframe: tab, page, limit: 8 });
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setPage(1), [tab]);

  const handleCancelConfirm = async (cancelReason) => {
    setCancelling(true);
    try {
      await appointmentService.cancel(cancelTarget._id, cancelReason);
      toast.success('Appointment cancelled');
      setCancelTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <DashboardTopbar
        title="My Appointments"
        subtitle="Track, reschedule or cancel your bookings."
        onOpenMobile={openMobileSidebar}
        actions={
          <Link to="/doctors">
            <Button size="sm" icon={Search}>Book New</Button>
          </Link>
        }
      />

      <main className="flex-1 p-4 sm:p-6">
        <div className="mb-5 flex gap-2 rounded-lg bg-slate-200/60 p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={clsx(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : result.data.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={tab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
            description={tab === 'upcoming' ? 'Book a consultation to see it here.' : 'Your appointment history will appear here.'}
            action={tab === 'upcoming' && (
              <Link to="/doctors"><Button icon={Search}>Find a Doctor</Button></Link>
            )}
          />
        ) : (
          <>
            <div className="space-y-4">
              {result.data.map((appt) => (
                <PatientAppointmentCard
                  key={appt._id}
                  appointment={appt}
                  onCancel={setCancelTarget}
                  onReschedule={setRescheduleTarget}
                />
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Pagination page={page} pages={result.pages} total={result.total} limit={8} onPageChange={setPage} />
            </div>
          </>
        )}
      </main>

      <RescheduleModal
        appointment={rescheduleTarget}
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={load}
      />

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel appointment"
        message={`Are you sure you want to cancel your appointment with ${cancelTarget?.doctor?.user?.name}? This cannot be undone.`}
        confirmLabel="Yes, cancel it"
        requireReason
        reasonLabel="Reason for cancelling (optional)"
        loading={cancelling}
      />
    </>
  );
};

export default PatientAppointments;
