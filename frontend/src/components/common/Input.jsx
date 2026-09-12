import { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Accessible text input with label, error state and optional helper text.
 * Forwards refs so it plays nicely with form libraries / focus management.
 */
const Input = forwardRef(
  ({ label, id, error, helperText, icon: Icon, required, className, containerClassName, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className={clsx('w-full', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={clsx(
              'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              Icon && 'pl-10',
              error ? 'border-rose-400' : 'border-slate-300',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-rose-600">
            {error}
          </p>
        )}
        {!error && helperText && <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
