import { Calendar, Clock, IndianRupee } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';

const PatientAppointmentCard = ({ appointment, onCancel, onReschedule }) => {
  const canAct = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Avatar name={appointment.doctor.user.name} src={appointment.doctor.user.avatarUrl} size="lg" />
        <div>
          <p className="font-semibold text-slate-900">{appointment.doctor.user.name}</p>
          <p className="text-sm text-blue-600">{appointment.doctor.specialization.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(appointment.date)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatTime(appointment.startTime)}</span>
            <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> {formatCurrency(appointment.consultationFee)}</span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 line-clamp-1">{appointment.reasonForVisit}</p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <Badge status={appointment.status} />
        {canAct && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => onReschedule(appointment)}>
              Reschedule
            </Button>
            <Button size="sm" variant="outlineDanger" onClick={() => onCancel(appointment)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointmentCard;
