import { CHI, CON_GIAP, canChiName, hourRange } from '../core/canchi';
import { THU, type DayInfo } from '../core/dayInfo';
import type { UserEvent } from '../core/events';

interface Props {
  info: DayInfo;
  events: UserEvent[];
  onPrev: () => void;
  onNext: () => void;
}

export default function DayCard({ info, events, onPrev, onNext }: Props) {
  const { solar, lunar } = info;
  const isRed = info.weekday === 0 || info.holidays.length > 0;

  return (
    <section className="daycard" aria-label="Chi tiết ngày">
      <div className="daycard-head">
        <button className="nav" onClick={onPrev} aria-label="Ngày trước">
          ‹
        </button>
        <div>
          Tháng {solar.month} năm {solar.year}
        </div>
        <button className="nav" onClick={onNext} aria-label="Ngày sau">
          ›
        </button>
      </div>

      <div className={`daycard-solar${isRed ? ' red' : ''}`}>
        <div className="big-day">{solar.day}</div>
        <div className="weekday">{THU[info.weekday]}</div>
        {info.holidays.map((h) => (
          <div key={h.name} className="holiday">
            {h.name}
          </div>
        ))}
      </div>

      {events.length > 0 && (
        <ul className="day-events">
          {events.map((ev) => (
            <li key={ev.id}>
              <b>{ev.title}</b>
              {ev.note && <small>{ev.note}</small>}
            </li>
          ))}
        </ul>
      )}

      <div className="daycard-lunar">
        <div className="lunar-main">
          <span className="lunar-day">{lunar.day}</span>
          <span>
            Tháng {lunar.month}
            {lunar.leap ? ' nhuận' : ''} ({info.lunarMonthLength === 30 ? 'đủ' : 'thiếu'})
            <br />
            Năm {canChiName(info.yearCC)} · {CON_GIAP[info.yearCC.chi]}
          </span>
        </div>

        <dl className="facts">
          <div>
            <dt>Ngày</dt>
            <dd>
              {canChiName(info.dayCC)} <small>{info.dayNapAm}</small>
            </dd>
          </div>
          <div>
            <dt>Tháng</dt>
            <dd>{canChiName(info.monthCC)}</dd>
          </div>
          <div>
            <dt>Năm</dt>
            <dd>
              {canChiName(info.yearCC)} <small>{info.yearNapAm}</small>
            </dd>
          </div>
          <div>
            <dt>Tiết khí</dt>
            <dd>
              {info.term.name}
              {info.term.startsToday && <small>bắt đầu hôm nay</small>}
            </dd>
          </div>
        </dl>

        <h2>Giờ hoàng đạo</h2>
        <ul className="hours">
          {info.goodHours.map((h) => (
            <li key={h.chi}>
              <b>{CHI[h.chi]}</b>
              <span>{hourRange(h.chi)}h</span>
            </li>
          ))}
        </ul>

        <VanSuBlock info={info} />
      </div>
    </section>
  );
}

function VanSuBlock({ info }: { info: DayInfo }) {
  const v = info.vanSu;
  return (
    <>
      <h2>Vạn sự</h2>
      <div className={`verdict ${v.god.good ? 'good' : 'bad'}`}>
        <b>Ngày {v.god.good ? 'hoàng đạo' : 'hắc đạo'}</b>
        <span>{v.god.name}</span>
      </div>

      <dl className="facts">
        <div>
          <dt>Trực</dt>
          <dd>{v.truc.name}</dd>
        </div>
        <div>
          <dt>Sao</dt>
          <dd>
            {v.tu.fullName} <small>{v.tu.good ? 'sao tốt' : 'sao xấu'}</small>
          </dd>
        </div>
        {v.goodStars.length > 0 && (
          <div>
            <dt>Cát tinh</dt>
            <dd className="good-text">{v.goodStars.join(', ')}</dd>
          </div>
        )}
        {v.taboos.length > 0 && (
          <div>
            <dt>Ngày kỵ</dt>
            <dd>
              {v.taboos.map((t) => (
                <div key={t.name} className="taboo">
                  <span className="bad-text">{t.name}</span>
                  <small>{t.note}</small>
                </div>
              ))}
            </dd>
          </div>
        )}
        <div>
          <dt>Nên làm</dt>
          <dd className="plain">{v.truc.nen.join(', ')}</dd>
        </div>
        <div>
          <dt>Nên kiêng</dt>
          <dd className="plain">{v.truc.kieng.join(', ')}</dd>
        </div>
        <div>
          <dt>Tuổi xung</dt>
          <dd>
            {v.clash.chi} <small>nhất là {v.clash.worst.join(', ')}</small>
          </dd>
        </div>
        <div>
          <dt>Xuất hành</dt>
          <dd className="plain">
            Hỷ thần: <b>{v.directions.hyThan}</b> · Tài thần: <b>{v.directions.taiThan}</b>
          </dd>
        </div>
      </dl>
    </>
  );
}
