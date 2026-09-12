/**
 * Seeds the database with realistic demo data: an admin, a spread of
 * specializations, several doctors (each with distinct working hours and
 * fees), several patients, and a mix of past/upcoming appointments in
 * varying statuses so every dashboard has something real to show.
 *
 * Usage:
 *   npm run seed            -> wipes relevant collections and reseeds
 *   npm run seed:destroy    -> wipes relevant collections only
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Specialization = require('../models/Specialization');
const Appointment = require('../models/Appointment');

const SPECIALIZATIONS = [
  { name: 'Cardiology', description: 'Heart and cardiovascular system', icon: 'HeartPulse' },
  { name: 'Dermatology', description: 'Skin, hair and nail conditions', icon: 'Sparkles' },
  { name: 'Pediatrics', description: 'Medical care for infants, children and adolescents', icon: 'Baby' },
  { name: 'Orthopedics', description: 'Bones, joints, ligaments and muscles', icon: 'Bone' },
  { name: 'Neurology', description: 'Brain, spinal cord and nervous system', icon: 'Brain' },
  { name: 'General Medicine', description: 'Primary care and general health concerns', icon: 'Stethoscope' },
  { name: 'Gynecology', description: "Women's reproductive health", icon: 'Flower2' },
  { name: 'Ophthalmology', description: 'Eye care and vision', icon: 'Eye' },
  { name: 'Dentistry', description: 'Oral and dental health', icon: 'Smile' },
  { name: 'Psychiatry', description: 'Mental health and emotional wellbeing', icon: 'BrainCog' },
];

const workingHoursTemplate = (offDays = ['Sunday'], start = '09:00', end = '17:00') =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => ({
    day,
    isWorking: !offDays.includes(day),
    startTime: start,
    endTime: end,
  }));

const DOCTORS = [
  {
    name: 'Dr. Aisha Sharma',
    email: 'aisha.sharma@medicare.demo',
    specName: 'Cardiology',
    qualifications: 'MBBS, MD (Cardiology), DM',
    experienceYears: 14,
    bio: 'Senior cardiologist specializing in preventive heart care and interventional cardiology, with over a decade of clinical practice.',
    consultationFee: 1500,
    appointmentDurationMinutes: 30,
    clinicAddress: '4th Floor, Sunrise Medical Tower, Andheri West, Mumbai',
    languages: ['English', 'Hindi'],
    workingHours: workingHoursTemplate(['Sunday'], '09:00', '17:00'),
    rating: 4.8,
    totalReviews: 132,
  },
  {
    name: 'Dr. Rohan Verma',
    email: 'rohan.verma@medicare.demo',
    specName: 'Dermatology',
    qualifications: 'MBBS, MD (Dermatology)',
    experienceYears: 9,
    bio: 'Dermatologist focused on cosmetic and clinical skin care, acne management and minor dermatological procedures.',
    consultationFee: 1000,
    appointmentDurationMinutes: 20,
    clinicAddress: 'Skin & Glow Clinic, Bandra East, Mumbai',
    languages: ['English', 'Hindi', 'Marathi'],
    workingHours: workingHoursTemplate(['Sunday', 'Thursday'], '10:00', '18:00'),
    rating: 4.6,
    totalReviews: 87,
  },
  {
    name: 'Dr. Priya Nair',
    email: 'priya.nair@medicare.demo',
    specName: 'Pediatrics',
    qualifications: 'MBBS, MD (Pediatrics), FIAP',
    experienceYears: 11,
    bio: "Pediatrician with a special interest in newborn care, vaccination programs and childhood nutrition.",
    consultationFee: 900,
    appointmentDurationMinutes: 20,
    clinicAddress: 'Little Stars Children\'s Clinic, Powai, Mumbai',
    languages: ['English', 'Malayalam', 'Hindi'],
    workingHours: workingHoursTemplate(['Sunday'], '09:30', '16:30'),
    rating: 4.9,
    totalReviews: 210,
  },
  {
    name: 'Dr. Karan Malhotra',
    email: 'karan.malhotra@medicare.demo',
    specName: 'Orthopedics',
    qualifications: 'MBBS, MS (Orthopedics)',
    experienceYears: 16,
    bio: 'Orthopedic surgeon specializing in sports injuries, joint replacement and spine care.',
    consultationFee: 1800,
    appointmentDurationMinutes: 30,
    clinicAddress: 'OrthoCare Institute, Lower Parel, Mumbai',
    languages: ['English', 'Hindi', 'Punjabi'],
    workingHours: workingHoursTemplate(['Saturday', 'Sunday'], '08:00', '15:00'),
    rating: 4.7,
    totalReviews: 156,
  },
  {
    name: 'Dr. Meera Iyer',
    email: 'meera.iyer@medicare.demo',
    specName: 'Neurology',
    qualifications: 'MBBS, DM (Neurology)',
    experienceYears: 13,
    bio: 'Neurologist treating migraines, epilepsy, stroke recovery and other neurological disorders.',
    consultationFee: 2000,
    appointmentDurationMinutes: 45,
    clinicAddress: 'NeuroCare Center, Worli, Mumbai',
    languages: ['English', 'Tamil', 'Hindi'],
    workingHours: workingHoursTemplate(['Sunday', 'Wednesday'], '11:00', '19:00'),
    rating: 4.9,
    totalReviews: 98,
  },
  {
    name: 'Dr. Sanjay Kulkarni',
    email: 'sanjay.kulkarni@medicare.demo',
    specName: 'General Medicine',
    qualifications: 'MBBS, MD (General Medicine)',
    experienceYears: 20,
    bio: 'Experienced general physician for everyday illnesses, chronic disease management and health checkups.',
    consultationFee: 700,
    appointmentDurationMinutes: 15,
    clinicAddress: 'Wellness Family Clinic, Thane West, Mumbai',
    languages: ['English', 'Hindi', 'Marathi'],
    workingHours: workingHoursTemplate([], '08:00', '20:00'), // works all 7 days
    rating: 4.5,
    totalReviews: 302,
  },
  {
    name: 'Dr. Neha Choudhary',
    email: 'neha.choudhary@medicare.demo',
    specName: 'Gynecology',
    qualifications: 'MBBS, MS (Obstetrics & Gynecology)',
    experienceYears: 12,
    bio: "Gynecologist providing comprehensive women's healthcare including prenatal, family planning and menopause care.",
    consultationFee: 1300,
    appointmentDurationMinutes: 30,
    clinicAddress: "Women's Health Center, Vashi, Navi Mumbai",
    languages: ['English', 'Hindi'],
    workingHours: workingHoursTemplate(['Sunday'], '09:00', '16:00'),
    rating: 4.8,
    totalReviews: 121,
  },
  {
    name: 'Dr. Arjun Reddy',
    email: 'arjun.reddy@medicare.demo',
    specName: 'Ophthalmology',
    qualifications: 'MBBS, MS (Ophthalmology)',
    experienceYears: 8,
    bio: 'Eye specialist experienced in cataract surgery, LASIK consultation and routine vision care.',
    consultationFee: 950,
    appointmentDurationMinutes: 20,
    clinicAddress: 'Clear Vision Eye Clinic, Chembur, Mumbai',
    languages: ['English', 'Telugu', 'Hindi'],
    workingHours: workingHoursTemplate(['Sunday', 'Saturday'], '10:00', '17:00'),
    rating: 4.4,
    totalReviews: 64,
  },
];

const PATIENTS = [
  { name: 'Rahul Deshmukh', email: 'rahul.deshmukh@example.demo', gender: 'male', dob: '1990-05-14', blood: 'B+' },
  { name: 'Ananya Gupta', email: 'ananya.gupta@example.demo', gender: 'female', dob: '1995-11-02', blood: 'A+' },
  { name: 'Vikram Singh', email: 'vikram.singh@example.demo', gender: 'male', dob: '1988-02-20', blood: 'O+' },
  { name: 'Sneha Patil', email: 'sneha.patil@example.demo', gender: 'female', dob: '1999-07-30', blood: 'AB+' },
  { name: 'Aditya Joshi', email: 'aditya.joshi@example.demo', gender: 'male', dob: '1993-09-12', blood: 'O-' },
  { name: 'Kavya Menon', email: 'kavya.menon@example.demo', gender: 'female', dob: '2001-03-25', blood: 'B-' },
];

const REASONS = [
  'Routine checkup',
  'Persistent headache for 3 days',
  'Follow-up on previous prescription',
  'Fever and body ache',
  'Annual health screening',
  'Skin rash and itching',
  'Joint pain after exercise',
  'General consultation',
  'Vaccination',
  'Blood pressure monitoring',
];

const DEMO_PASSWORD = 'Password123';

// Truncates a Date to UTC midnight — matches how the rest of the app
// stores and reads appointment dates (see src/utils/dateUtils.js).
const dateOnly = (d) => new Date(d.toISOString().slice(0, 10) + 'T00:00:00.000Z');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing demo-relevant collections...');
  await Promise.all([
    Appointment.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    User.deleteMany({}),
    Specialization.deleteMany({}),
  ]);

  if (process.argv.includes('--destroy')) {
    console.log('Collections cleared. Exiting (destroy mode).');
    await mongoose.connection.close();
    process.exit(0);
  }

  console.log('Seeding specializations...');
  const specDocs = await Specialization.insertMany(SPECIALIZATIONS);
  const specByName = Object.fromEntries(specDocs.map((s) => [s.name, s]));

  console.log('Seeding admin account...');
  await User.create({
    name: 'System Administrator',
    email: 'admin@medicare.demo',
    password: DEMO_PASSWORD,
    phone: '+91-9000000000',
    role: 'admin',
  });

  console.log('Seeding doctors...');
  const doctorRecords = [];
  for (const d of DOCTORS) {
    const user = await User.create({
      name: d.name,
      email: d.email,
      password: DEMO_PASSWORD,
      phone: `+91-90${Math.floor(10000000 + Math.random() * 89999999)}`,
      role: 'doctor',
    });

    const doctor = await Doctor.create({
      user: user._id,
      specialization: specByName[d.specName]._id,
      qualifications: d.qualifications,
      experienceYears: d.experienceYears,
      bio: d.bio,
      consultationFee: d.consultationFee,
      appointmentDurationMinutes: d.appointmentDurationMinutes,
      clinicAddress: d.clinicAddress,
      languages: d.languages,
      workingHours: d.workingHours,
      rating: d.rating,
      totalReviews: d.totalReviews,
      status: 'approved',
      isActive: true,
    });

    doctorRecords.push({ doctor, user, spec: d.specName, duration: d.appointmentDurationMinutes, fee: d.consultationFee, workingHours: d.workingHours });
  }

  // One doctor left pending, to demo the admin approval workflow
  const pendingUser = await User.create({
    name: 'Dr. Farah Khan',
    email: 'farah.khan@medicare.demo',
    password: DEMO_PASSWORD,
    phone: '+91-9012345678',
    role: 'doctor',
  });
  await Doctor.create({
    user: pendingUser._id,
    specialization: specByName['Dentistry']._id,
    qualifications: 'BDS, MDS (Orthodontics)',
    experienceYears: 6,
    bio: 'Dentist specializing in braces, root canal treatment and cosmetic dentistry.',
    consultationFee: 800,
    appointmentDurationMinutes: 30,
    clinicAddress: 'Bright Smile Dental Clinic, Malad, Mumbai',
    languages: ['English', 'Hindi', 'Urdu'],
    workingHours: workingHoursTemplate(['Sunday'], '10:00', '18:00'),
    status: 'pending',
    isActive: true,
  });

  console.log('Seeding patients...');
  const patientRecords = [];
  for (const p of PATIENTS) {
    const user = await User.create({
      name: p.name,
      email: p.email,
      password: DEMO_PASSWORD,
      phone: `+91-98${Math.floor(10000000 + Math.random() * 89999999)}`,
      role: 'patient',
    });
    const patient = await Patient.create({
      user: user._id,
      dateOfBirth: new Date(p.dob),
      gender: p.gender,
      bloodGroup: p.blood,
      address: 'Mumbai, Maharashtra, India',
    });
    patientRecords.push({ patient, user });
  }

  console.log('Seeding appointments...');
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const firstAvailableSlotFor = (doctorRec, targetDate) => {
    const dayName = WEEKDAYS[targetDate.getUTCDay()];
    const wh = doctorRec.workingHours.find((w) => w.day === dayName);
    if (!wh || !wh.isWorking) return null;
    return wh.startTime; // just use the first slot of the day for simplicity/determinism
  };

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  const addMinutes = (hhmm, mins) => {
    const total = toMinutes(hhmm) + mins;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  let appointmentsCreated = 0;
  const usedSlots = new Set(); // `${doctorId}_${dateStr}_${startTime}`

  const tryCreateAppointment = async ({ doctorRec, patientRec, dayOffset, slotIndex, status }) => {
    const targetDate = dateOnly(new Date(Date.now() + dayOffset * 86400000));
    const dayName = WEEKDAYS[targetDate.getUTCDay()];
    const wh = doctorRec.workingHours.find((w) => w.day === dayName);
    if (!wh || !wh.isWorking) return false;

    const startTime = addMinutes(wh.startTime, slotIndex * doctorRec.duration);
    if (toMinutes(startTime) + doctorRec.duration > toMinutes(wh.endTime)) return false;

    const key = `${doctorRec.doctor._id}_${targetDate.toISOString()}_${startTime}`;
    if (usedSlots.has(key)) return false;
    usedSlots.add(key);

    await Appointment.create({
      patient: patientRec.patient._id,
      doctor: doctorRec.doctor._id,
      specialization: doctorRec.doctor.specialization,
      date: targetDate,
      startTime,
      endTime: addMinutes(startTime, doctorRec.duration),
      status,
      reasonForVisit: REASONS[Math.floor(Math.random() * REASONS.length)],
      consultationFee: doctorRec.fee,
      doctorNotes: status === 'completed' ? 'Patient advised rest and follow-up in 2 weeks if symptoms persist.' : '',
      createdBy: patientRec.user._id,
    });
    appointmentsCreated += 1;
    return true;
  };

  // Past appointments (completed / cancelled / no-show mix) - last 30 days
  for (let i = 0; i < 25; i += 1) {
    const doctorRec = doctorRecords[i % doctorRecords.length];
    const patientRec = patientRecords[i % patientRecords.length];
    const dayOffset = -1 * (1 + (i % 28));
    const statusRoll = i % 10;
    const status = statusRoll < 7 ? 'completed' : statusRoll < 9 ? 'cancelled' : 'no-show';
    // eslint-disable-next-line no-await-in-loop
    await tryCreateAppointment({ doctorRec, patientRec, dayOffset, slotIndex: i % 4, status });
  }

  // Upcoming appointments (pending / confirmed mix) - next 14 days
  for (let i = 0; i < 18; i += 1) {
    const doctorRec = doctorRecords[(i + 3) % doctorRecords.length];
    const patientRec = patientRecords[(i + 2) % patientRecords.length];
    const dayOffset = 1 + (i % 14);
    const status = i % 3 === 0 ? 'pending' : 'confirmed';
    // eslint-disable-next-line no-await-in-loop
    await tryCreateAppointment({ doctorRec, patientRec, dayOffset, slotIndex: (i + 1) % 4, status });
  }

  console.log(`Seed complete: ${specDocs.length} specializations, ${doctorRecords.length + 1} doctors (1 pending), ${patientRecords.length} patients, ${appointmentsCreated} appointments, 1 admin.`);
  console.log('\nDemo credentials (all use password: Password123)');
  console.log('  Admin:    admin@medicare.demo');
  console.log('  Doctor:   aisha.sharma@medicare.demo');
  console.log('  Patient:  rahul.deshmukh@example.demo');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
