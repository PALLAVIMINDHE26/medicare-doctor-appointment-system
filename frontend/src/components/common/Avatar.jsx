import { initials } from '../../utils/formatters';
import clsx from 'clsx';

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' };
const PALETTE = ['bg-blue-100 text-blue-700', 'bg-teal-100 text-teal-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700'];

const hashColor = (str = '') => {
  const sum = str.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
};

const Avatar = ({ name = '', src, size = 'md', className }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx('rounded-full object-cover', SIZES[size], className)}
      />
    );
  }
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full font-semibold',
        SIZES[size],
        hashColor(name),
        className
      )}
      aria-label={name}
    >
      {initials(name) || '?'}
    </div>
  );
};

export default Avatar;
