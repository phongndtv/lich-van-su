import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  KIND_LABEL,
  parseEvents,
  toICS,
  upcoming,
  validateEvent,
  type EventKind,
  type UserEvent,
} from '../core/events';
import type { DayInfo } from '../core/dayInfo';
import { jdFromDate, type SolarDate } from '../core/lunar';
import type { Settings } from '../store';

interface Props {
  events: UserEvent[];
  settings: Settings;
  today: SolarDate;
  /** ngày đang chọn, dùng để điền sẵn vào form */
  selected: DayInfo;
  onAdd: (ev: Omit<UserEvent, 'id'>) => void;
  onRemove: (id: string) => void;
  onMerge: (events: UserEvent[]) => number;
  onSettings: (s: Settings) => void;
  onSelect: (d: SolarDate) => void;
}

const UPCOMING_DAYS = 60;

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const whenLabel = (delta: number) =>
  delta === 0 ? 'Hôm nay' : delta === 1 ? 'Ngày mai' : `Còn ${delta} ngày`;

const dateLabel = (ev: UserEvent) =>
  ev.kind === 'lunar-yearly'
    ? `${ev.day}/${ev.month} âm, hằng năm`
    : ev.kind === 'solar-yearly'
      ? `${ev.day}/${ev.month} dương, hằng năm`
      : `${ev.day}/${ev.month}/${ev.year}`;

export default function EventsPanel(props: Props) {
  const { events, settings, today, selected } = props;
  const todayJd = jdFromDate(today.day, today.month, today.year);

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<EventKind>('lunar-yearly');
  const [day, setDay] = useState(selected.lunar.day);
  const [month, setMonth] = useState(selected.lunar.month);
  const [year, setYear] = useState(selected.solar.year);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Ngày trong form đi theo ngày đang chọn và loại lịch.
  useEffect(() => {
    const src = kind === 'lunar-yearly' ? selected.lunar : selected.solar;
    setDay(src.day);
    setMonth(src.month);
    setYear(selected.solar.year);
  }, [kind, selected.jd]); // eslint-disable-line react-hooks/exhaustive-deps

  const soon = useMemo(
    () => upcoming(events, todayJd, UPCOMING_DAYS, settings.remindMoon),
    [events, todayJd, settings.remindMoon],
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const ev: Omit<UserEvent, 'id'> = { title: title.trim(), kind, day, month };
    if (kind === 'solar-once') ev.year = year;
    if (note.trim()) ev.note = note.trim();
    const error = validateEvent(ev);
    if (error) {
      setMessage(error);
      return;
    }
    props.onAdd(ev);
    setTitle('');
    setNote('');
    setMessage(`Đã thêm "${ev.title}".`);
  };

  const restore = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      const list = parseEvents((data as { events?: unknown } | null)?.events ?? data);
      if (list.length === 0) {
        setMessage('Tệp không có sự kiện hợp lệ.');
        return;
      }
      const added = props.onMerge(list);
      setMessage(`Đã thêm ${added} sự kiện, bỏ qua ${list.length - added} mục đã có.`);
    } catch {
      setMessage('Không đọc được tệp sao lưu.');
    }
  };

  return (
    <section className="events" aria-label="Sự kiện của tôi">
      <h2>Sắp tới ({UPCOMING_DAYS} ngày)</h2>
      {soon.length === 0 ? (
        <p className="find-empty">Chưa có gì trong {UPCOMING_DAYS} ngày tới.</p>
      ) : (
        <ul className="find-list soon-list">
          {soon.map((o, i) => (
            <li key={`${o.jd}-${o.event?.id ?? 'moon'}-${i}`}>
              <button onClick={() => props.onSelect(o.info.solar)}>
                <span className="find-date">
                  <b>
                    {o.info.solar.day}/{o.info.solar.month}
                  </b>
                  <small>
                    {o.info.lunar.day}/{o.info.lunar.month} âm
                  </small>
                </span>
                <span className="find-body">
                  <span className={o.kind === 'moon' ? 'moon-title' : ''}>{o.title}</span>
                  {o.event?.note && <small>{o.event.note}</small>}
                </span>
                <span className={`when${o.jd - todayJd <= 1 ? ' near' : ''}`}>
                  {whenLabel(o.jd - todayJd)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className="check">
        <input
          type="checkbox"
          checked={settings.remindMoon}
          onChange={(e) => props.onSettings({ ...settings, remindMoon: e.target.checked })}
        />
        Nhắc mùng 1 và rằm
      </label>

      <h2>Thêm sự kiện</h2>
      <form className="event-form" onSubmit={submit}>
        <input
          className="wide"
          type="text"
          placeholder="Tên sự kiện, ví dụ: Giỗ ông nội"
          aria-label="Tên sự kiện"
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="wide"
          value={kind}
          aria-label="Loại lịch"
          onChange={(e) => setKind(e.target.value as EventKind)}
        >
          {(Object.keys(KIND_LABEL) as EventKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </select>
        <label>
          <span>Ngày</span>
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          />
        </label>
        <label>
          <span>Tháng</span>
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </label>
        {kind === 'solar-once' && (
          <label>
            <span>Năm</span>
            <input
              type="number"
              min={1900}
              max={2100}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </label>
        )}
        <input
          className="wide"
          type="text"
          placeholder="Ghi chú (không bắt buộc)"
          aria-label="Ghi chú"
          maxLength={200}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="btn" type="submit">
          Thêm
        </button>
      </form>
      {message && <p className="find-note">{message}</p>}

      <h2>Tất cả sự kiện ({events.length})</h2>
      {events.length === 0 ? (
        <p className="find-empty">Chưa có sự kiện nào.</p>
      ) : (
        <ul className="all-events">
          {events.map((ev) => (
            <li key={ev.id}>
              <span className="find-body">
                <span>{ev.title}</span>
                <small>
                  {dateLabel(ev)}
                  {ev.note ? ` · ${ev.note}` : ''}
                </small>
              </span>
              {confirmId === ev.id ? (
                <>
                  <button
                    className="link danger"
                    onClick={() => {
                      props.onRemove(ev.id);
                      setConfirmId(null);
                    }}
                  >
                    Xóa hẳn
                  </button>
                  <button className="link" onClick={() => setConfirmId(null)}>
                    Thôi
                  </button>
                </>
              ) : (
                <button className="link" onClick={() => setConfirmId(ev.id)}>
                  Xóa
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="event-actions">
        <button
          className="btn"
          disabled={events.length === 0}
          onClick={() =>
            download('lich-van-su.ics', toICS(events, today.year - 1, 11), 'text/calendar')
          }
        >
          Xuất sang lịch máy (.ics)
        </button>
        <button
          className="btn"
          disabled={events.length === 0}
          onClick={() =>
            download(
              'lich-van-su-sao-luu.json',
              JSON.stringify({ app: 'lich-van-su', version: 1, events }, null, 2),
              'application/json',
            )
          }
        >
          Sao lưu
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          Khôi phục
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={restore} />
      </div>
      <p className="find-note">
        Dữ liệu chỉ lưu trên thiết bị này. Dùng Sao lưu và Khôi phục để chuyển sang máy khác.
      </p>
    </section>
  );
}
