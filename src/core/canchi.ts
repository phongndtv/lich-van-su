// Can chi, nạp âm ngũ hành và giờ hoàng đạo.

export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
export const CHI = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
];
export const CON_GIAP = [
  'Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Lợn',
];

const NAP_AM = [
  'Hải Trung Kim', 'Lư Trung Hỏa', 'Đại Lâm Mộc', 'Lộ Bàng Thổ', 'Kiếm Phong Kim',
  'Sơn Đầu Hỏa', 'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Dương Liễu Mộc',
  'Tuyền Trung Thủy', 'Ốc Thượng Thổ', 'Tích Lịch Hỏa', 'Tùng Bách Mộc', 'Trường Lưu Thủy',
  'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Bình Địa Mộc', 'Bích Thượng Thổ', 'Kim Bạch Kim',
  'Phú Đăng Hỏa', 'Thiên Hà Thủy', 'Đại Trạch Thổ', 'Thoa Xuyến Kim', 'Tang Đố Mộc',
  'Đại Khê Thủy', 'Sa Trung Thổ', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Đại Hải Thủy',
];

export interface CanChi {
  can: number;
  chi: number;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

export function canChiName(cc: CanChi): string {
  return `${CAN[cc.can]} ${CHI[cc.chi]}`;
}

/** Can chi của năm âm lịch. */
export function yearCanChi(lunarYear: number): CanChi {
  return { can: mod(lunarYear + 6, 10), chi: mod(lunarYear + 8, 12) };
}

/** Can chi của tháng âm lịch (tháng nhuận lấy theo tháng chính). */
export function monthCanChi(lunarMonth: number, lunarYear: number): CanChi {
  return { can: mod(lunarYear * 12 + lunarMonth + 3, 10), chi: mod(lunarMonth + 1, 12) };
}

/** Can chi của ngày theo số ngày Julius. */
export function dayCanChi(jd: number): CanChi {
  return { can: mod(jd + 9, 10), chi: mod(jd + 1, 12) };
}

/** Can chi của giờ (hourChi: 0 = Tý ... 11 = Hợi) trong ngày có can dayCan. */
export function hourCanChi(dayCan: number, hourChi: number): CanChi {
  return { can: mod((dayCan % 5) * 2 + hourChi, 10), chi: hourChi };
}

/** Vị trí trong vòng 60 hoa giáp (0 = Giáp Tý). */
export function sexagenaryIndex(cc: CanChi): number {
  return mod(6 * cc.can - 5 * cc.chi, 60);
}

/** Ngũ hành nạp âm của một cặp can chi. */
export function napAm(cc: CanChi): string {
  return NAP_AM[Math.floor(sexagenaryIndex(cc) / 2)];
}

/** Khoảng giờ dương lịch của một giờ chi, ví dụ Tý -> "23-1". */
export function hourRange(hourChi: number): string {
  const start = mod(hourChi * 2 - 1, 24);
  const end = mod(hourChi * 2 + 1, 24);
  return `${start}-${end}`;
}

// Bảng giờ hoàng đạo theo chi của ngày (Tý/Ngọ, Sửu/Mùi, Dần/Thân, Mão/Dậu, Thìn/Tuất, Tỵ/Hợi).
const GIO_HOANG_DAO = [
  '110100101100',
  '001101001011',
  '110011010010',
  '101100110100',
  '001011001101',
  '010010110011',
];

/** Danh sách chi của các giờ hoàng đạo trong ngày có chi dayChi. */
export function auspiciousHours(dayChi: number): number[] {
  const pattern = GIO_HOANG_DAO[dayChi % 6];
  const hours: number[] = [];
  for (let i = 0; i < 12; i++) {
    if (pattern[i] === '1') hours.push(i);
  }
  return hours;
}
