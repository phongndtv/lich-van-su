// Vạn sự: ngày hoàng đạo/hắc đạo, 12 trực, nhị thập bát tú, sao tốt, ngày kỵ,
// tuổi xung và hướng xuất hành.
//
// Quy ước về "tháng":
// - Hoàng đạo/hắc đạo, 12 trực, Thiên Đức, Nguyệt Đức, Thiên Xá tính theo THÁNG TIẾT KHÍ
//   (tháng Dần bắt đầu từ Lập xuân, tháng Mão từ Kinh trập...), đúng theo cách tính cổ điển.
//   Một số trang lịch trên mạng tính theo tháng âm lịch nên có thể lệch ở những ngày
//   nằm giữa mùng 1 âm và ngày giao tiết.
// - Tam nương, Nguyệt kỵ, Dương công kỵ, Sát chủ, Thọ tử tính theo tháng âm lịch.

import { CAN, CHI, type CanChi } from './canchi';
import type { LunarDate } from './lunar';
import { solarTermIndex } from './solarTerms';

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Tháng tiết khí (1 = tháng Dần, bắt đầu từ Lập xuân ... 12 = tháng Sửu). */
export function tietMonth(jd: number): number {
  // Chỉ số tiết khí: 21 = Lập xuân, mỗi tháng gồm 2 tiết.
  return Math.floor(mod(solarTermIndex(jd) - 21, 24) / 2) + 1;
}

/** Chi của tháng (tháng 1 = Dần). */
const monthChi = (month: number) => mod(month + 1, 12);

// ---------- Hoàng đạo / hắc đạo ----------

const THAN = [
  { name: 'Thanh Long', good: true },
  { name: 'Minh Đường', good: true },
  { name: 'Thiên Hình', good: false },
  { name: 'Chu Tước', good: false },
  { name: 'Kim Quỹ', good: true },
  { name: 'Bảo Quang', good: true },
  { name: 'Bạch Hổ', good: false },
  { name: 'Ngọc Đường', good: true },
  { name: 'Thiên Lao', good: false },
  { name: 'Huyền Vũ', good: false },
  { name: 'Tư Mệnh', good: true },
  { name: 'Câu Trần', good: false },
];

/** Thần trực nhật: tháng 1 và 7 Thanh Long khởi ở ngày Tý, mỗi tháng tiến 2 chi. */
export function dayGod(month: number, dayChi: number) {
  const thanhLong = mod((month - 1) * 2, 12);
  return THAN[mod(dayChi - thanhLong, 12)];
}

// ---------- 12 trực ----------

export interface Truc {
  name: string;
  nen: string[];
  kieng: string[];
}

const TRUC: Truc[] = [
  {
    name: 'Kiến',
    nen: ['Xuất hành', 'Khai trương', 'Nhậm chức', 'Cầu tài'],
    kieng: ['Động thổ', 'Đào giếng', 'An táng'],
  },
  {
    name: 'Trừ',
    nen: ['Chữa bệnh', 'Dọn dẹp, tẩy uế', 'Cúng tế', 'Bỏ thói quen xấu'],
    kieng: ['Cưới hỏi', 'Ký kết', 'Xuất hành xa'],
  },
  {
    name: 'Mãn',
    nen: ['Cầu tài', 'Cúng tế', 'Khai trương', 'Xuất hành'],
    kieng: ['An táng', 'Kiện tụng', 'Nhậm chức'],
  },
  {
    name: 'Bình',
    nen: ['Cưới hỏi', 'San nền, sửa đường', 'Sửa nhà', 'Giao dịch'],
    kieng: ['Đào mương, khơi rãnh'],
  },
  {
    name: 'Định',
    nen: ['Cưới hỏi', 'Ký kết, giao dịch', 'Nhập học', 'Cầu tài'],
    kieng: ['Kiện tụng', 'Xuất hành xa', 'Chữa bệnh'],
  },
  {
    name: 'Chấp',
    nen: ['Xây dựng, tu sửa', 'Trồng trọt', 'Tuyển người', 'Lập khế ước'],
    kieng: ['Xuất hành', 'Dời nhà', 'Mở kho, xuất tiền'],
  },
  {
    name: 'Phá',
    nen: ['Phá dỡ nhà cũ', 'Chữa bệnh'],
    kieng: ['Cưới hỏi', 'Khai trương', 'Ký kết', 'Xuất hành', 'Động thổ'],
  },
  {
    name: 'Nguy',
    nen: ['Cúng tế', 'Cầu phúc'],
    kieng: ['Leo cao, đi thuyền', 'Khai trương', 'Động thổ', 'Xuất hành xa'],
  },
  {
    name: 'Thành',
    nen: ['Cưới hỏi', 'Khai trương', 'Nhập học', 'Dọn nhà', 'Xuất hành'],
    kieng: ['Kiện tụng', 'Tranh chấp'],
  },
  {
    name: 'Thu',
    nen: ['Thu hoạch', 'Thu nợ', 'Nhập kho', 'Cầu tài'],
    kieng: ['An táng', 'Xuất hành', 'Khai trương'],
  },
  {
    name: 'Khai',
    nen: ['Khai trương', 'Cưới hỏi', 'Động thổ', 'Nhập học', 'Xuất hành'],
    kieng: ['An táng'],
  },
  {
    name: 'Bế',
    nen: ['Đắp đê, lấp hố', 'Xây tường', 'An táng'],
    kieng: ['Khai trương', 'Xuất hành', 'Nhậm chức', 'Chữa mắt'],
  },
];

