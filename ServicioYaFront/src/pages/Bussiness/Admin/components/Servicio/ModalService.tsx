import { useState } from 'react';
import { createService } from '../../../../../api/services';
import type { Service, CreateServicePayload, ServiceCategory } from '../../../../../api/services';

const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: 'ESTETICA',        label: 'Estética' },
  { value: 'SALUD_BIENESTAR', label: 'Salud y bienestar' },
  { value: 'TECNICO_HOGAR',   label: 'Técnico del hogar' },
  { value: 'REPARACIONES',    label: 'Reparaciones' },
];

export default function CreateServiceModal({ businessId, onClose, onCreated }: Props) {
  const [form, setForm] = useState<CreateServicePayload>({
    businessId,
    name: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    category: 'ESTETICA', // 👈 default (o quítalo si Prisma ya tiene default)
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === 'price' || name === 'durationMinutes' ? Number(value) : (value as any),
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setErr('El nombre es obligatorio');
    if (form.price < 0) return setErr('El precio no puede ser negativo');
    if (form.durationMinutes <= 0) return setErr('La duración debe ser mayor a 0');

    setSaving(true); setErr(null);
    try {
      const created = await createService(form);
      onCreated(created);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'No se pudo crear el servicio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Nuevo servicio</h3>
        {err && <div className="err" style={{ marginBottom: '.5rem' }}>{err}</div>}

        <form className="form" onSubmit={onSubmit}>
          <label>
            <span>Nombre *</span>
            <input name="name" value={form.name} onChange={onChange} placeholder="Ej. Masaje relajante" />
          </label>

          <label>
            <span>Descripción</span>
            <textarea name="description" value={form.description ?? ''} onChange={onChange} rows={3} />
          </label>

          {/* 👇 NUEVO: categoría */}
          <label>
            <span>Categoría</span>
            <select name="category" value={form.category ?? 'ESTETICA'} onChange={onChange}>
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <div className="grid2">
            <label>
              <span>Precio</span>
              <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} />
            </label>
            <label>
              <span>Duración (min)</span>
              <input name="durationMinutes" type="number" value={form.durationMinutes} onChange={onChange} />
            </label>
          </div>

          <div className="actions">
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button className="btn btn--dark" disabled={saving}>
              {saving ? 'Creando…' : 'Crear servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
