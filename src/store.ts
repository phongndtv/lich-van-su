// Lưu sự kiện và cài đặt ngay trên thiết bị (localStorage).

import { useCallback, useEffect, useState } from 'react';
import { parseEvents, type UserEvent } from './core/events';

const EVENTS_KEY = 'lvs.events.v1';
const SETTINGS_KEY = 'lvs.settings.v1';

export interface Settings {
  remindMoon: boolean;
}

function load<T>(key: string, parse: (data: unknown) => T, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : parse(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Hết dung lượng hoặc trình duyệt chặn lưu trữ: dữ liệu vẫn dùng được trong phiên này.
  }
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function useStore() {
  const [events, setEvents] = useState<UserEvent[]>(() => load(EVENTS_KEY, parseEvents, []));
  const [settings, setSettings] = useState<Settings>(() =>
    load(
      SETTINGS_KEY,
      (d) => ({ remindMoon: (d as Partial<Settings> | null)?.remindMoon !== false }),
      { remindMoon: true },
    ),
  );

  useEffect(() => save(EVENTS_KEY, events), [events]);
  useEffect(() => save(SETTINGS_KEY, settings), [settings]);

  const addEvent = useCallback((ev: Omit<UserEvent, 'id'>) => {
    setEvents((list) => [...list, { ...ev, id: newId() }]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((list) => list.filter((e) => e.id !== id));
  }, []);

  /** Gộp sự kiện từ tệp sao lưu; mục trùng id thì giữ bản đang có. Trả về số mục đã thêm. */
  const mergeEvents = useCallback(
    (incoming: UserEvent[]): number => {
      const known = new Set(events.map((e) => e.id));
      const fresh = incoming.filter((e) => !known.has(e.id));
      if (fresh.length > 0) setEvents((list) => [...list, ...fresh]);
      return fresh.length;
    },
    [events],
  );

  return { events, settings, setSettings, addEvent, removeEvent, mergeEvents };
}
