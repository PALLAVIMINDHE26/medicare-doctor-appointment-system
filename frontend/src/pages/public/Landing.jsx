import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  ShieldCheck,
  Clock,
  Search,
  UserPlus,
  CalendarDays,
  Stethoscope,
  Star,
  ArrowRight,
  HeartPulse,
  Baby,
  Bone,
  Brain,
  Eye,
  Smile,
  Sparkles,
  Flower2,
  BrainCog,
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import { specializationService } from '../../api/specializationService';

const ICONS = {
  HeartPulse,
  Sparkles,
  Baby,
  Bone,
  Brain,
  Stethoscope,
  Flower2,
  Eye,
  Smile,
  BrainCog,
};

const FEATURES = [
  {
    icon: Search,
    title: 'Find the right doctor',
    description: 'Filter by specialization, fees and experience to find a doctor who fits your needs in seconds.',
  },
  {
    icon: CalendarCheck,
    title: 'Real-time availability',
    description: 'See only the time slots that are actually free — no back-and-forth calls, no double-booking.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & private',
    description: 'Your health information and appointments are protected with industry-standard authentication.',
  },
  {
    icon: Clock,
    title: 'Manage on the go',
    description: 'Reschedule, cancel, or review your appointment history anytime from any device.',
  },
];

const STEPS = [
  { icon: Search, title: 'Search', description: 'Browse doctors by specialty, location or availability.' },
  { icon: CalendarDays, title: 'Book', description: 'Pick a date and see live open slots for that doctor.' },
  { icon: UserPlus, title: 'Confirm', description: 'The doctor confirms your booking — you get notified instantly.' },
  { icon: HeartPulse, title: 'Visit', description: 'Show up for your consultation. Simple as that.' },
];

const Landing = () => {
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    specializationService
      .getAll()
      .then((res) => setSpecializations(res.data.slice(0, 8)))
      .catch(() => setSpecializations([]));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              <Star className="h-3.5 w-3.5 fill-blue-700" /> Trusted by 1,200+ patients
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Book doctor appointments <span className="text-blue-600">without the wait.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              MediCare Plus connects you with verified doctors across specializations. Search, compare, and book a
              confirmed time slot in under two minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/doctors">
                <Button size="lg" icon={Search} fullWidth>
                  Find a Doctor
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="secondary" fullWidth>
                  Create Free Account
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
              <div><span className="font-bold text-slate-900">50+</span> Doctors</div>
              <div><span className="font-bold text-slate-900">10</span> Specializations</div>
              <div><span className="font-bold text-slate-900">4.8/5</span> Avg. rating</div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-3xl bg-blue-600 p-8 shadow-2xl shadow-blue-200">
              <div className="rounded-2xl bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Dr. Aisha Sharma</p>
                    <p className="text-sm text-slate-500">Cardiology · 14 yrs exp.</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'].map((slot, i) => (
                    <div
                      key={slot}
                      className={`rounded-lg border py-2 text-center text-xs font-medium ${
                        i === 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  ✓ Appointment confirmed for Sep 15, 10:00 AM
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Everything you need, nothing you don&apos;t</h2>
          <p className="mt-3 text-slate-600">A booking experience built around your time.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specializations */}
      <section id="specializations" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">Care across every specialty</h2>
            <p className="mt-3 text-slate-600">From routine checkups to specialist care.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {specializations.map((s) => {
              const Icon = ICONS[s.icon] || Stethoscope;
              return (
                <Link
                  key={s._id}
                  to={`/doctors?specialization=${s._id}`}
                  className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-slate-800">{s.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
          <p className="mt-3 text-slate-600">Four simple steps from search to visit.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, idx) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200">
                <step.icon className="h-6 w-6" />
              </div>
              <p className="mt-2 text-xs font-bold text-blue-600">STEP {idx + 1}</p>
              <h3 className="mt-1 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-blue-600 px-8 py-12 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to book your next visit?</h2>
            <p className="mt-2 text-blue-100">Join thousands of patients managing their healthcare online.</p>
          </div>
          <Link to="/register">
            <Button size="lg" variant="secondary" icon={ArrowRight} className="bg-white">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
