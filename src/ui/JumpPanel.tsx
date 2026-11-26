import { useEffect, useState, type FormEvent } from 'react';
import type { LunarDate, SolarDate } from '../core/lunar';
import { MAX_YEAR, MIN_YEAR } from '../App';

interface Props {
  selected: SolarDate;
  lunar: LunarDate;
  onSolar: (d: SolarDate) => void;
  onLunar: (day: number, month: number, year: number, leap: boolean) => boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function JumpPanel({ selected, lunar, onSolar, onLunar }: Props) {
  const [day, setDay] = useState(lunar.day);
  const [month, setMonth] = useState(lunar.month);
  const [year, setYear] = useState(lunar.year);
  const [leap, setLeap] = useState(lunar.leap);
  const [error, setError] = useState('');

  // Ô nhập ngày âm luôn đi theo ngày đang chọn.
  useEffect(() => {
    setDay(lunar.day);
    setMonth(lunar.month);
    setYear(lunar.year);
    setLeap(lunar.leap);
    setError('');
  }, [lunar.jd]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (year < MIN_YEAR || year > MAX_YEAR) {
      setError(`Năm phải trong khoảng ${MIN_YEAR}-${MAX_YEAR}.`);
      return;
    }
    const ok = onLunar(day, month, year, leap);
    setError(
      ok ? '' : `Không có ngày ${day} tháng ${month}${leap ? ' nhuận' : ''} năm ${year} âm lịch.`,
    );
  };

  return (
    <section className="jump" aria-label="Đổi ngày">
      <h2>Đổi ngày</h2>
      <label className="row">
        <span>Dương lịch</span>
        <input
          type="date"
          min={`${MIN_YEAR}-01-01`}
          max={`${MAX_YEAR}-12-31`}
          value={`${selected.year}-${pad(selected.month)}-${pad(selected.day)}`}
          onChange={(e) => {
            const [y, m, d] = e.target.value.split('-').map(Number);
            if (y && m && d) onSolar({ day: d, month: m, year: y });
          }}
        />
      </label>

      <form className="row" onSubmit={submit}>
        <span>Âm lịch</span>
        <div className="lunar-inputs">
          <input
            type="number"
            min={1}
            max={30}
            value={day}
            aria-label="Ngày âm"
            onChange={(e) => setDay(Number(e.target.value))}
          />
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            aria-label="Tháng âm"
            onChange={(e) => setMonth(Number(e.target.value))}
          />
          <input
            type="number"
            className="year"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={year}
            aria-label="Năm âm"
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <label className="leap">
            <input type="checkbox" checked={leap} onChange={(e) => setLeap(e.target.checked)} />
            nhuận
          </label>
          <button className="btn" type="submit">
            Xem
          </button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
