import { describe, expect, it } from 'vitest';
import { jdFromDate, jdToDate, leapMonthOfYear, lunarToSolar, solarToLunar } from './lunar';
import { canChiName, dayCanChi, hourCanChi, monthCanChi, napAm, yearCanChi } from './canchi';
import { solarTermOfDay } from './solarTerms';
import { getDayInfo } from './dayInfo';

describe('đổi dương sang âm', () => {
  // [năm, tháng, ngày] dương lịch của mùng 1 Tết
  const TET: [number, number, number][] = [
    [1985, 1, 21], // Việt Nam ăn Tết sớm hơn Trung Quốc một tháng
    [2000, 2, 5],
    [2020, 1, 25],
    [2023, 1, 22],
    [2024, 2, 10],
    [2025, 1, 29],
    [2026, 2, 17],
    [2027, 2, 6],
    [2030, 2, 2], // sóc lúc 23:07 ngày 2/2 giờ Việt Nam; Trung Quốc là 3/2
  ];
  it.each(TET)('Tết %i rơi vào %i/%i', (y, m, d) => {
    expect(solarToLunar(d, m, y)).toMatchObject({ day: 1, month: 1, year: y, leap: false });
  });

  it('ngày trước Tết là ngày cuối tháng Chạp năm trước', () => {
    expect(solarToLunar(9, 2, 2024)).toMatchObject({ day: 30, month: 12, year: 2023 });
    expect(solarToLunar(28, 1, 2025)).toMatchObject({ day: 29, month: 12, year: 2024 });
  });

  it('nhận đúng tháng nhuận', () => {
    expect(solarToLunar(25, 7, 2025)).toMatchObject({ day: 1, month: 6, year: 2025, leap: true });
    expect(solarToLunar(22, 3, 2023)).toMatchObject({ day: 1, month: 2, year: 2023, leap: true });
    expect(solarToLunar(23, 5, 2020)).toMatchObject({ day: 1, month: 4, year: 2020, leap: true });
  });

  it('năm nhuận và tháng nhuận', () => {
    expect(leapMonthOfYear(2020)).toBe(4);
    expect(leapMonthOfYear(2023)).toBe(2);
    expect(leapMonthOfYear(2025)).toBe(6);
    expect(leapMonthOfYear(2024)).toBe(0);
    expect(leapMonthOfYear(2026)).toBe(0);
  });
});

describe('đổi âm sang dương', () => {
  it('các ngày lễ âm lịch', () => {
    expect(lunarToSolar(1, 1, 2026)).toEqual({ day: 17, month: 2, year: 2026 });
    expect(lunarToSolar(10, 3, 2025)).toEqual({ day: 7, month: 4, year: 2025 }); // Giỗ Tổ
    expect(lunarToSolar(15, 8, 2025)).toEqual({ day: 6, month: 10, year: 2025 }); // Trung thu
  });

  it('trả về null khi ngày âm không tồn tại', () => {
    expect(lunarToSolar(1, 5, 2025, true)).toBeNull(); // 2025 nhuận tháng 6, không nhuận tháng 5
    expect(lunarToSolar(1, 3, 2024, true)).toBeNull(); // 2024 không nhuận
    expect(lunarToSolar(30, 12, 2024)).toBeNull(); // tháng Chạp Giáp Thìn chỉ có 29 ngày
  });

  it('đổi qua lại khớp nhau trong suốt 1900-2100', () => {
    const start = jdFromDate(1, 1, 1900);
    const end = jdFromDate(31, 12, 2100);
    let prev = solarToLunar(31, 12, 1899);
    for (let jd = start; jd <= end; jd++) {
      const s = jdToDate(jd);
      const l = solarToLunar(s.day, s.month, s.year);
      // ngày âm phải nối tiếp: hoặc tăng 1, hoặc sang mùng 1 sau ngày 29/30
      if (l.day === 1) {
        expect(prev.day === 29 || prev.day === 30).toBe(true);
      } else {
        expect(l.day).toBe(prev.day + 1);
      }
      if (jd % 7 === 0) {
        expect(lunarToSolar(l.day, l.month, l.year, l.leap)).toEqual(s);
      }
      prev = l;
    }
  });
});

