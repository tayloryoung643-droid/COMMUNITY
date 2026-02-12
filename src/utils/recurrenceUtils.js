/**
 * Recurring event utilities — pure functions, no Supabase dependency.
 *
 * recurrence_rule JSONB shapes:
 *   Weekly:          { freq: "weekly", interval: 1 }
 *   Monthly by DOW:  { freq: "monthly_by_dow", week: 1, dow: 6 }  (1st Saturday)
 *   Monthly by date: { freq: "monthly_by_date", day: 15 }
 *   Yearly:          { freq: "yearly" }
 */

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const ORDINALS = ['', '1st', '2nd', '3rd', '4th', '5th']

// Default expansion horizon when no end date is set (1 year)
const DEFAULT_HORIZON_DAYS = 365

/**
 * Get the Nth occurrence of a given day-of-week in a month.
 * week: 1-based (1 = first, 2 = second, …)
 * dow: 0 = Sunday … 6 = Saturday
 * Returns null if that occurrence doesn't exist in the month.
 */
function nthDayOfWeekInMonth(year, month, week, dow) {
  const first = new Date(year, month, 1)
  const firstDow = first.getDay()
  let day = 1 + ((dow - firstDow + 7) % 7) + (week - 1) * 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  if (day > daysInMonth) return null
  return day
}

/**
 * Expand a single recurring event into all occurrences within [rangeStart, rangeEnd].
 * Non-recurring events are returned as-is (wrapped in an array).
 */
export function expandRecurringEvent(event, rangeStart, rangeEnd) {
  const rule = event.recurrence_rule
  if (!rule || !rule.freq) return [event]

  const eventStart = new Date(event.start_time)
  if (isNaN(eventStart.getTime())) return [event]

  const eventEnd = event.end_time ? new Date(event.end_time) : null
  const durationMs = eventEnd ? eventEnd.getTime() - eventStart.getTime() : 0

  const rStart = new Date(rangeStart)
  rStart.setHours(0, 0, 0, 0)
  const rEnd = new Date(rangeEnd)
  rEnd.setHours(23, 59, 59, 999)

  // Determine recurrence end boundary
  const recEnd = event.recurrence_end
    ? new Date(event.recurrence_end + 'T23:59:59')
    : new Date(eventStart.getTime() + DEFAULT_HORIZON_DAYS * 86400000)
  const effectiveEnd = rEnd < recEnd ? rEnd : recEnd

  const occurrences = []
  const timeStr = eventStart.toTimeString().slice(0, 8) // HH:MM:SS

  if (rule.freq === 'weekly') {
    const interval = rule.interval || 1
    // Start from the event's original date, step by interval weeks
    let cursor = new Date(eventStart)
    cursor.setHours(0, 0, 0, 0)

    while (cursor <= effectiveEnd) {
      if (cursor >= rStart) {
        const oStart = new Date(`${formatDateISO(cursor)}T${timeStr}`)
        const oEnd = eventEnd ? new Date(oStart.getTime() + durationMs) : null
        occurrences.push(makeOccurrence(event, oStart, oEnd))
      }
      cursor.setDate(cursor.getDate() + 7 * interval)
    }
  } else if (rule.freq === 'monthly_by_dow') {
    const { week, dow } = rule
    let year = eventStart.getFullYear()
    let month = eventStart.getMonth()

    // Walk month by month
    while (true) {
      const day = nthDayOfWeekInMonth(year, month, week, dow)
      if (day !== null) {
        const candidate = new Date(year, month, day)
        if (candidate > effectiveEnd) break
        if (candidate >= rStart && candidate >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())) {
          const oStart = new Date(`${formatDateISO(candidate)}T${timeStr}`)
          const oEnd = eventEnd ? new Date(oStart.getTime() + durationMs) : null
          occurrences.push(makeOccurrence(event, oStart, oEnd))
        }
      }
      month++
      if (month > 11) { month = 0; year++ }
      if (new Date(year, month, 1) > effectiveEnd) break
    }
  } else if (rule.freq === 'monthly_by_date') {
    const dayOfMonth = rule.day
    let year = eventStart.getFullYear()
    let month = eventStart.getMonth()

    while (true) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const effectiveDay = Math.min(dayOfMonth, daysInMonth)
      const candidate = new Date(year, month, effectiveDay)
      if (candidate > effectiveEnd) break
      if (candidate >= rStart && candidate >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())) {
        const oStart = new Date(`${formatDateISO(candidate)}T${timeStr}`)
        const oEnd = eventEnd ? new Date(oStart.getTime() + durationMs) : null
        occurrences.push(makeOccurrence(event, oStart, oEnd))
      }
      month++
      if (month > 11) { month = 0; year++ }
      if (new Date(year, month, 1) > effectiveEnd) break
    }
  } else if (rule.freq === 'yearly') {
    const origMonth = eventStart.getMonth()
    const origDay = eventStart.getDate()
    let year = eventStart.getFullYear()

    while (true) {
      const daysInMonth = new Date(year, origMonth + 1, 0).getDate()
      const effectiveDay = Math.min(origDay, daysInMonth)
      const candidate = new Date(year, origMonth, effectiveDay)
      if (candidate > effectiveEnd) break
      if (candidate >= rStart && candidate >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())) {
        const oStart = new Date(`${formatDateISO(candidate)}T${timeStr}`)
        const oEnd = eventEnd ? new Date(oStart.getTime() + durationMs) : null
        occurrences.push(makeOccurrence(event, oStart, oEnd))
      }
      year++
    }
  }

  return occurrences.length > 0 ? occurrences : [event]
}

