import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Briefcase,
  IndianRupee,
  MapPin,
  Languages,
  Clock,
  Calendar as CalendarIcon,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import { doctorService } from '../../api/doctorService';
import { appointmentService } from '../../api/appointmentService';
import { getErrorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatTime, toDateInputValue } from '../../utils/formatters';
import { WEEKDAYS } from '../../utils/constants';

const nextNDays = (n) =>
  Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);

  const loadDoctor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.getById(id);
      setDoctor(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDoctor();
  }, [loadDoctor]);

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const res = await doctorService.getAvailability(id, selectedDate);
      setSlots(res.slots);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [id, selectedDate]);

  useEffect(() => {
    if (doctor) loadSlots();
  }, [doctor, loadSlots]);

  const openBooking = () => {
    if (!isAuthenticated) {
      toast('Please log in to book an appointment', { icon: '🔒' });
      navigate('/login');
      return;
    }
    if (role !== 'patient') {
      toast.error('Only patient accounts can book appointments');
      return;
    }
    setBookingOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!reason.trim() || reason.trim().length < 3) {
      toast.error('Please describe the reason for your visit (min 3 characters)');
      return;
    }
    setBooking(true);
    try {
      await appointmentService.book({
        doctorId: id,
        date: selectedDate,
        startTime: selectedSlot,
        reasonForVisit: reason.trim(),
      });
      toast.success('Appointment booked! Waiting for doctor confirmation.');
      setBookingOpen(false);
      setReason('');
      loadSlots();
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(getErrorMessage(err));
      loadSlots(); // refresh in case the slot was taken by someone else
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNavbar />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <ErrorState message={error || 'Doctor not found'} onRetry={loadDoctor} />
        </div>
      </div>
    );
  }

  const workingDayNames = doctor.workingHours.filter((wh) => wh.isWorking).map((wh) => wh.day);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/doctors')}
          className="mb-5 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to search
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: profile */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <Avatar name={doctor.user.name} src={doctor.user.avatarUrl} size="xl" />
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-slate-900">{doctor.user.name}</h1>
                  <p className="text-blue-600">{doctor.specialization.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{doctor.qualifications}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-slate-700">{doctor.rating?.toFixed(1) || 'New'}</span>
                    {doctor.totalReviews > 0 && <span className="text-slate-400">({doctor.totalReviews} reviews)</span>}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400"><Briefcase className="h-3.5 w-3.5" /> Experience</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{doctor.experienceYears} years</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400"><IndianRupee className="h-3.5 w-3.5" /> Fee</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{formatCurrency(doctor.consultationFee)}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" /> Duration</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{doctor.appointmentDurationMinutes} min</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400"><Languages className="h-3.5 w-3.5" /> Speaks</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{(doctor.languages || []).join(', ')}</p>
                </div>
              </div>
            </Card>

            {doctor.bio && (
              <Card>
                <h2 className="font-semibold text-slate-900">About</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{doctor.bio}</p>
              </Card>
            )}

            {doctor.clinicAddress && (
              <Card>
                <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                  <MapPin className="h-4 w-4" /> Clinic Address
                </h2>
                <p className="mt-2 text-sm text-slate-600">{doctor.clinicAddress}</p>
              </Card>
            )}

            <Card>
              <h2 className="font-semibold text-slate-900">Weekly Availability</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <Badge key={day} color={workingDayNames.includes(day) ? 'blue' : 'gray'}>
                    {day.slice(0, 3)}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: booking widget */}
          <div>
            <Card className="sticky top-20">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <CalendarIcon className="h-4 w-4" /> Book an appointment
              </h2>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Select a date</label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {nextNDays(14).map((d) => {
                    const value = toDateInputValue(d);
                    const isActive = value === selectedDate;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedDate(value)}
                        className={`flex min-w-[56px] flex-col items-center rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
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
                {slotsLoading ? (
                  <div className="py-6"><Spinner /></div>
                ) : slots.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                    No slots available on this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => setSelectedSlot(slot.startTime)}
                        className={`rounded-lg border py-2 text-xs font-medium transition-colors ${
                          selectedSlot === slot.startTime
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button fullWidth className="mt-5" disabled={!selectedSlot} onClick={openBooking}>
                {selectedSlot ? `Book ${formatTime(selectedSlot)}` : 'Select a time slot'}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      <Modal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Confirm your appointment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBookingOpen(false)} disabled={booking}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} loading={booking}>
              Confirm Booking
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4 text-sm">
            <p className="font-medium text-slate-800">{doctor.user.name} · {doctor.specialization.name}</p>
            <p className="mt-1 text-slate-500">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}{' '}
              at {formatTime(selectedSlot)}
            </p>
            <p className="mt-1 text-slate-500">Consultation fee: {formatCurrency(doctor.consultationFee)}</p>
          </div>
          <Textarea
            label="Reason for visit"
            required
            placeholder="Briefly describe your symptoms or reason for consultation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DoctorProfile;
