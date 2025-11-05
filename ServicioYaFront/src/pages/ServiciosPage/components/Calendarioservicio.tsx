import { useMemo, useState } from 'react';

export type CalendarInlineProps = {
  value: Date | null;
  onChange: (d: Date) => void;
};

export default function CalendarInline({ value, onChange }: CalendarInlineProps) {
  const [month, setMonth] = useState<Date>(() => {
    const d = value ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const startOfGrid = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    // semana inicia lunes
    const dow = (first.getDay() + 6) % 7; // 0..6 (lun..dom)
    const start = new Date(first);
    start.setDate(first.getDate() - dow);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [month]);

  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startOfGrid);
      d.setDate(startOfGrid.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [startOfGrid]);

  const title = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const today = new Date();

  const sameYMD = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div className="svc-cal">
      <div className="svc-cal__header">
        <div className="svc-cal__title">{title.charAt(0).toUpperCase() + title.slice(1)}</div>
        <div className="svc-cal__actions">
          <button className="btn" onClick={() => setMonth(new Date())}>Hoy</button>
          <button className="btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>◀</button>
          <button className="btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>▶</button>
        </div>
      </div>

      <div className="svc-cal__weekhead">
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
          <div key={d} className="svc-cal__dow">{d}</div>
        ))}
      </div>

      <div className="svc-cal__grid">
        {days.map((d, i) => {
          const out = d.getMonth() !== month.getMonth();
          const isToday = sameYMD(d, today);
          const isSelected = value ? sameYMD(d, value) : false;
          return (
            <button
              key={i}
              type="button"
              className={[
                'svc-cal__cell',
                out ? 'svc-cal__cell--muted' : '',
                isToday ? 'svc-cal__cell--today' : '',
                isSelected ? 'svc-cal__cell--sel' : '',
              ].join(' ').trim()}
              onClick={() => onChange(d)}
              aria-label={`Seleccionar ${d.toLocaleDateString('es-ES')}`}
            >
              <div className="svc-cal__date">{d.getDate()}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
