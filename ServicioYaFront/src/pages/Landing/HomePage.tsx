// HomePage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import Card from './components/card';
import ServiceCard from './components/cardServicio';

// 👇 importa las APIs (ajusta paths)
import { listPublicBusinesses, type PublicBusiness } from '../../api/business';
import { listServicesByBusiness, type Service } from '../../api/services';
import { absUrl } from '../../lib/url';
// importa tus assets
import imgReparaciones from '../../assets/intervencion-de-reparacion.jpg';
import imgSalud from '../../assets/saludybienestar.jpg';
// si mantienes el espacio en el nombre, funciona igual:
import imgTecnico from '../../assets/tecnico del hogar.jpg';
// si tienes una imagen para estética, impórtala también:
import imgEstetica from '../../assets/historia-estetica.jpg'; // <-- si no existe, usa un placeholder

// Mapea nombre → slug
const CATEGORY_SLUGS: Record<string, string> = {
    'Estética': 'estetica',
    'Salud y bienestar': 'salud-bienestar',
    'Técnico del hogar': 'tecnico',
    'Reparaciones': 'reparaciones',
};

// HomePage.tsx
type ServiceVM = {
    id: string;
    businessId: string;
    name: string;
    business: string;
    price: number;
    durationMinutes: number;
    image?: string;
};