/** Trực Kiến rơi vào ngày có chi trùng chi của tháng. */
export function dayTruc(month: number, dayChi: number): Truc {
  return TRUC[mod(dayChi - monthChi(month), 12)];
}

// ---------- Nhị thập bát tú ----------

const TU = [
  ['Giác', 'Giác Mộc Giao', true], ['Cang', 'Cang Kim Long', false],
  ['Đê', 'Đê Thổ Lạc', false], ['Phòng', 'Phòng Nhật Thố', true],
  ['Tâm', 'Tâm Nguyệt Hồ', false], ['Vĩ', 'Vĩ Hỏa Hổ', true],
  ['Cơ', 'Cơ Thủy Báo', true], ['Đẩu', 'Đẩu Mộc Giải', true],
  ['Ngưu', 'Ngưu Kim Ngưu', false], ['Nữ', 'Nữ Thổ Bức', false],
  ['Hư', 'Hư Nhật Thử', false], ['Nguy', 'Nguy Nguyệt Yến', false],
  ['Thất', 'Thất Hỏa Trư', true], ['Bích', 'Bích Thủy Du', true],
  ['Khuê', 'Khuê Mộc Lang', false], ['Lâu', 'Lâu Kim Cẩu', true],
  ['Vị', 'Vị Thổ Trĩ', true], ['Mão', 'Mão Nhật Kê', false],
  ['Tất', 'Tất Nguyệt Ô', true], ['Chủy', 'Chủy Hỏa Hầu', false],
  ['Sâm', 'Sâm Thủy Viên', true], ['Tỉnh', 'Tỉnh Mộc Hãn', true],
  ['Quỷ', 'Quỷ Kim Dương', false], ['Liễu', 'Liễu Thổ Chương', false],
  ['Tinh', 'Tinh Nhật Mã', false], ['Trương', 'Trương Nguyệt Lộc', true],
  ['Dực', 'Dực Hỏa Xà', false], ['Chẩn', 'Chẩn Thủy Dẫn', true],
] as const;

/** 28 sao luân phiên theo ngày, gắn cố định với thứ trong tuần (Giác luôn là thứ Năm). */
export function dayTu(jd: number) {
  const [name, fullName, good] = TU[mod(jd + 11, 28)];
  return { name, fullName, good };
}

// ---------- Sao tốt ----------

// Thiên Đức theo tháng: có tháng tính theo can ngày, có tháng theo chi ngày.
const THIEN_DUC: { can?: number; chi?: number }[] = [
  { can: 3 }, { chi: 8 }, { can: 8 }, { can: 7 }, { chi: 11 }, { can: 0 },
  { can: 9 }, { chi: 2 }, { can: 2 }, { can: 1 }, { chi: 5 }, { can: 6 },
];
// Nguyệt Đức theo can ngày: tháng 1,5,9 Bính; 2,6,10 Giáp; 3,7,11 Nhâm; 4,8,12 Canh.
const NGUYET_DUC = [2, 0, 8, 6];
// Thiên Xá theo mùa: Xuân Mậu Dần, Hạ Giáp Ngọ, Thu Mậu Thân, Đông Giáp Tý.
const THIEN_XA: CanChi[] = [
  { can: 4, chi: 2 }, { can: 0, chi: 6 }, { can: 4, chi: 8 }, { can: 0, chi: 0 },
];

