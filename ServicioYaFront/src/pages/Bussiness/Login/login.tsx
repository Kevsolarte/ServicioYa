import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../../api/auth';
import { setToken, setUser } from '../../../lib/auth';
import axios from 'axios';

// ✅ usa el CSS nuevo (ajusta la ruta según dónde guardes Auth.css)
import '../Auth.css';

type Form = {
  email: string;
  password: string;
  remember: boolean;
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const passOk = (v: string) => v.length >= 6;

export default function LoginPage() {
  const [form, setForm] = useState<Form>({ email: '', password: '', remember: true });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!emailOk(form.email)) e.email = 'Email inválido';
    if (!passOk(form.password)) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    try {
      const { accessToken, user } = await login({ email: form.email, password: form.password });
      setToken(accessToken);
      setUser(user);

      const to = (location.state as any)?.from ?? '/panel';
      navigate(to, { replace: true });
    } catch (err: unknown) {
      let msg = 'Credenciales inválidas';
      if (axios.isAxiosError(err)) {
        msg =
          (err.response?.data as any)?.message ||
          (err.response?.data as any)?.error ||
          err.message ||
          msg;
      }
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth light">
      <div className="container">
        <div className="auth__wrap">
          {/* izquierda: tarjeta */}
          <section className="auth__card">
            <h2>Inicia sesión</h2>
            <p className="auth__subtitle">Accede a tu panel para gestionar tu negocio.</p>

            {apiError && <div className="alert">{apiError}</div>}

            <form className="auth__form" onSubmit={onSubmit} noValidate>
              <label>
                <span>Correo electrónico</span>
                <input
                  name="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={form.email}
                  onChange={onChange}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <small className="err">{errors.email}</small>}
              </label>

              <label>
                <span>Contraseña</span>
                <div className="auth__pass">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    value={form.password}
                    onChange={onChange}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowPass(s => !s)}
                  >
                    {showPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {errors.password && <small className="err">{errors.password}</small>}
              </label>

              <label className="auth__row" style={{ alignItems: 'center' }}>
                <span style={{ display:'flex', alignItems:'center', gap:'.5rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={onChange}
                  />
                  Recordarme en este equipo
                </span>
              </label>

              <div className="actions">
                <button className="btn btn--dark pill" disabled={loading}>
                  {loading ? 'Ingresando…' : 'Ingresar'}
                </button>
              </div>
            </form>

            <div className="auth__alt">
              <span>¿No tienes cuenta?</span>
              <Link to="/register" className="link">Regístrate</Link>
            </div>
          </section>

          {/* derecha: ilustración (opcional) */}
          <aside className="auth__side">
            <img
              className="auth__side-img"
              src="https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=1200&auto=format&fit=crop"
              alt="Servicios"
            />
            <div className="auth__side-overlay" />
            <div className="auth__side-content">
              <span className="auth__logo">ServiciosYa</span>
            </div>
            <div className="auth__claim">
              Publica tus servicios y recibe reservas en segundos.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
