// Tìm ngày tốt cho một việc cụ thể, có xét tuổi.
//
// Cách chấm (là quy ước của phần mềm này, dựa trên các yếu tố ở vansu.ts):
// - Loại ngày nếu: phạm ngày kỵ, trực của ngày kiêng việc đó, hoặc ngày xung với tuổi.
// - Ngày còn lại phải là ngày hoàng đạo hoặc có trực hợp việc.
// - Xếp hạng 1-3 sao theo số yếu tố tốt hội tụ.

import { CHI, yearCanChi } from './canchi';
import { getDayInfoByJd, type DayInfo } from './dayInfo';

export interface Activity {
  id: string;
  name: string;
  /** từ khóa tìm trong danh sách "nên làm" của trực */
  nen: string[];
  /** từ khóa tìm trong danh sách "nên kiêng" của trực */
  kieng: string[];
}

export const ACTIVITIES: Activity[] = [
  { id: 'cuoi', name: 'Cưới hỏi', nen: ['cưới hỏi'], kieng: ['cưới hỏi'] },
  { id: 'khaitruong', name: 'Khai trương, mở hàng', nen: ['khai trương'], kieng: ['khai trương'] },
  {
    id: 'dongtho',
    name: 'Động thổ, xây sửa nhà',
    nen: ['động thổ', 'xây dựng', 'sửa nhà'],
    kieng: ['động thổ'],
  },
  { id: 'nhaptrach', name: 'Dọn về nhà mới', nen: ['dọn nhà'], kieng: ['dời nhà'] },
  { id: 'xuathanh', name: 'Xuất hành, đi xa', nen: ['xuất hành'], kieng: ['xuất hành'] },
  {
    id: 'kyket',
    name: 'Ký kết, giao dịch',
    nen: ['ký kết', 'khế ước', 'giao dịch'],
    kieng: ['ký kết'],
  },
  { id: 'cautai', name: 'Cầu tài lộc', nen: ['cầu tài'], kieng: ['xuất tiền'] },
  {
    id: 'nhaphoc',
    name: 'Nhập học, nhận việc',
    nen: ['nhập học', 'nhậm chức'],
    kieng: ['nhậm chức'],
  },
  { id: 'antang', name: 'An táng', nen: ['an táng'], kieng: ['an táng'] },
];

const matches = (list: string[], keywords: string[]) =>
  list.some((item) => keywords.some((k) => item.toLowerCase().includes(k)));

/** Quan hệ giữa chi của ngày và chi tuổi (năm sinh âm lịch). */
export function ageRelation(dayChi: number, birthYear: number): 'xung' | 'hop' | null {
  const ageChi = yearCanChi(birthYear).chi;
  const diff = (dayChi - ageChi + 12) % 12;
  if (diff === 6) return 'xung';
  // Tam hợp: cách nhau 4 chi. Lục hợp: Tý-Sửu, Dần-Hợi, Mão-Tuất, Thìn-Dậu, Tỵ-Thân, Ngọ-Mùi.
  if (diff === 4 || diff === 8 || (dayChi + ageChi) % 12 === 1) return 'hop';
  return null;
}

export interface Evaluation {
  info: DayInfo;
  /** true nếu ngày dùng được cho việc này */
  ok: boolean;
  /** 1-3 khi ok, 0 khi không */
  stars: number;
  good: string[];
  bad: string[];
}

export function evaluateDay(info: DayInfo, activity: Activity, birthYear?: number): Evaluation {
  const v = info.vanSu;
  const good: string[] = [];
  const bad: string[] = [];

  if (v.god.good) good.push(`Hoàng đạo (${v.god.name})`);
  const trucHop = matches(v.truc.nen, activity.nen);
  if (trucHop) good.push(`Trực ${v.truc.name} hợp việc`);
  if (v.tu.good) good.push(`Sao ${v.tu.name} tốt`);
  for (const s of v.goodStars) good.push(s);

  for (const t of v.taboos) bad.push(t.name);
  if (matches(v.truc.kieng, activity.kieng)) bad.push(`Trực ${v.truc.name} kiêng việc này`);

  let hopTuoi = false;
  if (birthYear !== undefined) {
    const rel = ageRelation(info.dayCC.chi, birthYear);
    if (rel === 'xung') bad.push(`Ngày ${CHI[info.dayCC.chi]} xung tuổi`);
    if (rel === 'hop') {
      hopTuoi = true;
      good.push('Hợp tuổi');
    }
  }

  const ok = bad.length === 0 && (v.god.good || trucHop);
  let stars = 0;
  if (ok) {
    const extra = v.tu.good || v.goodStars.length > 0 || hopTuoi;
    if (v.god.good && trucHop) stars = 3;
    else stars = extra ? 2 : 1;
  }
  return { info, ok, stars, good, bad };
}

/** Các ngày dùng được trong `days` ngày kể từ startJd, theo thứ tự thời gian. */
export function findGoodDays(
  startJd: number,
  days: number,
  activity: Activity,
  birthYear?: number,
): Evaluation[] {
  const result: Evaluation[] = [];
  for (let i = 0; i < days; i++) {
    const e = evaluateDay(getDayInfoByJd(startJd + i), activity, birthYear);
    if (e.ok) result.push(e);
  }
  return result;
}
