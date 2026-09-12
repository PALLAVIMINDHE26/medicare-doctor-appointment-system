export const APPOINTMENT_STATUS_STYLES = {
  pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  completed: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-200', text: 'text-slate-700', dot: 'bg-slate-500' },
  rejected: { label: 'Rejected', bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-500' },
  'no-show': { label: 'No-show', bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
};

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'];
