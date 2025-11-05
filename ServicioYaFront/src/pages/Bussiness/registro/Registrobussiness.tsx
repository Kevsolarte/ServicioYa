import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, login } from '../../../api/auth';
import { setToken, setUser } from '../../../lib/auth';

// ✅ usa el mismo CSS que Login (ajusta la ruta)
import '../Auth.css';

type Form = {
  fullName: string;
  email: string;
  password: string;
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const passOk = (v: string) => v.length >= 6;

export default function RegisterPage() {
  const [form, setForm] = useState<Form>({ fullName: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{[k in keyof Form]?: string}>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.fullName.trim()) e.fullName = 'Tu nombre es obligatorio';
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
      await register(form); // crea el usuario (no retorna token)
      const auth = await login({ email: form.email, password: form.password });
      setToken(auth.accessToken);
      setUser(auth.user);
      navigate('/panel', { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'No se pudo registrar. Intenta de nuevo.';
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
            <h2>Registra tu empresa</h2>
            <p className="auth__subtitle">Crea tu cuenta de comerciante para publicar servicios.</p>

            {apiError && <div className="alert">{apiError}</div>}

            <form className="auth__form" onSubmit={onSubmit} noValidate>
              <label>
                <span>Nombre completo</span>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Tu nombre y apellido"
                  value={form.fullName}
                  onChange={onChange}
                  aria-invalid={!!errors.fullName}
                />
                {errors.fullName && <small className="err">{errors.fullName}</small>}
              </label>

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
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={onChange}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowPass(s => !s)}
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {errors.password && <small className="err">{errors.password}</small>}
              </label>

              <div className="actions">
                <button className="btn btn--dark pill" disabled={loading}>
                  {loading ? 'Creando cuenta…' : 'Crear cuenta'}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => navigate('/login')}
                >
                  Ya tengo cuenta
                </button>
              </div>
            </form>

            <div className="auth__alt">
              <span>¿Ya tienes cuenta?</span>
              <Link to="/login" className="link">Inicia sesión</Link>
            </div>
          </section>

          {/* derecha: ilustración (opcional) */}
          <aside className="auth__side">
            <img
              className="auth__side-img"
              src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop"
              alt="Registro"
            />
            <div className="auth__side-overlay" />
            <div className="auth__side-content">
              <span className="auth__logo">ServiciosYa</span>
            </div>
            <div className="auth__claim">
              ¡Comienza a recibir reservas hoy mismo!
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
