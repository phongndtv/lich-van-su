import { describe, expect, it } from 'vitest';
import { jdFromDate } from './lunar';
import { getDayInfo } from './dayInfo';
import { ACTIVITIES, ageRelation, evaluateDay, findGoodDays } from './pickDay';

const act = (id: string) => ACTIVITIES.find((a) => a.id === id)!;

describe('quan hệ tuổi và ngày', () => {
  it('xung, tam hợp, lục hợp', () => {
    // 1994 Giáp Tuất
    expect(ageRelation(4, 1994)).toBe('xung'); // Thìn xung Tuất
    expect(ageRelation(2, 1994)).toBe('hop'); // Dần - Ngọ - Tuất tam hợp
    expect(ageRelation(6, 1994)).toBe('hop');
    expect(ageRelation(3, 1994)).toBe('hop'); // Mão - Tuất lục hợp
    expect(ageRelation(0, 1994)).toBeNull();
    // 1984 Giáp Tý
    expect(ageRelation(1, 1984)).toBe('hop'); // Tý - Sửu lục hợp
    expect(ageRelation(6, 1984)).toBe('xung');
  });
});

describe('chấm một ngày', () => {
  it('26/11/2026 phạm Tam nương nên bị loại dù là hoàng đạo', () => {
    const e = evaluateDay(getDayInfo(26, 11, 2026), act('cuoi'));
    expect(e.ok).toBe(false);
    expect(e.stars).toBe(0);
    expect(e.bad).toContain('Tam nương');
    expect(e.good[0]).toBe('Hoàng đạo (Tư Mệnh)');
  });
});

describe('tìm ngày tốt', () => {
  const start = jdFromDate(1, 1, 2026);

  it.each(ACTIVITIES.map((a) => a.id))('%s: mọi ngày trả về đều sạch điều kỵ', (id) => {
    const list = findGoodDays(start, 365, act(id));
    expect(list.length).toBeGreaterThan(0);
    for (const e of list) {
      expect(e.bad).toEqual([]);
      expect(e.info.vanSu.taboos).toEqual([]);
      expect(e.stars).toBeGreaterThanOrEqual(1);
      expect(e.stars).toBeLessThanOrEqual(3);
      if (e.stars === 3) expect(e.info.vanSu.god.good).toBe(true);
    }
  });

  it('không chọn ngày trực Phá cho cưới hỏi', () => {
    const names = findGoodDays(start, 365, act('cuoi')).map((e) => e.info.vanSu.truc.name);
    expect(names).not.toContain('Phá');
    expect(names).not.toContain('Trừ');
  });

  it('xét tuổi: người tuổi Tuất không nhận ngày Thìn', () => {
    const all = findGoodDays(start, 365, act('khaitruong'));
    const forTuat = findGoodDays(start, 365, act('khaitruong'), 1994);
    expect(forTuat.every((e) => e.info.dayCC.chi !== 4)).toBe(true);
    expect(forTuat.length).toBeLessThan(all.length);
    expect(forTuat.some((e) => e.good.includes('Hợp tuổi'))).toBe(true);
  });

  it('kết quả theo thứ tự thời gian', () => {
    const jds = findGoodDays(start, 120, act('xuathanh')).map((e) => e.info.jd);
    expect(jds).toEqual([...jds].sort((a, b) => a - b));
  });
});
