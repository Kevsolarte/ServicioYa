import { useEffect, useMemo, useState } from 'react';
import { getAvailability, createBooking } from '../../../api/bookings';
import './Bookingmodal.css'

type Props = {
  open: boolean;
  onClose: () => void;
  businessId: string;
  serviceId: string;
  serviceName: string;
  serviceDurationMin: number;
  day: Date;                 // fecha elegida en el calendario
  defaultOpenHour?: number;  // 8
  defaultCloseHour?: number; // 20
};

export default function BookingModal({
  open, onClose, businessId, serviceId, serviceName, serviceDurationMin, day,
  defaultOpenHour = 8, defaultCloseHour = 20,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [slotsISO, setSlotsISO] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedISO, setSelectedISO] = useState<string | null>(null);

  // Form de cliente
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Rejilla local (por si la API falla)
  const localPrefixedISO = useMemo(() => {
    const start = new Date(day); start.setHours(defaultOpenHour, 0, 0, 0);
    const end   = new Date(day); end.setHours(defaultCloseHour, 0, 0, 0);
    const arr: string[] = [];
    const cur = new Date(start);
    while (cur < end) {
      arr.push(new Date(cur).toISOString());
      cur.setMinutes(cur.getMinutes() + 30);
    }
    return arr;
  }, [day, defaultOpenHour, defaultCloseHour]);

  // Carga disponibilidad real
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError(null); setSelectedISO(null);
        const dayStr = day.toISOString().slice(0, 10);
        const avail = await getAvailability({
          businessId, serviceId, day: dayStr,
          openHour: defaultOpenHour, closeHour: defaultCloseHour,
        });
        if (!mounted) return;
        setSlotsISO(avail); // se asume que ya son "libres"
      } catch (e: any) {
        if (!mounted) return;
        setSlotsISO([]); // fallback: usaremos la rejilla local
        setError(e?.response?.data?.message || e?.message || 'Sin disponibilidad del servidor, usando horarios base.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [open, businessId, serviceId, day, defaultOpenHour, defaultCloseHour]);

  const slotsToShow = slotsISO.length > 0 ? slotsISO : localPrefixedISO;

  async function onReserve() {
    if (!selectedISO) return;
    if (!name.trim() || !email.trim()) {
      setMsg('Completa nombre y correo.');
      return;
    }
    try {
      setSaving(true); setMsg(null);
      await createBooking({
        businessId,
        serviceId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        dateTimeStart: selectedISO,
      });
      setMsg('¡Reserva creada con éxito!');
    } catch (e: any) {
      setMsg(e?.response?.data?.message || e?.message || 'No se pudo crear la reserva');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const dayLabel = day.toLocaleDateString('es-ES', {
    weekday:'long', day:'2-digit', month:'long', year:'numeric'
  });

  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal modal--xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 style={{margin:0}}>Reservar: {serviceName}</h3>
          <button className="btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal__sub">{dayLabel}</div>

        {loading ? (
          <div className="muted">Cargando horarios…</div>
        ) : (
          <>
            {error && <div className="muted" style={{marginBottom:'.5rem'}}>{error}</div>}

            <div className="slots__grid" style={{marginTop:'.5rem'}}>
              {slotsToShow.length === 0 ? (
                <div className="muted">No hay horarios configurados para este día.</div>
              ) : (
                slotsToShow.map((iso) => {
                  const d = new Date(iso);
                  const label = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const active = selectedISO === iso;
                  return (
                    <button
                      key={iso}
                      className={`slotbtn ${active ? 'slotbtn--active' : ''}`}
                      onClick={() => setSelectedISO(iso)}
                    >
                      {label}
                    </button>
                  );
                })
              )}
            </div>

            <div className="line" />

            <form className="grid2" onSubmit={(e)=>{e.preventDefault(); onReserve();}}>
              <label>
                <span>Tu nombre *</span>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre" />
              </label>
              <label>
                <span>Tu correo *</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" />
              </label>
              <label style={{gridColumn:'1 / -1'}}>
                <span>Teléfono (opcional)</span>
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+58 ..." />
              </label>
            </form>

            {msg && <div style={{marginTop:'.4rem'}} className={msg.startsWith('¡') ? 'ok' : 'err'}>{msg}</div>}

            <div className="actions" style={{marginTop:'.8rem'}}>
              <button className="btn" onClick={onClose}>Cancelar</button>
              <button className="btn btn--dark" onClick={onReserve} disabled={!selectedISO || saving}>
                {saving ? 'Reservando…' : 'Confirmar reserva'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
