import { Link } from 'react-router-dom';
import { Stethoscope, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Stethoscope className="h-4 w-4" />
            </span>
            <span>MediCare Plus</span>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            A modern appointment booking portal connecting patients with trusted doctors — built as a full-stack
            portfolio project.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link to="/doctors" className="hover:text-blue-600">Find Doctors</Link></li>
            <li><Link to="/register" className="hover:text-blue-600">Book an Appointment</Link></li>
            <li><Link to="/login" className="hover:text-blue-600">Doctor Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><a href="/#about" className="hover:text-blue-600">About</a></li>
            <li><a href="/#how-it-works" className="hover:text-blue-600">How it works</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@medicareplus.demo</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 90000 00000</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Mumbai, India</li>
          </ul>
        </div>
      </div>
      <div className="mt-10 border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} MediCare Plus. Built as a BSc IT portfolio project — not a real medical service.
      </div>
    </div>
  </footer>
);

export default Footer;
