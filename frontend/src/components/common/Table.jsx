import clsx from 'clsx';
import { TableSkeleton } from './Skeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

/**
 * Generic data table. `columns` = [{ key, header, render?(row) }].
 * Handles its own loading/error/empty states so pages don't repeat that
 * boilerplate everywhere.
 */
const Table = ({ columns, data = [], loading, error, onRetry, emptyTitle, emptyDescription, rowKey = '_id' }) => {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <TableSkeleton cols={columns.length} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row[rowKey] || idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
              {columns.map((col) => (
                <td key={col.key} className={clsx('px-4 py-3.5 align-middle text-slate-700', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
