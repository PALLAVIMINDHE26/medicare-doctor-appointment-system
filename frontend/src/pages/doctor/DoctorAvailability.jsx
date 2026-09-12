import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import { doctorService } from '../../api/doctorService';
import { getErrorMessage } from '../../api/axios';
import { WEEKDAYS } from '../../utils/constants';

const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

const DURATION_OPTIONS = [15, 20, 30, 45, 60].map((v) => ({ value: v, label: `${v} minutes` }));

const DoctorAvailability = () => {
  const { openMobileSidebar } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingHours, setWorkingHours] = useState([]);
  const [duration, setDuration] = useState(30);
  const [durationSaving, setDurationSaving] = useState(false);

  useEffect(() => {
    doctorService
      .getMyProfile()
      .then((res) => {
        setWorkingHours(res.data.workingHours);
        setDuration(res.data.appointmentDurationMinutes);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const updateDay = (day, field, value) => {
    setWorkingHours((prev) => prev.map((wh) => (wh.day === day ? { ...wh, [field]: value } : wh)));
  };

  const handleSaveHours = async () => {
    for (const wh of workingHours) {
      if (wh.isWorking && wh.startTime >= wh.endTime) {
        toast.error(`${wh.day}: start time must be before end time`);
        return;
      }
    }
    setSaving(true);
    try {
      await doctorService.updateMyWorkingHours(workingHours);
      toast.success('Working hours updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDuration = async () => {
    setDurationSaving(true);
    try {
      await doctorService.updateMyProfile({ appointmentDurationMinutes: Number(duration) });
      toast.success('Appointment duration updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDurationSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <>
      <DashboardTopbar title="Availability" subtitle="Set your weekly working hours and slot duration." onOpenMobile={openMobileSidebar} />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <Card>
          <h2 className="font-semibold text-slate-900">Appointment slot duration</h2>
          <p className="mt-1 text-sm text-slate-500">This determines how time is divided into bookable slots.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Select
              label="Duration per appointment"
              options={DURATION_OPTIONS}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              containerClassName="max-w-xs"
            />
            <Button variant="secondary" onClick={handleSaveDuration} loading={durationSaving}>Save Duration</Button>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900">Weekly working hours</h2>
          <p className="mt-1 text-sm text-slate-500">Toggle a day on/off and set your available hours.</p>

          <div className="mt-4 space-y-3">
            {WEEKDAYS.map((day) => {
              const wh = workingHours.find((w) => w.day === day) || { day, isWorking: false, startTime: '09:00', endTime: '17:00' };
              return (
                <div
                  key={day}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <label className="flex w-32 items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={wh.isWorking}
                      onClick={() => updateDay(day, 'isWorking', !wh.isWorking)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${wh.isWorking ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          wh.isWorking ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-slate-800">{day}</span>
                  </label>

                  {wh.isWorking ? (
                    <div className="flex items-center gap-2">
                      <Select
                        options={TIME_OPTIONS}
                        value={wh.startTime}
                        onChange={(e) => updateDay(day, 'startTime', e.target.value)}
                        containerClassName="w-32"
                      />
                      <span className="text-slate-400">to</span>
                      <Select
                        options={TIME_OPTIONS}
                        value={wh.endTime}
                        onChange={(e) => updateDay(day, 'endTime', e.target.value)}
                        containerClassName="w-32"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Not working</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <Button icon={Save} onClick={handleSaveHours} loading={saving}>Save Working Hours</Button>
          </div>
        </Card>
      </main>
    </>
  );
};

export default DoctorAvailability;
