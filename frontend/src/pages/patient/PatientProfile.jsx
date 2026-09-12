import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, Lock } from 'lucide-react';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../api/patientService';
import { authService } from '../../api/authService';
import { getErrorMessage } from '../../api/axios';
import { GENDER_OPTIONS, BLOOD_GROUP_OPTIONS } from '../../utils/constants';
import { toDateInputValue } from '../../utils/formatters';

const PatientProfile = () => {
  const { openMobileSidebar } = useOutletContext();
  const { user, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState({ name: '', phone: '' });
  const [medical, setMedical] = useState({
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    bloodGroup: 'unknown',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    chronicConditions: '',
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    patientService
      .getMyProfile()
      .then((res) => {
        const p = res.data;
        setAccount({ name: p.user.name, phone: p.user.phone });
        setMedical({
          dateOfBirth: p.dateOfBirth ? toDateInputValue(p.dateOfBirth) : '',
          gender: p.gender || 'prefer_not_to_say',
          bloodGroup: p.bloodGroup || 'unknown',
          address: p.address || '',
          emergencyContactName: p.emergencyContactName || '',
          emergencyContactPhone: p.emergencyContactPhone || '',
          allergies: (p.allergies || []).join(', '),
          chronicConditions: (p.chronicConditions || []).join(', '),
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateMe(account);
      await refreshProfile();
      toast.success('Account details updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMedical = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patientService.updateMyProfile({
        ...medical,
        allergies: medical.allergies.split(',').map((s) => s.trim()).filter(Boolean),
        chronicConditions: medical.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Medical profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await authService.changePassword(passwordForm);
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPasswordSaving(false);
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
      <DashboardTopbar title="My Profile" subtitle="Manage your account and medical information." onOpenMobile={openMobileSidebar} />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <Card>
          <h2 className="font-semibold text-slate-900">Account Details</h2>
          <form onSubmit={handleSaveAccount} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} required />
            <Input label="Email" value={user?.email} disabled containerClassName="opacity-70" helperText="Email cannot be changed" />
            <Input label="Phone number" value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value })} required />
            <div className="flex items-end">
              <Button type="submit" icon={Save} loading={saving}>Save Account</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900">Medical Profile</h2>
          <form onSubmit={handleSaveMedical} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Date of birth"
                type="date"
                value={medical.dateOfBirth}
                onChange={(e) => setMedical({ ...medical, dateOfBirth: e.target.value })}
              />
              <Select
                label="Gender"
                options={GENDER_OPTIONS}
                value={medical.gender}
                onChange={(e) => setMedical({ ...medical, gender: e.target.value })}
              />
              <Select
                label="Blood group"
                options={BLOOD_GROUP_OPTIONS}
                value={medical.bloodGroup}
                onChange={(e) => setMedical({ ...medical, bloodGroup: e.target.value })}
              />
            </div>
            <Textarea
              label="Address"
              rows={2}
              value={medical.address}
              onChange={(e) => setMedical({ ...medical, address: e.target.value })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Emergency contact name"
                value={medical.emergencyContactName}
                onChange={(e) => setMedical({ ...medical, emergencyContactName: e.target.value })}
              />
              <Input
                label="Emergency contact phone"
                value={medical.emergencyContactPhone}
                onChange={(e) => setMedical({ ...medical, emergencyContactPhone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Allergies"
                helperText="Comma-separated, e.g. Penicillin, Peanuts"
                value={medical.allergies}
                onChange={(e) => setMedical({ ...medical, allergies: e.target.value })}
              />
              <Input
                label="Chronic conditions"
                helperText="Comma-separated, e.g. Diabetes, Asthma"
                value={medical.chronicConditions}
                onChange={(e) => setMedical({ ...medical, chronicConditions: e.target.value })}
              />
            </div>
            <Button type="submit" icon={Save} loading={saving}>Save Medical Profile</Button>
          </form>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Lock className="h-4 w-4" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
            <Input
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
            <div className="sm:col-span-3">
              <Button type="submit" variant="secondary" loading={passwordSaving}>Update Password</Button>
            </div>
          </form>
        </Card>
      </main>
    </>
  );
};

export default PatientProfile;
