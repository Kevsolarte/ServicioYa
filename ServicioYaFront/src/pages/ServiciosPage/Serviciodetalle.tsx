import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getServiceById, type Service } from '../../api/services';
import { getBusinessById, type PublicBusiness } from '../../api/business';
import CalendarInline from './components/Calendarioservicio';
import BookingModal from './components/BookingModal';
import './components/calendarioservicio.css';

export default function ServiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state } = useLocation();
    const stateBizId = (state as any)?.businessId as string | undefined;

    const [svc, setSvc] = useState<Service | null>(null);
    const [biz, setBiz] = useState<PublicBusiness | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [showBooking, setShowBooking] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!id) throw new Error('Falta id de servicio');
                setLoading(true); setErr(null);
                const s = await getServiceById(id);
                if (!mounted) return;
                setSvc(s);

                const bizId = s.businessId ?? stateBizId;
                if (bizId) {
                    try {
                        const b = await getBusinessById(bizId);
                        if (mounted) setBiz(b);
                    } catch { }
                }
            } catch (e: any) {
                if (!mounted) return;
                setErr(e?.response?.data?.message || e?.message || 'No se pudo cargar el servicio');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id, stateBizId]);

    const priceFmt = (n: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n);

    return (
        <div className="section">
            <div className="container">
                <button className="btn" onClick={() => navigate(-1)}>← Volver</button>

                {loading && <div className="muted" style={{ marginTop: '.75rem' }}>Cargando…</div>}
                {err && <div className="err" style={{ marginTop: '.75rem' }}>{err}</div>}

                {!loading && !err && svc && (
                    <div className="svc-detail svc-detail--two">
                        <div className="svc-detail__media">
                            <img
                                src={pickImage(svc.id + svc.name)}
                                alt={svc.name}
                                className="svc-detail__image"
                            />
                        </div>

                        <div className="svc-detail__side">
                            <div>
                                <h1 style={{ marginTop: 0 }}>{svc.name}</h1>
                                <div className="svc-detail__biz muted">
                                    {biz ? `del negocio ${biz.displayName}` : '—'}
                                </div>

                                <div className="svc-detail__meta">
                                    <div>
                                        <div className="lbl">Precio</div>
                                        <div className="strong">{priceFmt(svc.price)}</div>
                                    </div>
                                    <div>
                                        <div className="lbl">Duración</div>
                                        <div className="strong">{svc.durationMinutes} min</div>
                                    </div>
                                </div>

                                <p className="muted" style={{ marginTop: '.5rem' }}>
                                    {svc.description || 'Sin descripción'}
                                </p>
                            </div>

                            {/* Calendario: al elegir fecha abrimos el modal */}
                            <div className="svc-detail__calendar">
                                <CalendarInline
                                    value={selectedDate}
                                    onChange={(d) => { setSelectedDate(d); setShowBooking(true); }}
                                />

                                {/* aviso si falta businessId */}
                                {!svc.businessId && !stateBizId && (
                                    <div className="err" style={{ marginTop: '.5rem' }}>
                                        No se pudo determinar el negocio. Enlaza desde el Home pasando
                                        {' '}
                                        <code>state=&#123;&#123; businessId &#125;&#125;</code>
                                        {' '}o haz que <code>/api/services/:id</code> incluya <code>businessId</code>.
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de reserva */}
                {showBooking && svc && (svc.businessId || stateBizId) && selectedDate && (
                    <BookingModal
                        open={showBooking}
                        onClose={() => setShowBooking(false)}
                        businessId={svc.businessId ?? stateBizId!}
                        serviceId={svc.id}
                        serviceName={svc.name}
                        serviceDurationMin={svc.durationMinutes}
                        day={selectedDate}
                        defaultOpenHour={8}
                        defaultCloseHour={20}
                    />
                )}
            </div>
        </div>
    );
}

/* helper imagen placeholder */
function pickImage(seed: string) {
    const id = (hash(seed) % 100) + 1;
    return `https://picsum.photos/id/${id}/1000/700`;
}
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