export function goodStars(month: number, day: CanChi): string[] {
  const stars: string[] = [];
  const td = THIEN_DUC[month - 1];
  if (td.can === day.can || td.chi === day.chi) stars.push('Thiên Đức');
  if (NGUYET_DUC[(month - 1) % 4] === day.can) stars.push('Nguyệt Đức');
  const xa = THIEN_XA[Math.floor((month - 1) / 3)];
  if (xa.can === day.can && xa.chi === day.chi) stars.push('Thiên Xá');
  return stars;
}

// ---------- Ngày kỵ ----------

export interface Taboo {
  name: string;
  note: string;
}

const TAM_NUONG = [3, 7, 13, 18, 22, 27];
const NGUYET_KY = [5, 14, 23];
// Dương công kỵ nhật: [ngày, tháng] âm lịch.
const DUONG_CONG = [
  [13, 1], [11, 2], [9, 3], [7, 4], [5, 5], [3, 6], [8, 7], [29, 7],
  [27, 8], [25, 9], [23, 10], [21, 11], [19, 12],
];
// Chi của ngày Sát chủ và Thọ tử theo tháng âm lịch 1..12.
const SAT_CHU = [0, 1, 1, 10, 4, 4, 1, 4, 1, 4, 7, 4];
const THO_TU = [10, 4, 11, 5, 0, 6, 1, 7, 2, 8, 3, 9];

export function taboos(lunar: LunarDate, dayChi: number): Taboo[] {
  const list: Taboo[] = [];
  if (TAM_NUONG.includes(lunar.day)) {
    list.push({ name: 'Tam nương', note: 'kiêng khởi sự việc lớn, cưới hỏi, khai trương' });
  }
  if (NGUYET_KY.includes(lunar.day)) {
    list.push({ name: 'Nguyệt kỵ', note: 'mùng 5, 14, 23: kiêng xuất hành, khởi sự' });
  }
  if (DUONG_CONG.some(([d, m]) => d === lunar.day && m === lunar.month)) {
    list.push({ name: 'Dương công kỵ', note: 'kiêng động thổ, xây cất, cưới hỏi' });
  }
  if (SAT_CHU[lunar.month - 1] === dayChi) {
    list.push({ name: 'Sát chủ', note: 'kiêng xây cất, cưới hỏi, nhận việc mới' });
  }
  if (THO_TU[lunar.month - 1] === dayChi) {
    list.push({ name: 'Thọ tử', note: 'trăm sự đều kỵ' });
  }
  return list;
}

// ---------- Tuổi xung và hướng xuất hành ----------

/** Tuổi xung với ngày: chi đối xung, nặng nhất là hai tuổi có can khắc với can ngày. */
export function clashingAges(day: CanChi) {
  const chi = mod(day.chi + 6, 12);
  return {
    chi: CHI[chi],
    worst: [mod(day.can + 6, 10), mod(day.can + 4, 10)].map((c) => `${CAN[c]} ${CHI[chi]}`),
  };
}

const HY_THAN = ['Đông Bắc', 'Tây Bắc', 'Tây Nam', 'Nam', 'Đông Nam'];
const TAI_THAN = [
  'Đông Nam', 'Đông Nam', 'Đông', 'Đông', 'Bắc', 'Nam', 'Tây Nam', 'Tây Nam', 'Tây', 'Tây Bắc',
];

export function directions(dayCan: number) {
  return { hyThan: HY_THAN[dayCan % 5], taiThan: TAI_THAN[dayCan] };
}

// ---------- Tổng hợp ----------

export interface VanSu {
  tietMonth: number;
  god: { name: string; good: boolean };
  truc: Truc;
  tu: { name: string; fullName: string; good: boolean };
  goodStars: string[];
  taboos: Taboo[];
  clash: { chi: string; worst: string[] };
  directions: { hyThan: string; taiThan: string };
}

export function getVanSu(jd: number, lunar: LunarDate, day: CanChi): VanSu {
  const month = tietMonth(jd);
  return {
    tietMonth: month,
    god: dayGod(month, day.chi),
    truc: dayTruc(month, day.chi),
    tu: dayTu(jd),
    goodStars: goodStars(month, day),
    taboos: taboos(lunar, day.chi),
    clash: clashingAges(day),
    directions: directions(day.can),
  };
}
