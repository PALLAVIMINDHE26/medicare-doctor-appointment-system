import { forwardRef } from 'react';
import clsx from 'clsx';

const Textarea = forwardRef(({ label, id, error, required, className, containerClassName, ...props }, ref) => {
  const areaId = id || props.name;
  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label htmlFor={areaId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        aria-invalid={!!error}
        rows={4}
        className={clsx(
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none',
          error ? 'border-rose-400' : 'border-slate-300',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
