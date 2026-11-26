// Ngày lễ dương lịch và lễ tết âm lịch Việt Nam.

import type { LunarDate } from './lunar';

const SOLAR: Record<string, string> = {
  '1/1': 'Tết Dương lịch',
  '3/2': 'Thành lập Đảng Cộng sản Việt Nam',
  '14/2': 'Lễ Tình nhân',
  '27/2': 'Ngày Thầy thuốc Việt Nam',
  '8/3': 'Quốc tế Phụ nữ',
  '26/3': 'Thành lập Đoàn TNCS Hồ Chí Minh',
  '30/4': 'Giải phóng miền Nam, thống nhất đất nước',
  '1/5': 'Quốc tế Lao động',
  '7/5': 'Chiến thắng Điện Biên Phủ',
  '19/5': 'Ngày sinh Chủ tịch Hồ Chí Minh',
  '1/6': 'Quốc tế Thiếu nhi',
  '21/6': 'Ngày Báo chí Cách mạng Việt Nam',
  '28/6': 'Ngày Gia đình Việt Nam',
  '27/7': 'Ngày Thương binh Liệt sĩ',
  '19/8': 'Cách mạng tháng Tám',
  '2/9': 'Quốc khánh',
  '10/10': 'Giải phóng Thủ đô',
  '20/10': 'Ngày Phụ nữ Việt Nam',
  '20/11': 'Ngày Nhà giáo Việt Nam',
  '22/12': 'Thành lập Quân đội Nhân dân Việt Nam',
  '24/12': 'Lễ Giáng sinh',
};

const LUNAR: Record<string, string> = {
  '1/1': 'Mùng 1 Tết Nguyên đán',
  '2/1': 'Mùng 2 Tết',
  '3/1': 'Mùng 3 Tết',
  '15/1': 'Tết Nguyên tiêu',
  '3/3': 'Tết Hàn thực',
  '10/3': 'Giỗ Tổ Hùng Vương',
  '15/4': 'Lễ Phật đản',
  '5/5': 'Tết Đoan ngọ',
  '7/7': 'Thất tịch',
  '15/7': 'Lễ Vu lan',
  '15/8': 'Tết Trung thu',
  '9/9': 'Tết Trùng cửu',
  '10/10': 'Tết Thường tân',
  '15/10': 'Tết Hạ nguyên',
  '23/12': 'Ông Công, ông Táo',
};

export interface Holiday {
  name: string;
  kind: 'solar' | 'lunar';
}

/**
 * Các ngày lễ rơi vào một ngày.
 * isLastDayOfLunarYear: ngày cuối tháng Chạp (29 hoặc 30) để nhận ra Giao thừa.
 */
export function holidaysOf(
  day: number,
  month: number,
  lunar: LunarDate,
  isLastDayOfLunarYear: boolean,
): Holiday[] {
  const result: Holiday[] = [];
  if (!lunar.leap) {
    const l = LUNAR[`${lunar.day}/${lunar.month}`];
    if (l) result.push({ name: l, kind: 'lunar' });
  }
  if (isLastDayOfLunarYear) result.push({ name: 'Giao thừa', kind: 'lunar' });
  const s = SOLAR[`${day}/${month}`];
  if (s) result.push({ name: s, kind: 'solar' });
  return result;
}
