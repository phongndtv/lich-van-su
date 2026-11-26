import { useMemo, useState } from 'react';
import { jdFromDate, lunarToSolar, type SolarDate } from './core/lunar';
import { getDayInfo, getDayInfoByJd } from './core/dayInfo';
import DayCard from './ui/DayCard';
import MonthGrid from './ui/MonthGrid';
import JumpPanel from './ui/JumpPanel';
import FindDays from './ui/FindDays';
import EventsPanel from './ui/EventsPanel';
import { eventsOnDay } from './core/events';
import { useStore } from './store';

function todayDate(): SolarDate {
  const now = new Date();
  return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
}

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export default function App() {
  const today = useMemo(todayDate, []);
  const [selected, setSelected] = useState<SolarDate>(today);
  const [view, setView] = useState({ month: today.month, year: today.year });

  const store = useStore();

  const info = useMemo(
    () => getDayInfo(selected.day, selected.month, selected.year),
    [selected],
  );

  const dayEvents = useMemo(() => eventsOnDay(store.events, info), [store.events, info]);

  const goTo = (d: SolarDate) => {
    if (d.year < MIN_YEAR || d.year > MAX_YEAR) return;
    setSelected(d);
    setView({ month: d.month, year: d.year });
  };

  const shiftDay = (delta: number) => {
    goTo(getDayInfoByJd(jdFromDate(selected.day, selected.month, selected.year) + delta).solar);
  };

  const shiftMonth = (delta: number) => {
    const index = view.year * 12 + (view.month - 1) + delta;
    const year = Math.floor(index / 12);
    if (year < MIN_YEAR || year > MAX_YEAR) return;
    setView({ month: (index % 12) + 1, year });
  };

  const jumpLunar = (day: number, month: number, year: number, leap: boolean): boolean => {
    const solar = lunarToSolar(day, month, year, leap);
    if (!solar) return false;
    goTo(solar);
    return true;
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>Lịch Vạn Sự</h1>
        <button className="btn" onClick={() => goTo(today)}>
          Hôm nay
        </button>
      </header>

      <main className="layout">
        <DayCard info={info} events={dayEvents} onPrev={() => shiftDay(-1)} onNext={() => shiftDay(1)} />
        <div className="side">
          <MonthGrid
            month={view.month}
            year={view.year}
            selected={selected}
            today={today}
            events={store.events}
            onSelect={goTo}
            onShiftMonth={shiftMonth}
            onSetView={setView}
          />
          <JumpPanel selected={selected} lunar={info.lunar} onSolar={goTo} onLunar={jumpLunar} />
          <EventsPanel
            events={store.events}
            settings={store.settings}
            today={today}
            selected={info}
            onAdd={store.addEvent}
            onRemove={store.removeEvent}
            onMerge={store.mergeEvents}
            onSettings={store.setSettings}
            onSelect={goTo}
          />
          <FindDays from={today} onSelect={goTo} />
        </div>
      </main>

      <footer className="footer">
        Âm lịch tính theo múi giờ Việt Nam (UTC+7), phạm vi {MIN_YEAR}-{MAX_YEAR}.
      </footer>
    </div>
  );
}
