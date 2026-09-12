import { useOutletContext, Link } from 'react-router-dom';
import { CalendarCheck, CalendarClock, XCircle, Search, Stethoscope } from 'lucide-react';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { StatCardSkeleton } from '../../components/common/Skeleton';
import { useFetch } from '../../hooks/useFetch';
import { patientService } from '../../api/patientService';
import { useAuth } from '../../context/AuthContext';
import { formatDateLong, formatTime } from '../../utils/formatters';

const PatientDashboard = () => {
  const { openMobileSidebar } = useOutletContext();
  const { user } = useAuth();
  const { data, loading } = useFetch(() => patientService.getMyDashboardStats().then((r) => r.data), []);

  return (
    <>
      <DashboardTopbar title={`Welcome, ${user?.name?.split(' ')[0]}`} subtitle="Here's what's happening with your health appointments." onOpenMobile={openMobileSidebar} />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {loading ? (
            <>
              <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard label="Upcoming Appointments" value={data?.upcomingCount ?? 0} icon={CalendarClock} color="blue" />
              <StatCard label="Completed Visits" value={data?.completedCount ?? 0} icon={CalendarCheck} color="emerald" />
              <StatCard label="Cancelled / Rejected" value={data?.cancelledCount ?? 0} icon={XCircle} color="rose" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Your next appointment</h2>
              <Link to="/patient/appointments" className="text-sm font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>

            {!loading && !data?.nextAppointment && (
              <div className="mt-4">
                <EmptyState
                  icon={CalendarClock}
                  title="No upcoming appointments"
                  description="Book a consultation with one of our verified doctors."
                  action={
                    <Link to="/doctors">
                      <Button icon={Search}>Find a Doctor</Button>
                    </Link>
                  }
                />
              </div>
            )}

            {data?.nextAppointment && (
              <div className="mt-4 flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={data.nextAppointment.doctor.user.name} src={data.nextAppointment.doctor.user.avatarUrl} size="lg" />
                  <div>
                    <p className="font-semibold text-slate-900">{data.nextAppointment.doctor.user.name}</p>
                    <p className="text-sm text-blue-600">{data.nextAppointment.doctor.specialization.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDateLong(data.nextAppointment.date)} · {formatTime(data.nextAppointment.startTime)}
                    </p>
                  </div>
                </div>
                <Badge status={data.nextAppointment.status} />
              </div>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900">Quick actions</h2>
            <div className="mt-4 space-y-3">
              <Link to="/doctors">
                <Button fullWidth variant="secondary" icon={Search}>Find a Doctor</Button>
              </Link>
              <Link to="/patient/appointments">
                <Button fullWidth variant="secondary" icon={CalendarClock}>My Appointments</Button>
              </Link>
              <Link to="/patient/profile">
                <Button fullWidth variant="secondary" icon={Stethoscope}>Update Medical Profile</Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
};

export default PatientDashboard;
