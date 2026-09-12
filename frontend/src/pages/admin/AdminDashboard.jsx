import { useOutletContext } from 'react-router-dom';
import { Stethoscope, Users, CalendarClock, IndianRupee, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { StatCardSkeleton } from '../../components/common/Skeleton';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../api/adminService';
import { formatCurrency } from '../../utils/formatters';

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#10b981',
  cancelled: '#94a3b8',
  rejected: '#f43f5e',
  'no-show': '#fb923c',
};

const AdminDashboard = () => {
  const { openMobileSidebar } = useOutletContext();
  const { data, loading } = useFetch(() => adminService.getDashboardStats().then((r) => r.data), []);

  const trendData = (data?.appointmentsByDay || []).map((d) => ({
    date: new Date(d._id).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    bookings: d.count,
  }));

  const pieData = data
    ? Object.entries(data.statusCounts)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({ name: status, value: count }))
    : [];

  const specData = (data?.topSpecializations || []).map((s) => ({ name: s._id, count: s.count }));

  return (
    <>
      <DashboardTopbar title="Admin Dashboard" subtitle="System-wide overview and analytics." onOpenMobile={openMobileSidebar} />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {loading ? (
            <>
              <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard label="Active Doctors" value={data.activeDoctors} icon={Stethoscope} color="blue" trend={`${data.pendingDoctors} pending approval`} />
              <StatCard label="Total Patients" value={data.totalPatients} icon={Users} color="teal" />
              <StatCard label="Total Appointments" value={data.totalAppointments} icon={CalendarClock} color="violet" />
              <StatCard label="Today's Appointments" value={data.todayAppointments} icon={Clock} color="amber" />
              <StatCard label="Revenue (Completed)" value={formatCurrency(data.totalRevenue)} icon={IndianRupee} color="emerald" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="font-semibold text-slate-900">Booking trend — last 30 days</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                  <Line type="monotone" dataKey="bookings" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900">Appointment status</h2>
            <div className="mt-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {pieData.map((s) => (
                <Badge key={s.name} status={s.name} />
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="font-semibold text-slate-900">Top specializations by bookings</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: '#334155' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </main>
    </>
  );
};

export default AdminDashboard;
