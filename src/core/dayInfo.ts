// Gom toàn bộ thông tin của một ngày để giao diện dùng.

import { jdFromDate, jdToDate, solarToLunar, type LunarDate, type SolarDate } from './lunar';
import {
  auspiciousHours,
  dayCanChi,
  hourCanChi,
  monthCanChi,
  napAm,
  yearCanChi,
  type CanChi,
} from './canchi';
import { solarTermOfDay, type SolarTermInfo } from './solarTerms';
import { holidaysOf, type Holiday } from './holidays';
import { getVanSu, type VanSu } from './vansu';

export const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

export interface DayInfo {
  solar: SolarDate;
  lunar: LunarDate;
  jd: number;
  /** 0 = Chủ nhật ... 6 = Thứ bảy */
  weekday: number;
  /** số ngày của tháng âm hiện tại (29 hoặc 30) */
  lunarMonthLength: number;
  dayCC: CanChi;
  monthCC: CanChi;
  yearCC: CanChi;
  dayNapAm: string;
  yearNapAm: string;
  term: SolarTermInfo;
  goodHours: CanChi[];
  holidays: Holiday[];
  vanSu: VanSu;
}

export function getDayInfo(day: number, month: number, year: number): DayInfo {
  const jd = jdFromDate(day, month, year);
  const lunar = solarToLunar(day, month, year);

  // Mùng 1 của tháng âm này và của tháng âm kế tiếp cho ra độ dài tháng.
  const monthStart = jd - lunar.day + 1;
  const d29 = jdToDate(monthStart + 29);
  const lunarMonthLength = solarToLunar(d29.day, d29.month, d29.year).day === 1 ? 29 : 30;

  const dayCC = dayCanChi(jd);
  const yearCC = yearCanChi(lunar.year);
  const isLastDayOfYear = lunar.month === 12 && !lunar.leap && lunar.day === lunarMonthLength;

  return {
    solar: { day, month, year },
    lunar,
    jd,
    weekday: (jd + 1) % 7,
    lunarMonthLength,
    dayCC,
    monthCC: monthCanChi(lunar.month, lunar.year),
    yearCC,
    dayNapAm: napAm(dayCC),
    yearNapAm: napAm(yearCC),
    term: solarTermOfDay(jd),
    goodHours: auspiciousHours(dayCC.chi).map((h) => hourCanChi(dayCC.can, h)),
    holidays: holidaysOf(day, month, lunar, isLastDayOfYear),
    vanSu: getVanSu(jd, lunar, dayCC),
  };
}

export function getDayInfoByJd(jd: number): DayInfo {
  const s = jdToDate(jd);
  return getDayInfo(s.day, s.month, s.year);
}
