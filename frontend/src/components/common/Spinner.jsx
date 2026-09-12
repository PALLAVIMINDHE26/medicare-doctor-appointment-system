import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Spinner = ({ className, size = 24, label = 'Loading' }) => (
  <div className="flex items-center justify-center gap-2 text-slate-500" role="status" aria-live="polite">
    <Loader2 className={clsx('animate-spin', className)} size={size} />
    <span className="sr-only">{label}</span>
  </div>
);

export default Spinner;
