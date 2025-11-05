// src/pages/ServiciosPage/ServiciosCategoriaPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ServiceCard from '../Landing/components/cardServicio';
import { listPublicBusinesses, type PublicBusiness } from '../../api/business';
import { listServicesByBusiness, type Service } from '../../api/services';
// import '../Landing/HomePage.css';
import './components/Serviciocategoria.css';

// Slug -> etiqueta visible
const CATEGORY_INFO: Record<string, { label: string }> = {
  'estetica': { label: 'Estética' },
  'salud-bienestar': { label: 'Salud y bienestar' },
  'tecnico': { label: 'Técnico del hogar' },
  'reparaciones': { label: 'Reparaciones' },
};

// Slug -> valor que espera tu backend en Prisma (ajústalo si tu enum difiere)
const CATEGORY_API: Record<string, string> = {
  'estetica': 'estetica',
  'salud-bienestar': 'salud-bienestar',
  'tecnico': 'tecnico',
  'reparaciones': 'reparaciones',
  // Si en tu DB usas enum en MAYÚSCULAS, cambia a:
  // 'estetica': 'ESTETICA', etc.
};

type ServiceVM = {
  id: string;
  businessId: string;
  name: string;
  business: string;
  price: number;
  durationMinutes: number;
  image?: string;
};

export default function ServicesCategoryPage() {
  const { categoria = '' } = useParams<{ categoria: string }>();
  const info = CATEGORY_INFO[categoria];
  const apiCategory = CATEGORY_API[categoria];

  const [items, setItems] = useState<ServiceVM[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!apiCategory) return;
      try {
        setLoading(true); setErr(null);

        // 1) trae negocios públicos (puedes aumentar pageSize si quieres)
        const businesses: PublicBusiness[] = await listPublicBusinesses({
          page: 1,
          pageSize: 12,
        });

        // 2) para cada negocio trae sus servicios filtrados por categoría
        const byBiz = await Promise.all(
          businesses.map(async (b) => {
            const svcs: Service[] = await listServicesByBusiness(b.id, apiCategory);
            return svcs.map<ServiceVM>((s) => ({
              id: s.id,
              businessId: b.id,
              name: s.name,
              business: b.displayName,
              price: s.price,
              durationMinutes: s.durationMinutes,
              image: s.imageUrl, // si no viene, tu ServiceCard ya pone placeholder
            }));
          })
        );

        if (!mounted) return;
        setItems(byBiz.flat());
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.response?.data?.message || e?.message || 'No se pudieron cargar los servicios');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [apiCategory]);

  const title = useMemo(
    () => (info ? `Servicios — ${info.label}` : 'Categoría no encontrada'),
    [info]
  );

  if (!info) {
    return (
      <div className="svc-cat">
        <div className="container svc-cat__section">
          <h2 className="svc-cat__title">La categoría no existe.</h2>
          <Link to="/" className="btn">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="svc-cat">
      <div className="container svc-cat__section">
        <div className="svc-cat__head">
          <h2 className="svc-cat__title">Servicios — {info.label}</h2>
          <Link to="/" className="svc-cat__back">← Volver</Link>
        </div>

        {err && <div className="err" style={{marginBottom:'.6rem'}}>{err}</div>}
        {loading && <div className="muted" style={{marginBottom:'.6rem'}}>Cargando…</div>}

        <div className="svc-cat__grid">
          {!loading && !err && items.length === 0 && (
            <div className="muted">No hay servicios en esta categoría aún.</div>
          )}

          {items.map((s) => (
            <Link
              key={s.id}
              to={`/servicio/${s.id}`}
              state={{ businessId: s.businessId }}
              className="svc-cat__cardlink"
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
      </div>
    </div>
  );

}
