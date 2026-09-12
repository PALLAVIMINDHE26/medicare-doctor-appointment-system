import clsx from 'clsx';
import { APPOINTMENT_STATUS_STYLES } from '../../utils/constants';

/** Generic colored pill badge, or pass `status` to auto-style by appointment status. */
const Badge = ({ children, status, color, className }) => {
  if (status) {
    const s = APPOINTMENT_STATUS_STYLES[status] || APPOINTMENT_STATUS_STYLES.pending;
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
          s.bg,
          s.text,
          className
        )}
      >
        <span className={clsx('h-1.5 w-1.5 rounded-full', s.dot)} />
        {s.label}
      </span>
    );
  }

  const colorMap = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-emerald-100 text-emerald-800',
    red: 'bg-rose-100 text-rose-800',
    gray: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-800',
  };

  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', colorMap[color] || colorMap.gray, className)}>
      {children}
    </span>
  );
};

export default Badge;
