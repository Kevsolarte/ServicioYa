import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

// 🔹 reutilizamos estilos del Home (botones, grid-svc, etc.)
import '../../Landing/HomePage.css';
// 🔹 estilos mínimos propios de esta pantalla
import './ServicioExplorar.css';

import ServiceCard from '../../Landing/components/cardServicio'; // <-- ajusta path si difiere
import { listPublicBusinesses, type PublicBusiness } from '../../../api/business';
import { listServicesByBusiness, type Service } from '../../../api/services';
import { absUrl } from '../../../lib/url';

type CardVM = {
  id: string;
  businessId: string;
  name: string;
  business: string;
  price: number;
  durationMinutes: number;
  image?: string;
};

export default function ServiciosExplorar() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [items, setItems] = useState<CardVM[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { void load(); }, [sp]);

  async function load() {
    try {
      setLoading(true); setErr(null);
      const q = sp.get('q') || undefined;

      // 1) Negocios públicos
      const businesses: PublicBusiness[] = await listPublicBusinesses({ q, page: 1, pageSize: 12 });

      // 2) Todos los servicios por negocio
      const merged: CardVM[] = [];
      for (const b of businesses) {
        const svcs: Service[] = await listServicesByBusiness(b.id);
        merged.push(...svcs.map(s => ({
          id: s.id,
          businessId: b.id,
          name: s.name,
          business: b.displayName,
          price: s.price,
          durationMinutes: s.durationMinutes,
          image: s.imageUrl ? absUrl(s.imageUrl) : undefined,  // usa imagen subida si existe
        })));
      }

      setItems(merged);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'No se pudieron cargar los servicios.');
    } finally {
      setLoading(false);
    }
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(sp);
    if (q.trim()) next.set('q', q.trim()); else next.delete('q');
    setSp(next, { replace: true });
  }

  return (
    <div className="section svc-explore">
      <div className="container">
        <div className="section__head">
          <h2>Servicios</h2>
          <span className="muted">{loading ? 'Cargando…' : `${items.length} resultados`}</span>
        </div>

        {/* 🔹 buscador estilo pill (mismo look que Home) */}
        <form className="search search--pill svc-explore__search" onSubmit={onSearch}>
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Buscar por servicio o negocio…"
            aria-label="Buscar servicios"
          />
          <button className="btn btn--dark">Buscar</button>
        </form>

        {err && <div className="err" style={{marginBottom:'.6rem'}}>{err}</div>}

        {/* 🔹 mismo grid que en Home */}
        <div className="grid-svc">
          {items.map(s => (
            <Link
              key={s.id}
              to={`/servicio/${s.id}`}
              state={{ businessId: s.businessId }}
              style={{ textDecoration:'none', color:'inherit' }}
            >
              <ServiceCard
                name={s.name}
                business={s.business}
                price={s.price}
                durationMinutes={s.durationMinutes}
                image={s.image}
              />
            </Link>
          ))}
        </div>

        {!loading && !err && items.length === 0 && (
          <div className="muted" style={{marginTop:'.8rem'}}>Sin resultados.</div>
        )}
      </div>
    </div>
  );
}
