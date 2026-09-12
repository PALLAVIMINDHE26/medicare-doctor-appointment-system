import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({ message = 'Something went wrong while loading this data.', onRetry }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-6 py-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
      <AlertTriangle className="h-7 w-7" />
    </div>
    <h3 className="text-base font-semibold text-slate-800">We hit a snag</h3>
    <p className="mt-1.5 max-w-sm text-sm text-slate-500">{message}</p>
    {onRetry && (
      <div className="mt-5">
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      </div>
    )}
  </div>
);

export default ErrorState;
