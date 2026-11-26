import { describe, expect, it } from 'vitest';
import { jdFromDate, lunarToSolar } from './lunar';
import { getDayInfo } from './dayInfo';
import { dayGod, dayTu, directions, goodStars, tietMonth } from './vansu';

const vs = (d: number, m: number, y: number) => getDayInfo(d, m, y).vanSu;

describe('tháng tiết khí', () => {
  it('đổi tháng đúng ngày giao tiết', () => {
    expect(tietMonth(jdFromDate(3, 2, 2026))).toBe(12); // trước Lập xuân
    expect(tietMonth(jdFromDate(4, 2, 2026))).toBe(1); // Lập xuân
    expect(tietMonth(jdFromDate(6, 11, 2026))).toBe(9);
    expect(tietMonth(jdFromDate(7, 11, 2026))).toBe(10); // Lập đông
  });
});

describe('ngày 26/11/2026 (Giáp Thìn, 18/10 âm, tiết Tiểu tuyết)', () => {
  const v = vs(26, 11, 2026);
  it('trực Chấp, sao Khuê', () => {
    expect(v.truc.name).toBe('Chấp');
    expect(v.tu.name).toBe('Khuê');
  });
  it('hoàng đạo Tư Mệnh', () => {
    expect(v.god).toEqual({ name: 'Tư Mệnh', good: true });
  });
  it('phạm Tam nương và Sát chủ (tháng 10 âm ngày Thìn), có Nguyệt Đức', () => {
    expect(v.taboos.map((t) => t.name)).toEqual(['Tam nương', 'Sát chủ']);
    expect(v.goodStars).toEqual(['Nguyệt Đức']);
  });
  it('xung tuổi Tuất, hướng Hỷ thần Đông Bắc', () => {
    expect(v.clash).toEqual({ chi: 'Tuất', worst: ['Canh Tuất', 'Mậu Tuất'] });
    expect(v.directions).toEqual({ hyThan: 'Đông Bắc', taiThan: 'Đông Nam' });
  });
});

describe('12 trực', () => {
  it('ngày giao tiết lặp lại trực của hôm trước', () => {
    expect(vs(6, 11, 2026).truc.name).toBe('Khai');
    expect(vs(7, 11, 2026).truc.name).toBe('Khai');
    expect(vs(8, 11, 2026).truc.name).toBe('Bế');
  });
  it('ngoài ngày giao tiết, trực nối tiếp nhau theo vòng 12', () => {
    const names = Array.from({ length: 12 }, (_, i) => vs(10 + i, 11, 2026).truc.name);
    expect(new Set(names).size).toBe(12);
  });
});

describe('hoàng đạo', () => {
  it('tháng 10: ngày Ngọ, Mùi, Tuất, Hợi, Sửu, Thìn là hoàng đạo', () => {
    const good = [...Array(12).keys()].filter((chi) => dayGod(10, chi).good);
    expect(good).toEqual([1, 4, 6, 7, 10, 11]);
  });
  it('tháng 1 và tháng 7 giống nhau, Thanh Long ở ngày Tý', () => {
    expect(dayGod(1, 0).name).toBe('Thanh Long');
    expect(dayGod(7, 0).name).toBe('Thanh Long');
  });
});

describe('nhị thập bát tú', () => {
  it('khớp mốc đã đối chiếu: 8/11/2026 là sao Tinh', () => {
    expect(dayTu(jdFromDate(8, 11, 2026)).name).toBe('Tinh');
  });
  it('Chủ nhật luôn là Phòng, Hư, Mão hoặc Tinh', () => {
    const sunday = jdFromDate(8, 11, 2026);
    for (let i = 0; i < 40; i++) {
      expect(['Phòng', 'Hư', 'Mão', 'Tinh']).toContain(dayTu(sunday + 7 * i).name);
    }
  });
});

describe('sao tốt và ngày kỵ', () => {
  it('Thiên Đức, Thiên Xá', () => {
    expect(goodStars(1, { can: 3, chi: 5 })).toContain('Thiên Đức'); // tháng 1 ngày Đinh
    expect(goodStars(2, { can: 4, chi: 8 })).toContain('Thiên Đức'); // tháng 2 ngày Thân
    expect(goodStars(1, { can: 4, chi: 2 })).toContain('Thiên Xá'); // mùa xuân ngày Mậu Dần
    expect(goodStars(4, { can: 4, chi: 2 })).not.toContain('Thiên Xá');
  });
  it('Dương công kỵ và Nguyệt kỵ theo ngày âm', () => {
    const d = lunarToSolar(13, 1, 2026)!;
    expect(vs(d.day, d.month, d.year).taboos.map((t) => t.name)).toContain('Dương công kỵ');
    const k = lunarToSolar(5, 5, 2026)!;
    const names = vs(k.day, k.month, k.year).taboos.map((t) => t.name);
    expect(names).toContain('Nguyệt kỵ');
    expect(names).toContain('Dương công kỵ');
  });
  it('hướng Tài thần theo can ngày', () => {
    expect(directions(4).taiThan).toBe('Bắc');
    expect(directions(9)).toEqual({ hyThan: 'Đông Nam', taiThan: 'Tây Bắc' });
  });
});
