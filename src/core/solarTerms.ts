// 24 tiết khí, tính theo kinh độ mặt trời (mỗi tiết 15 độ, bắt đầu từ Xuân phân = 0 độ).

import { sunLongitude, VN_TZ } from './lunar';

export const TIET_KHI = [
  'Xuân phân', 'Thanh minh', 'Cốc vũ', 'Lập hạ', 'Tiểu mãn', 'Mang chủng',
  'Hạ chí', 'Tiểu thử', 'Đại thử', 'Lập thu', 'Xử thử', 'Bạch lộ',
  'Thu phân', 'Hàn lộ', 'Sương giáng', 'Lập đông', 'Tiểu tuyết', 'Đại tuyết',
  'Đông chí', 'Tiểu hàn', 'Đại hàn', 'Lập xuân', 'Vũ thủy', 'Kinh trập',
];

/** Chỉ số tiết khí (0..23) tại cuối ngày có số Julius jd theo giờ địa phương. */
export function solarTermIndex(jd: number, tz = VN_TZ): number {
  return Math.floor((sunLongitude(jd + 0.5 - tz / 24) / Math.PI) * 12);
}

export interface SolarTermInfo {
  /** Tiết khí đang diễn ra trong ngày */
  name: string;
  /** true nếu tiết khí bắt đầu đúng vào ngày này */
  startsToday: boolean;
}

export function solarTermOfDay(jd: number, tz = VN_TZ): SolarTermInfo {
  const idx = solarTermIndex(jd, tz);
  return { name: TIET_KHI[idx], startsToday: idx !== solarTermIndex(jd - 1, tz) };
}
