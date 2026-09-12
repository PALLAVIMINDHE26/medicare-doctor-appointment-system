import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

/** Simple, accessible page-number pagination with prev/next. */
const Pagination = ({ page, pages, onPageChange, total, limit }) => {
  if (pages <= 1) return null;

  const pageNumbers = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i += 1) pageNumbers.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{Math.min((page - 1) * limit + 1, total)}</span>–
        <span className="font-medium text-slate-700">{Math.min(page * limit, total)}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageNumbers.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium',
              p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
