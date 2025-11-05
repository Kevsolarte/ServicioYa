// src/pages/Merchant/tabs/CalendarTab.tsx
import { useEffect, useState } from 'react';
import type { Business } from '../../../api/business';
import type { CalendarItem } from './types';
import CalendarMonth from './components/Calendario/calendar';
import DayEventsModal from './components/Calendario/modaleventomodal';

import { listBookings, monthRange, type Booking } from '../../../api/bookings';

type Props = { business: Business };

export default function CalendarTab({ business }: Props) {
    const [month, setMonth] = useState<Date>(new Date());
    const [items, setItems] = useState<CalendarItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // modal state
    const [openDay, setOpenDay] = useState<Date | null>(null);
    const [openItems, setOpenItems] = useState<CalendarItem[]>([]);

    const goPrev = () => setMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const goNext = () => setMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    const goToday = () => setMonth(new Date());

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const { from, to } = monthRange(month);
                const rows: Booking[] = await listBookings(business.id, from, to);

                const mapped: CalendarItem[] = rows.map((bk) => ({
                    id: bk.id,
                    service: bk.service?.name ?? 'Servicio',
                    customer: bk.customerName,
                    dateTimeStart: bk.dateTimeStart,
                    durationMin: bk.service?.durationMinutes
                        ?? diffMinutes(bk.dateTimeStart, bk.dateTimeEnd)
                        ?? 30,
                }));

                if (!mounted) return;
                setItems(mapped);
            } catch (e: any) {
                if (!mounted) return;
                setErr(e?.response?.data?.message || e?.message || 'No se pudieron cargar las citas');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false };
    }, [business.id, month]);

    const handleDayClick = (date: Date, dayItems: CalendarItem[]) => {
        setOpenDay(date);
        setOpenItems(dayItems);
    };

    return (
        <div>
            <h3>Calendario — {business.displayName}</h3>
            <p className="muted">Citas por día (datos reales del backend).</p>

            {err && <div className="err" style={{ marginBottom: '.5rem' }}>{err}</div>}
            {loading && <div className="muted" style={{ marginBottom: '.5rem' }}>Cargando…</div>}

            <CalendarMonth
                items={items}
                month={month}
                onPrev={goPrev}
                onNext={goNext}
                onToday={goToday}
                onDayClick={handleDayClick}  // 👈 aquí
            />

            {openDay && (
                <DayEventsModal
                    date={openDay}
                    items={openItems}
                    onClose={() => setOpenDay(null)}
                />
            )}
        </div>
    );
}

function diffMinutes(a?: string, b?: string) {
    if (!a || !b) return undefined;
    const ms = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(0, Math.round(ms / 60000));
}
