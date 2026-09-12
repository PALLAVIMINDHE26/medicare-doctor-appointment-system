import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { doctorService } from '../../api/doctorService';
import { appointmentService } from '../../api/appointmentService';
import { getErrorMessage } from '../../api/axios';
import { formatTime, toDateInputValue } from '../../utils/formatters';

const nextNDays = (n) =>
  Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

const RescheduleModal = ({ appointment, isOpen, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(toDateInputValue(new Date()));
      setSelectedSlot(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !appointment) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    doctorService
      .getAvailability(appointment.doctor._id, selectedDate)
      .then((res) => setSlots(res.slots))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingSlots(false));
  }, [isOpen, appointment, selectedDate]);

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      await appointmentService.reschedule(appointment._id, { date: selectedDate, startTime: selectedSlot });
      toast.success('Appointment rescheduled. Awaiting doctor confirmation.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule appointment" size="lg">
      <p className="text-sm text-slate-500">
        Rescheduling with <span className="font-medium text-slate-800">{appointment.doctor.user.name}</span>.
        This will require the doctor to re-confirm.
      </p>

      <div className="mt-4">
        <p className="mb-1.5 text-sm font-medium text-slate-700">Select a new date</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {nextNDays(14).map((d) => {
            const value = toDateInputValue(d);
            const isActive = value === selectedDate;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedDate(value)}
                className={`flex min-w-[52px] flex-col items-center rounded-lg border px-2 py-2 text-xs font-medium ${
                  isActive ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                <span>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="text-sm font-bold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-sm font-medium text-slate-700">Available slots</p>
        {loadingSlots ? (
          <div className="py-6"><Spinner /></div>
        ) : slots.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">No slots available on this date.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.startTime}
                type="button"
                onClick={() => setSelectedSlot(slot.startTime)}
                className={`rounded-lg border py-2 text-xs font-medium ${
                  selectedSlot === slot.startTime ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                {formatTime(slot.startTime)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedSlot} loading={submitting}>
          Confirm New Time
        </Button>
      </div>
    </Modal>
  );
};

export default RescheduleModal;
