import { describe, expect, it } from 'vitest';
import { getDayInfo } from './dayInfo';
import { jdFromDate } from './lunar';
import {
  eventsOnDay,
  lunarOccurrence,
  occursOn,
  parseEvents,
  toICS,
  upcoming,
  validateEvent,
  type UserEvent,
} from './events';

const gio: UserEvent = { id: 'a', title: 'Giỗ ông nội', kind: 'lunar-yearly', day: 10, month: 3 };
const cuoiThang: UserEvent = { id: 'b', title: 'Giỗ bà', kind: 'lunar-yearly', day: 30, month: 12 };
const sinhNhat: UserEvent = { id: 'c', title: 'Sinh nhật mẹ', kind: 'solar-yearly', day: 2, month: 12 };
const hen: UserEvent = { id: 'd', title: 'Hẹn khám', kind: 'solar-once', day: 5, month: 12, year: 2026 };

describe('sự kiện rơi vào ngày nào', () => {
  it('âm lịch hằng năm', () => {
    expect(occursOn(gio, getDayInfo(7, 4, 2025))).toBe(true); // 10/3 Ất Tỵ
    expect(occursOn(gio, getDayInfo(26, 4, 2026))).toBe(true); // 10/3 Bính Ngọ
    expect(occursOn(gio, getDayInfo(8, 4, 2025))).toBe(false);
  });

  it('không tính tháng nhuận', () => {
    const ev: UserEvent = { ...gio, day: 1, month: 6 };
    expect(occursOn(ev, getDayInfo(25, 6, 2025))).toBe(true); // 1/6 chính
    expect(occursOn(ev, getDayInfo(25, 7, 2025))).toBe(false); // 1/6 nhuận
  });

  it('ngày 30 gặp tháng thiếu thì dời về 29', () => {
    expect(occursOn(cuoiThang, getDayInfo(28, 1, 2025))).toBe(true); // 29 tháng Chạp thiếu
    expect(occursOn(cuoiThang, getDayInfo(9, 2, 2024))).toBe(true); // 30 tháng Chạp đủ
    expect(occursOn(cuoiThang, getDayInfo(8, 2, 2024))).toBe(false); // 29 tháng Chạp đủ
    expect(lunarOccurrence(cuoiThang, 2024)).toEqual({ day: 28, month: 1, year: 2025 });
    expect(lunarOccurrence(cuoiThang, 2023)).toEqual({ day: 9, month: 2, year: 2024 });
  });

  it('dương lịch hằng năm và một lần', () => {
    expect(occursOn(sinhNhat, getDayInfo(2, 12, 2030))).toBe(true);
    expect(occursOn(hen, getDayInfo(5, 12, 2026))).toBe(true);
    expect(occursOn(hen, getDayInfo(5, 12, 2027))).toBe(false);
    expect(eventsOnDay([gio, sinhNhat, hen], getDayInfo(2, 12, 2026))).toEqual([sinhNhat]);
  });
});

describe('sắp tới', () => {
  const start = jdFromDate(26, 11, 2026);

  it('gồm sự kiện và mùng 1, rằm, theo thứ tự thời gian', () => {
    const list = upcoming([sinhNhat, hen], start, 30, true);
    expect(list.map((o) => `${o.info.solar.day}/${o.info.solar.month} ${o.title}`)).toEqual([
      '2/12 Sinh nhật mẹ',
      '5/12 Hẹn khám',
      '9/12 Mùng 1 tháng 11',
      '23/12 Rằm tháng 11',
    ]);
  });

  it('tắt nhắc mùng 1, rằm', () => {
    const list = upcoming([sinhNhat], start, 30, false);
    expect(list.map((o) => o.kind)).toEqual(['event']);
  });
});

describe('xuất .ics', () => {
  const ics = toICS([gio, sinhNhat, hen], 2026, 3, new Date(Date.UTC(2026, 10, 26, 3, 0, 0)));

  it('đúng khung và xuống dòng CRLF', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('DTSTAMP:20261126T030000Z');
  });

  it('sự kiện âm lịch thành từng ngày dương cụ thể', () => {
    expect(ics.match(/SUMMARY:Giỗ ông nội/g)).toHaveLength(3);
    expect(ics).toContain('DTSTART;VALUE=DATE:20260426\r\nDTEND;VALUE=DATE:20260427');
    expect(ics).toContain('UID:a-2027@lich-van-su');
  });

  it('dương lịch hằng năm dùng RRULE, một lần thì không', () => {
    expect(ics.match(/RRULE:FREQ=YEARLY/g)).toHaveLength(1);
    expect(ics).toContain('DTSTART;VALUE=DATE:20261205');
  });

  it('thoát ký tự đặc biệt', () => {
    const tricky: UserEvent = { ...hen, title: 'Họp; A, B', note: 'dòng 1\ndòng 2' };
    const out = toICS([tricky], 2026);
    expect(out).toContain('SUMMARY:Họp\\; A\\, B');
    expect(out).toContain('DESCRIPTION:dòng 1\\ndòng 2');
  });
});

describe('kiểm tra dữ liệu', () => {
  it('báo lỗi ngày không hợp lệ', () => {
    expect(validateEvent({ ...gio, title: '  ' })).toMatch(/tên/);
    expect(validateEvent({ ...gio, day: 31 })).toMatch(/30 ngày/);
    expect(validateEvent({ ...sinhNhat, day: 31, month: 4 })).toMatch(/không tồn tại/);
    expect(validateEvent({ ...sinhNhat, day: 29, month: 2 })).toBeNull();
    expect(validateEvent({ ...hen, day: 29, month: 2, year: 2027 })).toMatch(/không tồn tại/);
    expect(validateEvent({ ...hen, year: undefined })).toMatch(/Năm/);
    expect(validateEvent(gio)).toBeNull();
  });

  it('khôi phục: giữ mục hợp lệ, bỏ mục hỏng', () => {
    const data = [gio, { id: 'x', title: 'thiếu loại', day: 1, month: 1 }, null, 'abc', { ...hen, day: 99 }];
    expect(parseEvents(data)).toEqual([gio]);
    expect(parseEvents({ not: 'array' })).toEqual([]);
    expect(parseEvents(JSON.parse(JSON.stringify([gio, sinhNhat, hen])))).toEqual([gio, sinhNhat, hen]);
  });
});
