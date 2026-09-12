const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const { isSameUTCDate } = require('./dateUtils');

/** Converts 'HH:mm' -> minutes since midnight. */
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Converts minutes since midnight -> 'HH:mm'. */
const toHHMM = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Generates every possible appointment slot for a single day, given the
 * doctor's working-hour window and appointment duration. Does NOT know
 * about existing bookings — that filtering happens in the caller so this
 * function stays pure and easily testable.
 *
 * @param {{startTime: string, endTime: string}} workingHour
 * @param {number} durationMinutes
 * @returns {{startTime: string, endTime: string}[]}
 */
const generateDaySlots = (workingHour, durationMinutes) => {
  const slots = [];
  const start = toMinutes(workingHour.startTime);
  const end = toMinutes(workingHour.endTime);

  for (let t = start; t + durationMinutes <= end; t += durationMinutes) {
    slots.push({ startTime: toHHMM(t), endTime: toHHMM(t + durationMinutes) });
  }

  return slots;
};

/**
 * Full pipeline: given a doctor's weekly working hours, a target date,
 * appointment duration, and the set of already-booked start times for
 * that date, returns only the slots that are both within working hours
 * and not already taken. Also strips out past slots when the target date
 * is today.
 *
 * @param {Array} workingHours - doctor.workingHours array
 * @param {Date} targetDate
 * @param {number} durationMinutes
 * @param {string[]} bookedStartTimes - e.g. ['09:00', '09:30']
 * @returns {{startTime: string, endTime: string}[]}
 */
const getAvailableSlots = (workingHours, targetDate, durationMinutes, bookedStartTimes = []) => {
  const dayName = WEEKDAYS[new Date(targetDate).getUTCDay()];
  const workingHour = workingHours.find((wh) => wh.day === dayName);

  if (!workingHour || !workingHour.isWorking) return [];

  let slots = generateDaySlots(workingHour, durationMinutes);

  const bookedSet = new Set(bookedStartTimes);
  slots = slots.filter((slot) => !bookedSet.has(slot.startTime));

  // If the target date is today (in the canonical UTC clinic timezone —
  // see dateUtils.js), filter out any slot that has already started (with
  // a small buffer so a slot 2 minutes from now doesn't sneak through).
  const now = new Date();
  const isToday = isSameUTCDate(now, targetDate);

  if (isToday) {
    const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + 5; // 5-min buffer
    slots = slots.filter((slot) => toMinutes(slot.startTime) > nowMinutes);
  }

  return slots;
};

module.exports = { generateDaySlots, getAvailableSlots, toMinutes, toHHMM, WEEKDAYS };
