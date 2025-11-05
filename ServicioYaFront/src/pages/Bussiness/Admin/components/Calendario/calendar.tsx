// src/pages/Merchant/tabs/calendar/CalendarMonth.tsx
import { useMemo } from 'react';
import type { CalendarItem } from '../../types';

type Props = {
  items: CalendarItem[];
  month: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onDayClick?: (date: Date, dayItems: CalendarItem[]) => void; // 👈 NUEVO
};

export default function CalendarMonth({ items, month, onPrev, onNext, onToday, onDayClick }: Props) {
  const cur = new Date(month.getFullYear(), month.getMonth(), 1);

  const startOfGrid = startOfWeek(cur);
  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startOfGrid);
      d.setDate(startOfGrid.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [startOfGrid.getTime()]);

  const byDay = useMemo(() => {
    const m = new Map<string, CalendarItem[]>();
    for (const it of items) {
      const key = toYMD(new Date(it.dateTimeStart));
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(it);
    }
    for (const [k, arr] of m) arr.sort((a, b) => a.dateTimeStart.localeCompare(b.dateTimeStart));
    return m;
  }, [items]);

  const title = cur.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="cal">
      <div className="cal__header">
        <div className="cal__title">{cap(title)}</div>
        <div className="cal__actions">
          <button className="btn" onClick={onToday}>Hoy</button>
          <button className="btn" onClick={onPrev}>◀</button>
          <button className="btn" onClick={onNext}>▶</button>
        </div>
      </div>

      <div className="cal__week cal__week--head">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="cal__dow">{d}</div>
        ))}
      </div>

      <div className="cal__grid">
        {days.map((d, i) => {
          const ymd = toYMD(d);
          const notCurrent = d.getMonth() !== cur.getMonth();
          const isToday = sameYMD(d, new Date());
          const events = byDay.get(ymd) ?? [];

          return (
            <button
              key={i}
              type="button"
              className={`cal__cell ${notCurrent ? 'cal__cell--muted' : ''} ${isToday ? 'cal__cell--today' : ''}`}
              onClick={() => onDayClick?.(d, events)}
              aria-label={`Día ${d.getDate()} (${events.length} citas)`}
            >
              <div className="cal__date">{d.getDate()}</div>
              <div className="cal__events">
                {events.map(ev => (
                  <div key={ev.id} className="cal__event">
                    <span className="cal__time">
                      {new Date(ev.dateTimeStart).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="cal__summary">
                      {ev.customer} — {ev.service}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* utils (igual que antes) */
function toYMD(d: Date) { const y = d.getFullYear(); const m = `${d.getMonth() + 1}`.padStart(2, '0'); const day = `${d.getDate()}`.padStart(2, '0'); return `${y}-${m}-${day}`; }
function sameYMD(a: Date, b: Date) { return toYMD(a) === toYMD(b); }
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function startOfWeek(d: Date) { const tmp = new Date(d.getFullYear(), d.getMonth(), 1); const day = (tmp.getDay() + 6) % 7; tmp.setDate(tmp.getDate() - day); tmp.setHours(0, 0, 0, 0); return tmp; }
