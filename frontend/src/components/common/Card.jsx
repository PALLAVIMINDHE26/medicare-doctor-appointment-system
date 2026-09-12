import clsx from 'clsx';

const Card = ({ children, className, padding = true, ...props }) => (
  <div
    className={clsx(
      'rounded-xl border border-slate-200 bg-white shadow-sm',
      padding && 'p-5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card;
