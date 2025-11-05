// src/pages/Bussiness/Admin/components/Servicio/ServiceUpsertModal.tsx
import { useEffect, useState } from 'react';
import {
  createService,
  updateService,
  deleteService,
  type Service,
  type CreateServicePayload,
  // si no tienes UpdateServicePayload puedes usar Partial<CreateServicePayload>
  type ServiceCategory,
} from '../../../../../api/services';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  businessId: string;
  onClose: () => void;
  onSaved: (svc: Service) => void;     // crear o actualizar
  onDeleted?: (id: string) => void;    // al eliminar
  service?: Service;                   // requerido en modo 'edit'
};

const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: 'ESTETICA',        label: 'Estética' },
  { value: 'SALUD_BIENESTAR', label: 'Salud y bienestar' },
  { value: 'TECNICO_HOGAR',   label: 'Técnico del hogar' },
  { value: 'REPARACIONES',    label: 'Reparaciones' },
];

export default function ServiceUpsertModal({
  mode,
  businessId,
  onClose,
  onSaved,
  onDeleted,
  service,
}: Props) {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState<CreateServicePayload>({
    businessId,
    name: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    category: 'ESTETICA',
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && service) {
      setForm({
        businessId: service.businessId,
        name: service.name,
        description: service.description ?? '',
        price: service.price,
        durationMinutes: service.durationMinutes,
        category: (service as any).category ?? 'ESTETICA',
      });
    }
  }, [isEdit, service]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]:
        name === 'price' || name === 'durationMinutes'
          ? Number(value)
          : (value as any),
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'El nombre es obligatorio';
    if (form.price < 0) return 'El precio no puede ser negativo';
    if (form.durationMinutes <= 0) return 'La duración debe ser mayor a 0';
    return null;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) return setErr(v);

    try {
      setSaving(true);
      setErr(null);
      if (isEdit && service) {
        const updated = await updateService(service.id, {
          name: form.name,
          description: form.description,
          price: form.price,
          durationMinutes: form.durationMinutes,
          category: form.category,
          // puedes permitir activar/inactivar si quieres:
          // isActive: true/false
        } as any);
        onSaved(updated);
      } else {
        const created = await createService(form);
        onSaved(created);
      }
      onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || !service) return;
    const ok = window.confirm('¿Eliminar este servicio? Podrás crearlo de nuevo cuando quieras.');
    if (!ok) return;
    try {
      setSaving(true);
      await deleteService(service.id);
      onDeleted?.(service.id);
      onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'No se pudo eliminar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title" style={{margin:0}}>
            {isEdit ? 'Editar servicio' : 'Nuevo servicio'}
          </h3>
          <button className="btn" onClick={onClose}>✕</button>
        </div>

        {err && <div className="err" style={{ margin: '.6rem 0' }}>{err}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span>Nombre *</span>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Ej. Masaje relajante"
            />
          </label>

          <label>
            <span>Descripción</span>
            <textarea
              name="description"
              value={form.description ?? ''}
              onChange={onChange}
              rows={3}
            />
          </label>

          <label>
            <span>Categoría</span>
            <select
              name="category"
              value={(form as any).category ?? 'ESTETICA'}
              onChange={onChange}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <div className="grid2">
            <label>
              <span>Precio</span>
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={onChange}
              />
            </label>

            <label>
              <span>Duración (min)</span>
              <input
                name="durationMinutes"
                type="number"
                value={form.durationMinutes}
                onChange={onChange}
              />
            </label>
          </div>

          <div className="actions" style={{justifyContent:'space-between'}}>
            {isEdit ? (
              <button
                type="button"
                className="btn btn--outline"
                onClick={handleDelete}
                disabled={saving}
              >
                Eliminar
              </button>
            ) : <span />}

            <div style={{display:'flex', gap:'.6rem'}}>
              <button type="button" className="btn" onClick={onClose}>Cancelar</button>
              <button className="btn btn--dark" disabled={saving}>
                {saving ? (isEdit ? 'Guardando…' : 'Creando…') : (isEdit ? 'Guardar cambios' : 'Crear servicio')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
