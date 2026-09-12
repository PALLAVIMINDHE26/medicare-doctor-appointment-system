import { InboxIcon } from 'lucide-react';

const EmptyState = ({ icon: Icon = InboxIcon, title = 'Nothing here yet', description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