/**
 * Expand all events in an array, returning a flat sorted list.
 */
export function expandAllEvents(events, rangeStart, rangeEnd) {
  const expanded = events.flatMap(event => expandRecurringEvent(event, rangeStart, rangeEnd))
  expanded.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  return expanded
}

/**
 * Human-readable label for a recurrence rule.
 */
export function getRecurrenceLabel(rule) {
  if (!rule || !rule.freq) return null

  if (rule.freq === 'weekly') {
    return 'Repeats every week'
  }
  if (rule.freq === 'monthly_by_dow') {
    const ordinal = ORDINALS[rule.week] || `${rule.week}th`
    const dayName = DAY_NAMES[rule.dow] || 'day'
    return `Repeats every ${ordinal} ${dayName} of the month`
  }
  if (rule.freq === 'monthly_by_date') {
    return `Repeats monthly on the ${ordinalSuffix(rule.day)}`
  }
  if (rule.freq === 'yearly') {
    return 'Repeats every year'
  }
  return null
}

/**
 * Build a recurrence_rule JSON object from UI selections.
 * freq: 'weekly' | 'monthly_by_dow' | 'monthly_by_date' | 'yearly'
 * startDate: the event's start date string (YYYY-MM-DD) — used to derive week/dow for monthly_by_dow
 */
export function buildRecurrenceRule(freq, startDate) {
  if (freq === 'weekly') {
    return { freq: 'weekly', interval: 1 }
  }
  if (freq === 'monthly_by_dow') {
    const d = new Date(startDate + 'T12:00:00') // noon to avoid timezone issues
    const dow = d.getDay()
    const dayOfMonth = d.getDate()
    const week = Math.ceil(dayOfMonth / 7)
    return { freq: 'monthly_by_dow', week, dow }
  }
  if (freq === 'monthly_by_date') {
    const d = new Date(startDate + 'T12:00:00')
    return { freq: 'monthly_by_date', day: d.getDate() }
  }
  if (freq === 'yearly') {
    return { freq: 'yearly' }
  }
  return null
}

// --- helpers ---

function formatDateISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function makeOccurrence(event, start, end) {
  return {
    ...event,
    start_time: start.toISOString(),
    end_time: end ? end.toISOString() : null,
    _occurrence: true,
    _originalEventId: event.id
  }
}

function ordinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
