import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const Select = forwardRef(
  ({ label, id, error, options = [], placeholder, required, className, containerClassName, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className={clsx('w-full', containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={clsx(
              'w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-900',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              error ? 'border-rose-400' : 'border-slate-300',
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) =>
              typeof opt === 'string' ? (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ) : (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              )
            )}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
