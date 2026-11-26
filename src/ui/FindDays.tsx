import { useMemo, useState } from 'react';
import { CHI, canChiName, yearCanChi } from '../core/canchi';
import { THU } from '../core/dayInfo';
import { jdFromDate, type SolarDate } from '../core/lunar';
import { ACTIVITIES, findGoodDays } from '../core/pickDay';

interface Props {
  from: SolarDate;
  onSelect: (d: SolarDate) => void;
}

const RANGES = [30, 60, 90, 180];
const SHORT_THU = THU.map((t) => (t === 'Chủ nhật' ? 'CN' : t.replace('Thứ ', 'T. ')));

export default function FindDays({ from, onSelect }: Props) {
  const [activityId, setActivityId] = useState(ACTIVITIES[0].id);
  const [range, setRange] = useState(60);
  const [birth, setBirth] = useState('');
  const [minStars, setMinStars] = useState(1);

  const birthYear = /^\d{4}$/.test(birth) && +birth >= 1900 && +birth <= 2100 ? +birth : undefined;

  const results = useMemo(() => {
    const activity = ACTIVITIES.find((a) => a.id === activityId)!;
    const start = jdFromDate(from.day, from.month, from.year);
    return findGoodDays(start, range, activity, birthYear);
  }, [activityId, range, birthYear, from]);

  const shown = results.filter((e) => e.stars >= minStars);

  return (
    <section className="find" aria-label="Tìm ngày tốt">
      <h2>Tìm ngày tốt</h2>
      <div className="find-form">
        <label>
          <span>Việc cần làm</span>
          <select value={activityId} onChange={(e) => setActivityId(e.target.value)}>
            {ACTIVITIES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Trong vòng</span>
          <select value={range} onChange={(e) => setRange(Number(e.target.value))}>
            {RANGES.map((r) => (
              <option key={r} value={r}>
                {r} ngày tới
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Năm sinh (âm lịch)</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="không bắt buộc"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
          />
        </label>
        <label>
          <span>Mức tối thiểu</span>
          <select value={minStars} onChange={(e) => setMinStars(Number(e.target.value))}>
            <option value={1}>★ trở lên</option>
            <option value={2}>★★ trở lên</option>
            <option value={3}>chỉ ★★★</option>
          </select>
        </label>
      </div>

      <p className="find-note">
        Tính từ {from.day}/{from.month}/{from.year}.
        {birthYear !== undefined &&
          ` Tuổi ${canChiName(yearCanChi(birthYear))}, tránh ngày ${CHI[(yearCanChi(birthYear).chi + 6) % 12]}.`}{' '}
        Tìm thấy {shown.length} ngày.
      </p>

      {shown.length === 0 ? (
        <p className="find-empty">Không có ngày phù hợp trong khoảng này. Thử nới khoảng thời gian.</p>
      ) : (
        <ul className="find-list">
          {shown.map((e) => {
            const { solar, lunar } = e.info;
            return (
              <li key={e.info.jd}>
                <button onClick={() => onSelect(solar)}>
                  <span className="find-date">
                    <b>
                      {solar.day}/{solar.month}
                    </b>
                    <small>{SHORT_THU[e.info.weekday]}</small>
                  </span>
                  <span className="find-body">
                    <span>
                      {lunar.day}/{lunar.month}
                      {lunar.leap ? ' nhuận' : ''} âm · {canChiName(e.info.dayCC)}
                    </span>
                    <small>{e.good.join(' · ')}</small>
                  </span>
                  <span className="find-stars" aria-label={`${e.stars} sao`}>
                    {'★'.repeat(e.stars)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
