// src/pages/Merchant/DashboardPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext'; // ajusta si tu ruta difiere

import { listMyBusinesses, createBusiness } from '../../../api/business';
import type { Business, CreateBusinessPayload } from '../../../api/business';

import CalendarTab from './Calendario';
import SalesTab from './ventas';
import type { CalendarItem, SaleItem } from './types';
import ServicesSection from './components/Servicio/ServiceSection';

import './dashboard.css';


export default function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth();

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'perfil' | 'calendario' | 'ventas'>('perfil');

    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Datos MOCK por negocio (para tabs)
    const [mockBookingsByBiz, setMockBookingsByBiz] = useState<Record<string, CalendarItem[]>>({});
    const [mockSalesByBiz, setMockSalesByBiz] = useState<Record<string, SaleItem[]>>({});

    // Carga negocios del comerciante (real) y genera mocks para tabs
    useEffect(() => {
        if (authLoading) return;
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await listMyBusinesses(); // <- llamada real para tus negocios
                if (!mounted) return;
                setBusinesses(data);
                const firstId = data[0]?.id ?? null;
                setSelectedId(firstId);

                // Genera datos MOCK por negocio para Calendario/Ventas
                const bookings: Record<string, CalendarItem[]> = {};
                const sales: Record<string, SaleItem[]> = {};

                setMockBookingsByBiz(bookings);
                setMockSalesByBiz(sales);
            } catch (e: any) {
                setError(e?.response?.data?.message || e?.message || 'No se pudo cargar tus negocios');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [authLoading]);

    const selected = useMemo(
        () => businesses.find(b => b.id === selectedId) || null,
        [businesses, selectedId]
    );

    const onCreated = (b: Business) => {
        setBusinesses(prev => [b, ...prev]);
        // crea mocks para el nuevo negocio
        setMockBookingsByBiz(prev => ({ ...prev, [b.id]: makeMockBookings(b) }));
        setMockSalesByBiz(prev => ({ ...prev, [b.id]: makeMockSales(b) }));
        setSelectedId(b.id);
        setShowCreate(false);
    };

    return (
        <div className="dash dash--light">
            {/* Top bar: chips de negocios */}
            <div className="dash__top">
                <div className="chips">
                    {businesses.map(b => (
                        <button
                            key={b.id}
                            className={`chip ${b.id === selectedId ? 'chip--active' : ''}`}
                            onClick={() => setSelectedId(b.id)}
                            title={b.displayName}
                        >
                            {b.displayName}
                        </button>
                    ))}
                    <button className="chip chip--add" onClick={() => setShowCreate(true)} title="Crear negocio">＋</button>
                </div>

                <div className="dash__user">
                    <span>{user?.fullName ?? user?.email}</span>
                    <button className="btn" onClick={logout}>Cerrar sesión</button>
                </div>
            </div>

            {/* Layout principal */}
            <div className="dash__grid">
                <aside className="dash__side">
                    <button
                        className={`sidebtn ${activeTab === 'perfil' ? 'sidebtn--active' : ''}`}
                        onClick={() => setActiveTab('perfil')}
                    >
                        Perfil
                    </button>
                    <button
                        className={`sidebtn ${activeTab === 'calendario' ? 'sidebtn--active' : ''}`}
                        onClick={() => setActiveTab('calendario')}
                    >
                        Calendario
                    </button>
                    <button
                        className={`sidebtn ${activeTab === 'ventas' ? 'sidebtn--active' : ''}`}
                        onClick={() => setActiveTab('ventas')}
                    >
                        Ventas
                    </button>
                </aside>

                <main className="dash__content">
                    {loading && <div className="muted">Cargando tus negocios…</div>}
                    {error && <div className="err">{error}</div>}

                    {!loading && !error && !selected && (
                        <div className="muted">Aún no tienes negocios. Crea el primero con el botón “＋”.</div>
                    )}

                    {!loading && !error && selected && activeTab === 'perfil' && (
                        <ProfilePanel business={selected} />
                    )}

                    {!loading && !error && selected && activeTab === 'calendario' && (
                        <CalendarTab
                            business={selected}
                            items={mockBookingsByBiz[selected.id] ?? []}
                        />
                    )}

                    {!loading && !error && selected && activeTab === 'ventas' && (
                        <SalesTab
                            business={selected}
                            items={mockSalesByBiz[selected.id] ?? []}
                        />
                    )}
                </main>
            </div>

            {showCreate && (
                <CreateBusinessModal
                    onClose={() => setShowCreate(false)}
                    onCreated={onCreated}
                />
            )}
        </div>
    );
}

/* ---------- Panel Perfil (simple) ---------- */
function ProfilePanel({ business }: { business: Business }) {
    return (
        <div className="panel">
            <h3>{business.displayName}</h3>
            <p className="muted">{business.description || 'Sin descripción'}</p>
            <div className="grid2">
                <div>
                    <label className="lbl">Email</label>
                    <div>{business.email || '—'}</div>
                </div>
                <div>
                    <label className="lbl">Teléfono</label>
                    <div>{business.phone || '—'}</div>
                </div>
                <div>
                    <label className="lbl">Zona horaria</label>
                    <div>{business.timezone}</div>
                </div>
                <div>
                    <label className="lbl">Estado</label>
                    <div>{business.isActive ? 'Activo' : 'Inactivo'}</div>
                </div>
            </div>
            <ServicesSection businessId={business.id} />
        </div>
    );
}

/* ---------- Modal de creación ---------- */
function CreateBusinessModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: (b: Business) => void;
}) {
    const [form, setForm] = useState<CreateBusinessPayload>({
        displayName: '',
        description: '',
        phone: '',
        email: '',
        timezone: 'America/Caracas',
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.displayName.trim() || !form.timezone.trim()) {
            setErr('Nombre y zona horaria son obligatorios');
            return;
        }
        setSaving(true);
        setErr(null);
        try {
            const created = await createBusiness(form);
            onCreated(created);
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || 'No se pudo crear el negocio');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal__backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>Crear negocio</h3>
                {err && <div className="err" style={{ marginBottom: '.5rem' }}>{err}</div>}
                <form className="form" onSubmit={onSubmit}>
                    <label>
                        <span>Nombre (displayName) *</span>
                        <input name="displayName" value={form.displayName} onChange={onChange} placeholder="Ej. Spa Relax" />
                    </label>

                    <label>
                        <span>Descripción</span>
                        <textarea name="description" value={form.description} onChange={onChange} rows={3} />
                    </label>

                    <div className="grid2">
                        <label>
                            <span>Teléfono</span>
                            <input name="phone" value={form.phone} onChange={onChange} placeholder="+58 ..." />
                        </label>
                        <label>
                            <span>Email</span>
                            <input name="email" type="email" value={form.email} onChange={onChange} placeholder="negocio@ejemplo.com" />
                        </label>
                    </div>

                    <label>
                        <span>Zona horaria *</span>
                        <select name="timezone" value={form.timezone} onChange={onChange}>
                            <option value="America/Caracas">America/Caracas</option>
                            <option value="America/Bogota">America/Bogota</option>
                            <option value="America/Lima">America/Lima</option>
                            <option value="America/Mexico_City">America/Mexico_City</option>
                            <option value="America/Santiago">America/Santiago</option>
                            <option value="America/Buenos_Aires">America/Buenos_Aires</option>
                            <option value="UTC">UTC</option>
                        </select>
                    </label>

                    <div className="actions">
                        <button type="button" className="btn" onClick={onClose}>Cancelar</button>
                        <button className="btn btn--dark" disabled={saving}>
                            {saving ? 'Creando…' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
