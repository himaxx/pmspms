/**
 * workingHours.js
 * ────────────────────────────────────────────────────────────────────────────
 * Pure utility for the PMS Pro workflow time engine.
 *
 * Rules:
 *   • Work day   : Monday – Saturday
 *   • Work hours : 10:00 – 19:00 (inclusive start, exclusive end)
 *   • Sunday     : completely skipped
 *
 * All functions accept / return native JS Date objects.
 * Internally everything operates in the LOCAL timezone (IST for this app).
 */

// ─── Constants ────────────────────────────────────────────────────────────────
export const WORK_START_HOUR = 10;   // 10:00 AM
export const WORK_END_HOUR   = 19;   // 07:00 PM  (exclusive)
export const WORK_HOURS_PER_DAY = WORK_END_HOUR - WORK_START_HOUR; // 9 hours

// ─── Primitive helpers ────────────────────────────────────────────────────────

/** Returns true if d is a Sunday (day 0) */
export function isSunday(d) {
  return d.getDay() === 0;
}

/** Returns true if d falls within working hours on a working-day */
export function isWorkingMoment(d) {
  if (isSunday(d)) return false;
  const h = d.getHours();
  return h >= WORK_START_HOUR && h < WORK_END_HOUR;
}

/**
 * Clamps a Date to the nearest valid working moment.
 * - If the date is a Sunday → advance to Monday 10:00.
 * - If the time is before 10:00 → set to 10:00 same day (unless Sunday).
 * - If the time is 19:00 or later → advance to next working-day at 10:00.
 * Returns a NEW Date object (does not mutate).
 */
export function clampToWorkingTime(d) {
  const r = new Date(d);

  // Skip Sunday
  while (isSunday(r)) {
    r.setDate(r.getDate() + 1);
    r.setHours(WORK_START_HOUR, 0, 0, 0);
  }

  const h = r.getHours();
  const m = r.getMinutes();
  const s = r.getSeconds();

  if (h < WORK_START_HOUR || (h === 0 && m === 0)) {
    // Too early → roll to start of work
    r.setHours(WORK_START_HOUR, 0, 0, 0);
  } else if (h >= WORK_END_HOUR) {
    // Past end of work → advance to next working day
    r.setDate(r.getDate() + 1);
    r.setHours(WORK_START_HOUR, 0, 0, 0);
    // Recurse to handle back-to-back Sundays
    return clampToWorkingTime(r);
  }

  return r;
}

/**
 * Add `hours` working hours to `startDate`.
 *
 * Algorithm:
 *   1. Clamp the start to a valid working moment.
 *   2. Walk forward minute-by-minute (for precision) inside working windows,
 *      counting down the remaining hours until 0.
 *
 * For performance we jump in larger chunks (full remaining working-day
 * hours) rather than looping minute-by-minute when the remaining time
 * is large.
 *
 * @param {Date}   startDate  Base date-time
 * @param {number} hours      Working hours to add (may be fractional)
 * @returns {Date}            Resulting date-time
 */
export function addWorkingHours(startDate, hours) {
  if (!hours || hours <= 0) return clampToWorkingTime(new Date(startDate));

  let current = clampToWorkingTime(new Date(startDate));
  let remaining = hours; // in hours (float)

  while (remaining > 0) {
    // How many working hours remain today from `current`?
    const endOfDay = new Date(current);
    endOfDay.setHours(WORK_END_HOUR, 0, 0, 0);

    const hoursLeftToday =
      (endOfDay.getTime() - current.getTime()) / (1000 * 60 * 60);

    if (remaining <= hoursLeftToday) {
      // Finish within today
      current = new Date(current.getTime() + remaining * 60 * 60 * 1000);
      remaining = 0;
    } else {
      // Consume the rest of today and move to next working day
      remaining -= hoursLeftToday;
      current.setDate(current.getDate() + 1);
      current.setHours(WORK_START_HOUR, 0, 0, 0);
      // Skip Sunday
      while (isSunday(current)) {
        current.setDate(current.getDate() + 1);
      }
    }
  }

  return current;
}

/**
 * Calculate the working-hour difference between two Date objects.
 * Returns 0 if actual ≤ planned (no delay).
 *
 * @param {Date|string} planned   Planned date-time
 * @param {Date|string} actual    Actual date-time
 * @returns {number}              Delay in working hours (float, ≥ 0)
 */
export function workingHoursBetween(planned, actual) {
  const p = new Date(planned);
  const a = new Date(actual);

  if (a <= p) return 0;

  let cursor = clampToWorkingTime(new Date(p));
  let total   = 0;

  while (cursor < a) {
    if (isSunday(cursor)) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(WORK_START_HOUR, 0, 0, 0);
      continue;
    }

    const h = cursor.getHours();

    if (h < WORK_START_HOUR) {
      cursor.setHours(WORK_START_HOUR, 0, 0, 0);
      continue;
    }

    if (h >= WORK_END_HOUR) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(WORK_START_HOUR, 0, 0, 0);
      continue;
    }

    // End of working segment today
    const endOfDay = new Date(cursor);
    endOfDay.setHours(WORK_END_HOUR, 0, 0, 0);

    const segmentEnd = a < endOfDay ? a : endOfDay;
    total += (segmentEnd.getTime() - cursor.getTime()) / (1000 * 60 * 60);
    cursor = new Date(endOfDay);
  }

  return parseFloat(total.toFixed(2));
}

/**
 * Format a Date for display (IST-friendly short format).
 * e.g. "17 Apr '26, 02:30 PM"
 */
export function fmtWorkingDateTime(d) {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('en-IN', {
    day:    'numeric',
    month:  'short',
    year:   '2-digit',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Stage-specific planned-date calculators.
 * ─────────────────────────────────────────────────────────────────────────────
 * Each returns a Date or null.
 */

/** s2_planned = stage1SubmitTime + 63 working hours */
export function calcS2Planned(stage1SubmitTime) {
  if (!stage1SubmitTime) return null;
  return addWorkingHours(new Date(stage1SubmitTime), 63);
}

/** s3_planned = stage2ActualTime + 36 working hours */
export function calcS3Planned(stage2ActualTime) {
  if (!stage2ActualTime) return null;
  return addWorkingHours(new Date(stage2ActualTime), 36);
}

/** s4_planned = stage3ActualTime + 18 working hours */
export function calcS4Planned(stage3ActualTime) {
  if (!stage3ActualTime) return null;
  return addWorkingHours(new Date(stage3ActualTime), 18);
}

/**
 * s5_planned (Jama planned) = stage4ActualTime + leadTimeHours working hours
 * @param {Date|string} stage4ActualTime
 * @param {number}      leadTimeHours   — dynamic, from s5_lead_time_hours field
 */
export function calcS5JamaPlanned(stage4ActualTime, leadTimeHours) {
  if (!stage4ActualTime || !leadTimeHours) return null;
  return addWorkingHours(new Date(stage4ActualTime), Number(leadTimeHours));
}

/**
 * Generic delay calculator for any stage.
 * @param {Date|string} planned
 * @param {Date|string} actual
 * @returns {number}  working hours of delay (0 if on-time or early)
 */
export function calcDelay(planned, actual) {
  if (!planned || !actual) return 0;
  return workingHoursBetween(planned, actual);
}
