import { useMemo } from 'react';
import { jdFromDate, type SolarDate } from '../core/lunar';
import { getDayInfoByJd } from '../core/dayInfo';
import { eventsOnDay, type UserEvent } from '../core/events';
import { MAX_YEAR, MIN_YEAR } from '../App';

interface Props {
  month: number;
  year: number;
  selected: SolarDate;
  today: SolarDate;
  events: UserEvent[];
  onSelect: (d: SolarDate) => void;
  onShiftMonth: (delta: number) => void;
  onSetView: (v: { month: number; year: number }) => void;
}

const HEAD = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const same = (a: SolarDate, b: SolarDate) =>
  a.day === b.day && a.month === b.month && a.year === b.year;

export default function MonthGrid(props: Props) {
  const { month, year, selected, today, events } = props;

  const cells = useMemo(() => {
    const first = jdFromDate(1, month, year);
    // jd % 7: 0 = Thứ hai ... 6 = Chủ nhật, nên lùi về Thứ hai đầu tuần.
    const start = first - (first % 7);
    return Array.from({ length: 42 }, (_, i) => getDayInfoByJd(start + i));
  }, [month, year]);

  return (
    <section className="month" aria-label="Lịch tháng">
      <div className="month-nav">
        <button className="nav" onClick={() => props.onShiftMonth(-1)} aria-label="Tháng trước">
          ‹
        </button>
        <div className="month-pick">
          <select
            value={month}
            onChange={(e) => props.onSetView({ month: Number(e.target.value), year })}
            aria-label="Tháng"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            min={MIN_YEAR}
            max={MAX_YEAR}
            aria-label="Năm"
            onChange={(e) => {
              const y = Number(e.target.value);
              if (y >= MIN_YEAR && y <= MAX_YEAR) props.onSetView({ month, year: y });
            }}
          />
        </div>
        <button className="nav" onClick={() => props.onShiftMonth(1)} aria-label="Tháng sau">
          ›
        </button>
      </div>

      <div className="grid" role="grid">
        {HEAD.map((h, i) => (
          <div key={h} className={`grid-head${i >= 5 ? ' weekend' : ''}`}>
            {h}
          </div>
        ))}
        {cells.map((c, i) => {
          const outside = c.solar.month !== month;
          const mine = eventsOnDay(events, c);
          const showMonth = c.lunar.day === 1 || i === 0;
          const cls = [
            'cell',
            outside && 'outside',
            c.weekday === 0 && 'sunday',
            c.weekday === 6 && 'saturday',
            c.holidays.length > 0 && 'has-holiday',
            mine.length > 0 && 'has-event',
            (c.lunar.day === 1 || c.lunar.day === 15) && 'moon',
            same(c.solar, today) && 'today',
            same(c.solar, selected) && 'selected',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={c.jd}
              className={cls}
              onClick={() => props.onSelect(c.solar)}
              title={[...mine.map((e) => e.title), ...c.holidays.map((h) => h.name)].join(', ') || undefined}
              aria-label={`${c.solar.day}/${c.solar.month}/${c.solar.year}, âm lịch ${c.lunar.day}/${c.lunar.month}`}
            >
              <span className={`dot ${c.vanSu.god.good ? 'good' : 'bad'}`} />
              <span className="s">{c.solar.day}</span>
              <span className="l">
                {c.lunar.day}
                {showMonth && `/${c.lunar.month}${c.lunar.leap ? 'N' : ''}`}
              </span>
            </button>
          );
        })}
      </div>
      <div className="legend">
        <span>
          <i className="dot good" /> Hoàng đạo
        </span>
        <span>
          <i className="dot bad" /> Hắc đạo
        </span>
        <span>
          <i className="event-mark" /> Sự kiện của tôi
        </span>
      </div>
    </section>
  );
}
