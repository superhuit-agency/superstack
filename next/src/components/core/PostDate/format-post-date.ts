/**
 * Post date display for `core/post-date`: no external date libs.
 *
 * - Parse strings into a **correct UTC millisecond** (`parsePostDateToUtcMs`).
 * - Format with the visitor’s **local** calendar using `Date` getters (`getFullYear`, `getHours`, …).
 *
 * Naive datetimes (no `Z` / no `±hh:mm` offset) are read as **UTC wall time** (common for WP /
 * GraphQL when the value is stored in GMT). If your API sends site-local naive strings instead,
 * you’ll need an offset or IANA zone on the wire.
 */

const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const DAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const pad2 = (n: number) => String(n).padStart(2, '0');

/** English ordinal suffix only (PHP `S`). */
const ordinalSuffixOnly = (n: number) => {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

type WallParts = {
  year: number;
  /** 0–11 */
  monthIndex0: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** JS / PHP `w`: 0 Sunday … 6 Saturday */
  weekdaySun0: number;
};

function dayOfYearGregorian(year: number, month1: number, day: number) {
  const start = Date.UTC(year, 0, 1);
  const cur = Date.UTC(year, month1 - 1, day);
  return Math.floor((cur - start) / 86400000) + 1;
}

/** Calendar fields in the visitor’s local timezone for this absolute instant. */
function getLocalWallParts(ms: number): WallParts {
  const d = new Date(ms);
  return {
    year: d.getFullYear(),
    monthIndex0: d.getMonth(),
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds(),
    weekdaySun0: d.getDay(),
  };
}

function formatTokenFromWall(z: WallParts, c: string): string {
  const Y = z.year;
  const m = z.monthIndex0;
  const day = z.day;
  const h24 = z.hour;
  const min = z.minute;
  const sec = z.second;
  const w = z.weekdaySun0;

  switch (c) {
    case 'd':
      return pad2(day);
    case 'D':
      return DAY_SHORT[w] ?? '';
    case 'j':
      return String(day);
    case 'l':
      return DAY_LONG[w] ?? '';
    case 'N': {
      const n = w === 0 ? 7 : w;
      return String(n);
    }
    case 'S':
      return ordinalSuffixOnly(day);
    case 'w':
      return String(w);
    case 'z': {
      const doy1 = dayOfYearGregorian(Y, m + 1, day);
      return String(doy1 - 1);
    }
    case 'F':
      return MONTH_LONG[m] ?? '';
    case 'm':
      return pad2(m + 1);
    case 'M':
      return MONTH_SHORT[m] ?? '';
    case 'n':
      return String(m + 1);
    case 'Y':
      return String(Y);
    case 'y':
      return pad2(Y % 100);
    case 'a':
      return h24 < 12 ? 'am' : 'pm';
    case 'A':
      return h24 < 12 ? 'AM' : 'PM';
    case 'g': {
      const h12 = h24 % 12 || 12;
      return String(h12);
    }
    case 'G':
      return String(h24);
    case 'h': {
      const h12 = h24 % 12 || 12;
      return pad2(h12);
    }
    case 'H':
      return pad2(h24);
    case 'i':
      return pad2(min);
    case 's':
      return pad2(sec);
    default:
      return c;
  }
}

const HAS_EXPLICIT_ZONE = /[zZ]$|[+-]\d{2}:\d{2}$|[+-]\d{4}$|[+-]\d{2}$/;

/** `YYYY-MM-DDTHH:mm:ss` or `YYYY-MM-DD HH:mm:ss` (optional fractional seconds), no zone. */
const NAIVE_DATETIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

/** Date-only `YYYY-MM-DD`, no zone. */
const NAIVE_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Legacy helper (kept for parity with older snippets). **Do not** pass a `Date` that already
 * represents the correct absolute instant from `Date.parse` / `Date.UTC` — this adjusts
 * `getHours`/`getTimezoneOffset` in a way that **changes** that instant’s local display incorrectly.
 *
 * `PostDate` uses `parsePostDateToUtcMs` + normal `Date` local getters instead.
 */
export function convertUTCDateToLocalDate(date: Date): Date {
  const newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  const offset = date.getTimezoneOffset() / 60;
  const hours = date.getHours();
  newDate.setHours(hours - offset);
  return newDate;
}

/**
 * Parse WP / GraphQL date strings to a UTC millisecond timestamp.
 * - ISO with `Z` or `±hh:mm` → `Date.parse`
 * - Naive full datetime → treated as **UTC** (`Date.UTC`)
 * - Naive date-only → UTC midnight that day
 */
export function parsePostDateToUtcMs(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (HAS_EXPLICIT_ZONE.test(trimmed)) {
    const ms = Date.parse(trimmed);
    return Number.isFinite(ms) ? ms : null;
  }

  const dt = NAIVE_DATETIME.exec(trimmed);
  if (dt) {
    const y = Number.parseInt(dt[1], 10);
    const mo = Number.parseInt(dt[2], 10) - 1;
    const d = Number.parseInt(dt[3], 10);
    const h = Number.parseInt(dt[4], 10);
    const mi = Number.parseInt(dt[5], 10);
    const s = dt[6] ? Number.parseInt(dt[6], 10) : 0;
    let fracMs = 0;
    if (dt[7]) {
      const frac = dt[7].padEnd(3, '0').slice(0, 3);
      fracMs = Number.parseInt(frac, 10);
    }
    const ms = Date.UTC(y, mo, d, h, mi, s, fracMs);
    return Number.isFinite(ms) ? ms : null;
  }

  const dOnly = NAIVE_DATE_ONLY.exec(trimmed);
  if (dOnly) {
    const y = Number.parseInt(dOnly[1], 10);
    const mo = Number.parseInt(dOnly[2], 10) - 1;
    const d = Number.parseInt(dOnly[3], 10);
    const ms = Date.UTC(y, mo, d, 0, 0, 0, 0);
    return Number.isFinite(ms) ? ms : null;
  }

  const normalized = /^\d{4}-\d{2}-\d{2} \d/.test(trimmed)
    ? trimmed.replace(' ', 'T')
    : trimmed;
  const ms = Date.parse(normalized);
  return Number.isFinite(ms) ? ms : null;
}

/** Mirrors WP `human_time_diff`-style granularity, then block-style suffixes ("ago" / "from now"). */
export function formatHumanDiff(unformatted: string, nowMs: number = Date.now()): string {
  const fromMs = parsePostDateToUtcMs(unformatted);
  if (fromMs === null) return '';

  const diffSec = Math.round((fromMs - nowMs) / 1000);
  const past = diffSec <= 0;
  const absSec = Math.abs(diffSec);

  const minute = 60;
  const hour = 3600;
  const day = 86400;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  let n: number;
  let unit: string;

  if (absSec < minute) {
    n = Math.max(absSec, 1);
    unit = n === 1 ? 'second' : 'seconds';
  } else if (absSec < hour) {
    n = Math.round(absSec / minute);
    unit = n === 1 ? 'minute' : 'minutes';
  } else if (absSec < day) {
    n = Math.round(absSec / hour);
    unit = n === 1 ? 'hour' : 'hours';
  } else if (absSec < week) {
    n = Math.round(absSec / day);
    unit = n === 1 ? 'day' : 'days';
  } else if (absSec < month) {
    n = Math.round(absSec / week);
    unit = n === 1 ? 'week' : 'weeks';
  } else if (absSec < year) {
    n = Math.round(absSec / month);
    unit = n === 1 ? 'month' : 'months';
  } else {
    n = Math.round(absSec / year);
    unit = n === 1 ? 'year' : 'years';
  }

  const core = `${n} ${unit}`;
  return past ? `${core} ago` : `${core} from now`;
}

/**
 * PHP `date()`-style pattern using the visitor’s local calendar (`Date` getters on the parsed
 * instant).
 */
export function formatWithPhpDatePattern(unformatted: string, pattern: string): string {
  const ms = parsePostDateToUtcMs(unformatted);
  if (ms === null) return '';
  const trimmed = pattern.trim();
  if (!trimmed) {
    const z = getLocalWallParts(ms);
    return `${z.year}-${pad2(z.monthIndex0 + 1)}-${pad2(z.day)}`;
  }

  const z = getLocalWallParts(ms);
  let out = '';
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (c === '\\') {
      out += trimmed[i + 1] ?? '';
      i++;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      out += formatTokenFromWall(z, c);
    } else {
      out += c;
    }
  }
  return out;
}
