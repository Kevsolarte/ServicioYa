import type { CalendarItem } from '../../types';

type Props = {
  date: Date;
  items: CalendarItem[];
  onClose: () => void;

  // Opcionales para futuro (por ahora no hacen nada si no los pasas)
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
};

export default function DayEventsModal({ date, items, onClose, onAccept, onReject }: Props) {
  const title = date.toLocaleDateString('es-ES', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });

  // Orden por hora ascendente
  const list = [...items].sort((a, b) => a.dateTimeStart.localeCompare(b.dateTimeStart));

  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h3 className="modal__title">Citas — {ucfirst(title)}</h3>
            <div className="muted">{list.length} cita{list.length === 1 ? '' : 's'}</div>
          </div>
          <button className="btn" onClick={onClose}>Cerrar</button>
        </div>

        {list.length === 0 && (
          <div className="muted" style={{ marginTop: '.8rem' }}>
            No hay citas para este día.
          </div>
        )}

        <div className="modal__body">
          <div className="apptgrid">
            {list.map(ev => {
              const start = new Date(ev.dateTimeStart);
              const end = new Date(start.getTime() + ev.durationMin * 60000);

              const hhmm = (d: Date) =>
                d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={ev.id} className="apptcard">
                  <div className="apptcard__head">
                    <div className="apptcard__time">
                      {hhmm(start)} – {hhmm(end)}
                    </div>
                    <span className="tag">Pendiente</span>
                  </div>

                  <div className="apptcard__main">
                    <div className="apptcard__title">{ev.customer}</div>
                    <div className="apptcard__sub muted">{ev.service} • {ev.durationMin} min</div>
                  </div>

                  <div className="apptcard__actions">
                 
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

function ucfirst(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
