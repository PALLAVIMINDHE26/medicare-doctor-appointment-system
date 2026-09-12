import { Link } from 'react-router-dom';
import { Star, Briefcase, IndianRupee, MapPin } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

const DoctorCard = ({ doctor }) => (
  <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
    <div className="flex items-start gap-3">
      <Avatar name={doctor.user.name} src={doctor.user.avatarUrl} size="lg" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">{doctor.user.name}</h3>
        <p className="truncate text-sm text-blue-600">{doctor.specialization.name}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-slate-700">{doctor.rating?.toFixed(1) || 'New'}</span>
          {doctor.totalReviews > 0 && <span className="text-slate-400">({doctor.totalReviews})</span>}
        </div>
      </div>
    </div>

    <div className="mt-4 space-y-2 text-sm text-slate-500">
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 shrink-0" />
        <span>{doctor.experienceYears} years experience</span>
      </div>
      {doctor.clinicAddress && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{doctor.clinicAddress}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <IndianRupee className="h-4 w-4 shrink-0" />
        <span>{formatCurrency(doctor.consultationFee)} consultation fee</span>
      </div>
    </div>

    <div className="mt-4 flex flex-wrap gap-1.5">
      {(doctor.languages || []).slice(0, 3).map((lang) => (
        <Badge key={lang} color="gray">{lang}</Badge>
      ))}
    </div>

    <Link to={`/doctors/${doctor._id}`} className="mt-5">
      <Button fullWidth variant="secondary">
        View Profile & Book
      </Button>
    </Link>
  </div>
);

export default DoctorCard;
