import { useOutletContext, Link } from 'react-router-dom';
import { CalendarClock, Users, ClipboardCheck, CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { StatCardSkeleton } from '../../components/common/Skeleton';
import { useFetch } from '../../hooks/useFetch';
import { doctorService } from '../../api/doctorService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTime } from '../../utils/formatters';

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#10b981',
  cancelled: '#94a3b8',
  rejected: '#f43f5e',
  'no-show': '#fb923c',
};

const DoctorDashboard = () => {
  const { openMobileSidebar } = useOutletContext();
  const { user } = useAuth();
  const { data, loading } = useFetch(() => doctorService.getMyDashboardStats().then((r) => r.data), []);

  const chartData = (data?.last7Days || []).map((d) => ({
    date: new Date(d._id).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    appointments: d.count,
  }));

  const statusData = data
    ? Object.entries(data.statusCounts).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <>
      <DashboardTopbar title={`Welcome, Dr. ${user?.name?.split(' ').pop()}`} subtitle="Here's your practice overview." onOpenMobile={openMobileSidebar} />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard label="Today's Appointments" value={data.todayAppointments} icon={CalendarDays} color="blue" />
              <StatCard label="Total Appointments" value={data.totalAppointments} icon={CalendarClock} color="violet" />
              <StatCard label="Total Patients" value={data.totalPatients} icon={Users} color="teal" />
              <StatCard label="Completed" value={data.statusCounts.completed} icon={ClipboardCheck} color="emerald" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="font-semibold text-slate-900">Appointments — last 7 days</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                  <Bar dataKey="appointments" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900">Status breakdown</h2>
            <div className="mt-4 space-y-3">
              {statusData.map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                    <span className="capitalize text-slate-600">{status}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Upcoming appointments</h2>
            <Link to="/doctor/appointments" className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>

          {!loading && data.upcomingAppointments.length === 0 && (
            <div className="mt-4">
              <EmptyState icon={CalendarClock} title="No upcoming appointments" description="New bookings will appear here." />
            </div>
          )}

          {!loading && data.upcomingAppointments.length > 0 && (
            <div className="mt-4 divide-y divide-slate-100">
              {data.upcomingAppointments.map((appt) => (
                <div key={appt._id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={appt.patient.user.name} src={appt.patient.user.avatarUrl} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{appt.patient.user.name}</p>
                      <p className="text-xs text-slate-500">{formatDate(appt.date)} · {formatTime(appt.startTime)}</p>
                    </div>
                  </div>
                  <Badge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </>
  );
};

export default DoctorDashboard;
