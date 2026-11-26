// Sự kiện cá nhân: ngày giỗ, sinh nhật âm, kỷ niệm... và nhắc mùng 1, rằm.

import { getDayInfoByJd, type DayInfo } from './dayInfo';
import { jdFromDate, jdToDate, lunarToSolar, type SolarDate } from './lunar';

export type EventKind = 'lunar-yearly' | 'solar-yearly' | 'solar-once';

export interface UserEvent {
  id: string;
  title: string;
  kind: EventKind;
  day: number;
  month: number;
  /** chỉ dùng cho solar-once */
  year?: number;
  note?: string;
}

export const KIND_LABEL: Record<EventKind, string> = {
  'lunar-yearly': 'Âm lịch, hằng năm',
  'solar-yearly': 'Dương lịch, hằng năm',
  'solar-once': 'Dương lịch, một lần',
};

/**
 * Sự kiện có rơi vào ngày này không.
 * Sự kiện âm lịch ngày 30 gặp tháng thiếu thì tính vào ngày 29; tháng nhuận không tính.
 */
export function occursOn(ev: UserEvent, info: DayInfo): boolean {
  if (ev.kind === 'lunar-yearly') {
    const l = info.lunar;
    if (l.leap || l.month !== ev.month) return false;
    return l.day === ev.day || (ev.day === 30 && l.day === 29 && info.lunarMonthLength === 29);
  }
  const s = info.solar;
  if (s.day !== ev.day || s.month !== ev.month) return false;
  return ev.kind === 'solar-yearly' || s.year === ev.year;
}

export function eventsOnDay(events: UserEvent[], info: DayInfo): UserEvent[] {
  return events.filter((e) => occursOn(e, info));
}

/** Ngày dương của sự kiện âm lịch trong năm âm lịch lunarYear. */
export function lunarOccurrence(ev: UserEvent, lunarYear: number): SolarDate | null {
  return (
    lunarToSolar(ev.day, ev.month, lunarYear) ??
    (ev.day === 30 ? lunarToSolar(29, ev.month, lunarYear) : null)
  );
}

export interface Occurrence {
  jd: number;
  info: DayInfo;
  title: string;
  /** 'moon' là nhắc mùng 1 hoặc rằm */
  kind: 'event' | 'moon';
  event?: UserEvent;
}

/** Các sự kiện và ngày mùng 1/rằm trong `days` ngày kể từ startJd, theo thứ tự thời gian. */
export function upcoming(
  events: UserEvent[],
  startJd: number,
  days: number,
  remindMoon: boolean,
): Occurrence[] {
  const list: Occurrence[] = [];
  for (let i = 0; i < days; i++) {
    const info = getDayInfoByJd(startJd + i);
    if (remindMoon && (info.lunar.day === 1 || info.lunar.day === 15)) {
      const month = `tháng ${info.lunar.month}${info.lunar.leap ? ' nhuận' : ''}`;
      list.push({
        jd: info.jd,
        info,
        title: info.lunar.day === 1 ? `Mùng 1 ${month}` : `Rằm ${month}`,
        kind: 'moon',
      });
    }
    for (const event of eventsOnDay(events, info)) {
      list.push({ jd: info.jd, info, title: event.title, kind: 'event', event });
    }
  }
  return list;
}

// ---------- Xuất sang lịch của máy (.ics) ----------

const pad = (n: number, len = 2) => String(n).padStart(len, '0');
const icsDate = (d: SolarDate) => `${pad(d.year, 4)}${pad(d.month)}${pad(d.day)}`;
const icsText = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

