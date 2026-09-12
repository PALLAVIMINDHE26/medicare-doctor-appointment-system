/**
 * All appointment dates are treated as calendar dates in a single
 * canonical clinic timezone of UTC. Every "date" in this system (an
 * appointment's day, a doctor's working-hours weekday, "today" for
 * past/future checks) is derived using UTC methods (getUTCDay,
 * toISOString) rather than local-time methods (getDay, toDateString).
 *
 * Why this matters: `new Date('2026-09-15T00:00:00.000Z').getDay()`
 * returns a DIFFERENT weekday depending on the server's local timezone
 * offset (e.g. a server running in UTC-5 would read that instant as
 * 2026-09-14 19:00 local time — the previous day). Since dates are
 * always constructed as UTC midnight (`${date}T00:00:00.000Z`), we must
 * also always *read* them back in UTC, or the doctor's Monday could be
 * evaluated as Sunday depending on where the API happens to be deployed.
 *
 * This is a deliberate simplification for a single-location clinic app.
 * A true multi-timezone deployment would store a timezone per doctor and
 * convert accordingly.
 */

/** Today's date at UTC midnight, as a Date object. */
const todayUTC = () => {
  const isoDate = new Date().toISOString().slice(0, 10);
  return new Date(`${isoDate}T00:00:00.000Z`);
};

/** Parses a 'YYYY-MM-DD' string into a Date at UTC midnight. */
const parseDateOnly = (dateStr) => new Date(`${dateStr}T00:00:00.000Z`);

/** Compares two Date/date-strings by their UTC calendar date only. */
const isSameUTCDate = (a, b) => new Date(a).toISOString().slice(0, 10) === new Date(b).toISOString().slice(0, 10);

module.exports = { todayUTC, parseDateOnly, isSameUTCDate };