export default function HomePage() {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState(''); // aún no usado
    const [svc, setSvc] = useState<ServiceVM[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // Carga inicial (catálogo sin filtro)
    useEffect(() => { loadServices(); }, []);

    const onSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        loadServices(query.trim() || undefined);
    };

    async function loadServices(q?: string) {
        try {
            setLoading(true);
            setErr(null);

            // 1) Trae negocios públicos (limita cantidad para no hacer mil requests)
            const businesses: PublicBusiness[] = await listPublicBusinesses({
                q,
                page: 1,
                pageSize: 6, // muestra servicios de los primeros 6 negocios
            });

            // 2) Para cada negocio, trae sus servicios y toma los primeros 2 (ajusta a gusto)
            // dentro de HomePage.tsx, en loadServices()
            const perBiz = await Promise.all(
                businesses.map(async (b) => {
                    const list = await listServicesByBusiness(b.id);
                    return list.slice(0, 2).map<ServiceVM>((s) => ({
                        id: s.id,
                        name: s.name,
                        business: b.displayName,
                        price: s.price,
                        durationMinutes: s.durationMinutes,
                        image: s.imageUrl || pickImage(b.id + s.name), // ← guarda en `image`
                        businessId: b.id,
                    }));
                })
            );
            setSvc(perBiz.flat().slice(0, 12));



            // 3) Aplana y limita a 12 tarjetas
            setSvc(perBiz.flat().slice(0, 12));
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || 'No se pudieron cargar los servicios');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="home light">
            {/* NAVBAR */}
            <header className="nav nav--light">
                <div className="container nav__inner">
                    <Link to="/" className="brand">
                        <span className="brand__text">ServiciosYa</span>
                    </Link>
                    <nav className="nav__menu">
                        <a href="#inicio">Inicio</a>
                    </nav>
                    <div className="nav__actions">
                        <Link to="/register" className="btn btn--dark pill">
                            ¿Tienes tu propia empresa? Regístrate ya
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO */}
            <section id="inicio" className="hero hero--split">
                <div className="container hero__grid">
                    <div className="hero__left">
                        <h1>
                            Estética, salud, técnico del hogar y mucho mas cerca de ti
                            <br />
                        </h1>
                        <p className="hero__subtitle">
                            Compara opciones, horarios y precios. Reserva en segundos.
                        </p>

                        <form className="search search--pill" onSubmit={onSearch}>
                            <input
                                type="text"
                                placeholder="¿Qué servicio necesitas?"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Servicio"
                            />
                            <input
                                type="text"
                                placeholder="Ubicación (opcional)"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                aria-label="Ubicación"
                            />
                            <button type="submit" className="btn btn--dark">Buscar</button>
                        </form>
                    </div>

                    <div className="hero__right">
                        <img
                            src="https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=1600&auto=format&fit=crop"
                            alt="Hero referencia"
                            className="hero__image"
                        />
                    </div>
                </div>
            </section>

            {/* CATEGORÍAS */}
            <section id="categorias" className="section">
                <div className="container">
                    <h2 className="section__title">Categorías</h2>
                    <div className="cards-grid">
                        {CARDS.map((c, i) => {
                            const slug = CATEGORY_SLUGS[c.title] ?? '';
                            return (
                                <Link key={i} to={`/servicios/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Card title={c.title} description={c.description} image={c.image} />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
            {/* CÓMO FUNCIONA */}
<section id="como-funciona" className="section">
  <div className="container">
    <h2 className="section__title">¿Cómo funciona?</h2>

    <div className="howto">
      <div className="howto__grid">
        <div className="howto__item">
          <div className="howto__icon">🔎</div>
          <h3 className="howto__title">Busca un servicio</h3>
          <p className="howto__text">Escribe lo que necesitas o navega por categorías.</p>
        </div>

        <div className="howto__item">
          <div className="howto__icon">📅</div>
          <h3 className="howto__title">Elige fecha y hora</h3>
          <p className="howto__text">Consulta disponibilidad en tiempo real.</p>
        </div>

        <div className="howto__item">
          <div className="howto__icon">✍️</div>
          <h3 className="howto__title">Confirma tus datos</h3>
          <p className="howto__text">Tu reserva se crea en segundos.</p>
        </div>

        <div className="howto__item">
          <div className="howto__icon">✅</div>
          <h3 className="howto__title">¡Listo!</h3>
          <p className="howto__text">Recibe confirmación por email.</p>
        </div>
      </div>

      <div className="howto__cta">
        <Link to="/servicios" className="btn btn--dark pill">Explorar servicios</Link>
      </div>
    </div>
  </div>
</section>


            {/* SERVICIOS (de la API) */}
            <section id="servicios" className="section">
                <div className="container">
                    <div className="section__head">
                        <h2>Servicios</h2>
                        <Link className="link" to="/servicios">Ver todos →</Link>
                    </div>

                    {err && <div className="err" style={{ marginBottom: '.8rem' }}>{err}</div>}
                    {loading && <div className="muted" style={{ marginBottom: '.8rem' }}>Cargando servicios…</div>}

                    <div className="grid-svc">
                        {svc.map((s) => (
                            <Link
                                key={s.id}
                                to={`/servicio/${s.id}`}
                                state={{ businessId: s.businessId }}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <ServiceCard
                                    name={s.name}
                                    business={s.business}                         // ← usar s.business
                                    price={s.price}
                                    durationMinutes={s.durationMinutes}
                                    image={absUrl(s.image) || pickImage(s.businessId + s.name)} // ← usar s.image
                                />
                            </Link>
                        ))}
                    </div>



                    {!loading && !err && svc.length === 0 && (
                        <div className="muted" style={{ marginTop: '.8rem' }}>
                            No encontramos servicios para tu búsqueda.
                        </div>
                    )}

                    <div className="pager">
                        <button className="btn" disabled>Anterior</button>
                        <button className="btn btn--dark" disabled>Siguiente</button>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="container footer__inner">
                    <p>© 2025 Kevin Dev. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

/* ---- helpers ---- */

const CARDS = [
  { title: 'Estética',            description: 'Tratamientos de belleza y cuidado personal.', image: imgEstetica || 'https://picsum.photos/id/1011/600/400' },
  { title: 'Salud y bienestar',   description: 'Servicios de salud, masajes, terapias y más.', image: imgSalud },
  { title: 'Técnico del hogar',   description: 'Plomería, electricidad, pintura y servicios técnicos.', image: imgTecnico },
  { title: 'Reparaciones',        description: 'Mantenimiento y reparaciones generales.', image: imgReparaciones },
];


function pickImage(seed: string) {
    // placeholder estable en base a un hash simple
    const id = (hash(seed) % 100) + 1; // 1..100
    return `https://picsum.photos/id/${id}/600/400`;
}
function hash(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
}