function vevent(uid: string, date: SolarDate, ev: UserEvent, stamp: string, rrule?: string) {
  const next = jdToDate(jdFromDate(date.day, date.month, date.year) + 1);
  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}@lich-van-su`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(date)}`,
    `DTEND;VALUE=DATE:${icsDate(next)}`,
    `SUMMARY:${icsText(ev.title)}`,
  ];
  const desc = [
    ev.kind === 'lunar-yearly' ? `Ngày ${ev.day}/${ev.month} âm lịch` : '',
    ev.note ?? '',
  ]
    .filter(Boolean)
    .join('\n');
  if (desc) lines.push(`DESCRIPTION:${icsText(desc)}`);
  if (rrule) lines.push(`RRULE:${rrule}`);
  lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Nhắc', 'TRIGGER:-P1D', 'END:VALARM');
  lines.push('END:VEVENT');
  return lines;
}

/**
 * Tạo nội dung tệp .ics. Lịch của máy không hiểu lặp theo âm lịch, nên sự kiện âm lịch
 * được ghi thành từng ngày dương cụ thể cho `years` năm âm lịch kể từ fromYear.
 */
export function toICS(events: UserEvent[], fromYear: number, years = 10, now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lich Van Su//VI', 'CALSCALE:GREGORIAN'];
  for (const ev of events) {
    if (ev.kind === 'lunar-yearly') {
      for (let y = fromYear; y < fromYear + years; y++) {
        const date = lunarOccurrence(ev, y);
        if (date) lines.push(...vevent(`${ev.id}-${y}`, date, ev, stamp));
      }
    } else if (ev.kind === 'solar-yearly') {
      const date = { day: ev.day, month: ev.month, year: fromYear };
      lines.push(...vevent(ev.id, date, ev, stamp, 'FREQ=YEARLY'));
    } else if (ev.year !== undefined) {
      lines.push(...vevent(ev.id, { day: ev.day, month: ev.month, year: ev.year }, ev, stamp));
    }
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

// ---------- Kiểm tra dữ liệu (khi thêm mới và khi khôi phục từ tệp) ----------

/** Trả về thông báo lỗi, hoặc null nếu hợp lệ. */
export function validateEvent(ev: Omit<UserEvent, 'id'>): string | null {
  if (!ev.title.trim()) return 'Chưa nhập tên sự kiện.';
  if (!Number.isInteger(ev.month) || ev.month < 1 || ev.month > 12) return 'Tháng phải từ 1 đến 12.';
  if (!Number.isInteger(ev.day) || ev.day < 1) return 'Ngày không hợp lệ.';
  if (ev.kind === 'lunar-yearly') {
    return ev.day > 30 ? 'Tháng âm lịch chỉ có tối đa 30 ngày.' : null;
  }
  if (ev.kind === 'solar-yearly') {
    // Dùng năm nhuận để chấp nhận 29/2.
    const back = jdToDate(jdFromDate(ev.day, ev.month, 2024));
    return back.day === ev.day && back.month === ev.month ? null : 'Ngày dương lịch không tồn tại.';
  }
  if (ev.year === undefined || !Number.isInteger(ev.year) || ev.year < 1900 || ev.year > 2100) {
    return 'Năm phải trong khoảng 1900-2100.';
  }
  const back = jdToDate(jdFromDate(ev.day, ev.month, ev.year));
  return back.day === ev.day && back.month === ev.month ? null : 'Ngày dương lịch không tồn tại.';
}

/** Đọc danh sách sự kiện từ dữ liệu JSON không tin cậy; bỏ qua mục hỏng. */
export function parseEvents(data: unknown): UserEvent[] {
  if (!Array.isArray(data)) return [];
  const result: UserEvent[] = [];
  for (const raw of data) {
    if (typeof raw !== 'object' || raw === null) continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== 'string' || !r.id || typeof r.title !== 'string') continue;
    if (r.kind !== 'lunar-yearly' && r.kind !== 'solar-yearly' && r.kind !== 'solar-once') continue;
    const ev: UserEvent = {
      id: r.id,
      title: r.title.trim(),
      kind: r.kind,
      day: Number(r.day),
      month: Number(r.month),
    };
    if (r.kind === 'solar-once') ev.year = Number(r.year);
    if (typeof r.note === 'string' && r.note.trim()) ev.note = r.note.trim();
    if (validateEvent(ev) === null) result.push(ev);
  }
  return result;
}
