import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, Lock } from 'lucide-react';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { doctorService } from '../../api/doctorService';
import { authService } from '../../api/authService';
import { getErrorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const DoctorProfilePage = () => {
  const { openMobileSidebar } = useOutletContext();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState({ name: '', phone: '' });
  const [professional, setProfessional] = useState({
    qualifications: '',
    experienceYears: 0,
    bio: '',
    consultationFee: 0,
    clinicAddress: '',
    languages: '',
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    doctorService
      .getMyProfile()
      .then((res) => {
        const d = res.data;
        setAccount({ name: d.user.name, phone: d.user.phone });
        setProfessional({
          qualifications: d.qualifications,
          experienceYears: d.experienceYears,
          bio: d.bio || '',
          consultationFee: d.consultationFee,
          clinicAddress: d.clinicAddress || '',
          languages: (d.languages || []).join(', '),
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

  const handleSaveProfessional = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await doctorService.updateMyProfile({
        ...professional,
        experienceYears: Number(professional.experienceYears),
        consultationFee: Number(professional.consultationFee),
        languages: professional.languages.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Professional profile updated');
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
      <DashboardTopbar title="My Profile" subtitle="Manage your account and professional information." onOpenMobile={openMobileSidebar} />

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
          <h2 className="font-semibold text-slate-900">Professional Profile</h2>
          <p className="mt-1 text-sm text-slate-500">This information is shown to patients on your public profile.</p>
          <form onSubmit={handleSaveProfessional} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Qualifications"
                value={professional.qualifications}
                onChange={(e) => setProfessional({ ...professional, qualifications: e.target.value })}
                required
              />
              <Input
                label="Years of experience"
                type="number"
                min={0}
                value={professional.experienceYears}
                onChange={(e) => setProfessional({ ...professional, experienceYears: e.target.value })}
                required
              />
              <Input
                label="Consultation fee (₹)"
                type="number"
                min={0}
                value={professional.consultationFee}
                onChange={(e) => setProfessional({ ...professional, consultationFee: e.target.value })}
                required
              />
            </div>
            <Textarea
              label="Bio"
              rows={4}
              value={professional.bio}
              onChange={(e) => setProfessional({ ...professional, bio: e.target.value })}
              placeholder="Tell patients about your experience and approach to care..."
            />
            <Input
              label="Clinic address"
              value={professional.clinicAddress}
              onChange={(e) => setProfessional({ ...professional, clinicAddress: e.target.value })}
            />
            <Input
              label="Languages spoken"
              helperText="Comma-separated, e.g. English, Hindi"
              value={professional.languages}
              onChange={(e) => setProfessional({ ...professional, languages: e.target.value })}
            />
            <Button type="submit" icon={Save} loading={saving}>Save Professional Profile</Button>
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

export default DoctorProfilePage;