describe('can chi', () => {
  it('năm', () => {
    expect(canChiName(yearCanChi(2024))).toBe('Giáp Thìn');
    expect(canChiName(yearCanChi(2025))).toBe('Ất Tỵ');
    expect(canChiName(yearCanChi(2026))).toBe('Bính Ngọ');
    expect(canChiName(yearCanChi(1984))).toBe('Giáp Tý');
  });

  it('tháng', () => {
    expect(canChiName(monthCanChi(1, 2024))).toBe('Bính Dần');
    expect(canChiName(monthCanChi(1, 2026))).toBe('Canh Dần');
    expect(canChiName(monthCanChi(11, 2025))).toBe('Mậu Tý');
  });

  it('ngày', () => {
    expect(canChiName(dayCanChi(jdFromDate(1, 1, 2000)))).toBe('Mậu Ngọ');
    expect(canChiName(dayCanChi(jdFromDate(10, 2, 2024)))).toBe('Giáp Thìn');
  });

  it('giờ: ngày Giáp và ngày Kỷ khởi giờ Giáp Tý', () => {
    expect(canChiName(hourCanChi(0, 0))).toBe('Giáp Tý');
    expect(canChiName(hourCanChi(5, 0))).toBe('Giáp Tý');
    expect(canChiName(hourCanChi(1, 0))).toBe('Bính Tý');
    expect(canChiName(hourCanChi(4, 6))).toBe('Mậu Ngọ');
  });

  it('nạp âm', () => {
    expect(napAm(yearCanChi(1984))).toBe('Hải Trung Kim');
    expect(napAm(yearCanChi(1990))).toBe('Lộ Bàng Thổ');
    expect(napAm(yearCanChi(2024))).toBe('Phú Đăng Hỏa');
    expect(napAm(yearCanChi(2026))).toBe('Thiên Hà Thủy');
  });
});

describe('tiết khí', () => {
  const term = (d: number, m: number, y: number) => solarTermOfDay(jdFromDate(d, m, y));

  it('ngày bắt đầu tiết khí', () => {
    expect(term(21, 12, 2025)).toEqual({ name: 'Đông chí', startsToday: true });
    expect(term(4, 2, 2026)).toEqual({ name: 'Lập xuân', startsToday: true });
    expect(term(20, 3, 2026)).toEqual({ name: 'Xuân phân', startsToday: true });
    expect(term(5, 4, 2026)).toEqual({ name: 'Thanh minh', startsToday: true });
    expect(term(21, 6, 2026)).toEqual({ name: 'Hạ chí', startsToday: true });
  });

  it('ngày giữa tiết khí', () => {
    expect(term(10, 4, 2026)).toEqual({ name: 'Thanh minh', startsToday: false });
  });
});

describe('thông tin ngày', () => {
  it('thứ trong tuần và độ dài tháng âm', () => {
    const tet = getDayInfo(17, 2, 2026);
    expect(tet.weekday).toBe(2); // Thứ ba
    expect(tet.holidays.map((h) => h.name)).toContain('Mùng 1 Tết Nguyên đán');
    expect(getDayInfo(16, 2, 2026).holidays.map((h) => h.name)).toContain('Giao thừa');
    expect(getDayInfo(28, 1, 2025).lunarMonthLength).toBe(29);
    expect(getDayInfo(9, 2, 2024).lunarMonthLength).toBe(30);
  });

  it('mỗi ngày có đúng 6 giờ hoàng đạo', () => {
    expect(getDayInfo(26, 11, 2026).goodHours).toHaveLength(6);
  });
});
