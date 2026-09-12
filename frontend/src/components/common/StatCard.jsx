import clsx from 'clsx';

const COLORS = {
  blue: 'bg-blue-50 text-blue-600',
  teal: 'bg-teal-50 text-teal-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
};

const StatCard = ({ label, value, icon: Icon, color = 'blue', trend }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        {trend && <p className="mt-1 text-xs text-slate-400">{trend}</p>}
      </div>
      {Icon && (
        <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', COLORS[color])}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
