import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { doctorService } from '../../api/doctorService';
import { specializationService } from '../../api/specializationService';
import { getErrorMessage } from '../../api/axios';

const DURATION_OPTIONS = [15, 20, 30, 45, 60].map((v) => ({ value: v, label: `${v} minutes` }));

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  qualifications: '',
  experienceYears: '',
  consultationFee: '',
  appointmentDurationMinutes: 30,
  bio: '',
  clinicAddress: '',
};

const AddDoctorModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [specializations, setSpecializations] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      specializationService.getAll().then((res) => setSpecializations(res.data)).catch(() => {});
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen]);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password || form.password.length < 8 || !/\d/.test(form.password)) errs.password = 'Min 8 chars, 1 number';
    if (!form.phone || form.phone.trim().length < 7) errs.phone = 'Required';
    if (!form.specialization) errs.specialization = 'Required';
    if (!form.qualifications) errs.qualifications = 'Required';
    if (form.experienceYears === '' || Number(form.experienceYears) < 0) errs.experienceYears = 'Required';
    if (form.consultationFee === '' || Number(form.consultationFee) < 0) errs.consultationFee = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await doctorService.adminCreate({
        ...form,
        experienceYears: Number(form.experienceYears),
        consultationFee: Number(form.consultationFee),
        appointmentDurationMinutes: Number(form.appointmentDurationMinutes),
      });
      toast.success('Doctor account created');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a new doctor" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full name" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} required />
          <Input label="Temporary password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} error={errors.password} helperText="Min 8 characters incl. a number" required />
          <Input label="Phone number" value={form.phone} onChange={(e) => update('phone', e.target.value)} error={errors.phone} required />
          <Select
            label="Specialization"
            placeholder="Select specialization"
            options={specializations.map((s) => ({ value: s._id, label: s.name }))}
            value={form.specialization}
            onChange={(e) => update('specialization', e.target.value)}
            error={errors.specialization}
            required
          />
          <Input label="Qualifications" value={form.qualifications} onChange={(e) => update('qualifications', e.target.value)} error={errors.qualifications} required />
          <Input label="Years of experience" type="number" min={0} value={form.experienceYears} onChange={(e) => update('experienceYears', e.target.value)} error={errors.experienceYears} required />
          <Input label="Consultation fee (₹)" type="number" min={0} value={form.consultationFee} onChange={(e) => update('consultationFee', e.target.value)} error={errors.consultationFee} required />
          <Select
            label="Appointment duration"
            options={DURATION_OPTIONS}
            value={form.appointmentDurationMinutes}
            onChange={(e) => update('appointmentDurationMinutes', e.target.value)}
          />
          <Input label="Clinic address" value={form.clinicAddress} onChange={(e) => update('clinicAddress', e.target.value)} />
        </div>
        <Textarea label="Bio" rows={3} value={form.bio} onChange={(e) => update('bio', e.target.value)} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving}>Create Doctor Account</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDoctorModal;
