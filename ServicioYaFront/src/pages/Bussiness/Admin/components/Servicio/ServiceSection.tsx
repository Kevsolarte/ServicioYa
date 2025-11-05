// src/pages/Bussiness/Admin/components/Servicio/ServiceSection.tsx
import { useEffect, useState } from 'react';
import { listServicesByBusiness, type Service } from '../../../../../api/services';
import ServiceCard from './ServiceCarta';
import ServiceUpsertModal from './Serviceupdatemodal';

export default function ServicesSection({ businessId }: { businessId: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<Service | null>(null);

  useEffect(() => {
    (async () => {
      const rows = await listServicesByBusiness(businessId);
      setServices(rows);
    })();
  }, [businessId]);

  const openCreate = () => { setMode('create'); setEditing(null); setOpen(true); };
  const openEdit = (svc: Service) => { setMode('edit'); setEditing(svc); setOpen(true); };

  const handleSaved = (svc: Service) => {
    if (mode === 'create') setServices(prev => [svc, ...prev]);
    else setServices(prev => prev.map(s => s.id === svc.id ? svc : s));
  };

  const handleDeleted = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  return (
    <section className="services">
      <div className="services__header">
        <h4 style={{margin:0}}>Servicios</h4>
        <button className="btn btn--dark pill" onClick={openCreate}>Añadir servicio</button>
      </div>

      <div className="srvgrid">
        {services.map(s => (
          <ServiceCard key={s.id} service={s} onEdit={openEdit} />
        ))}
      </div>

      {open && (
        <ServiceUpsertModal
          mode={mode}
          businessId={businessId}
          onClose={() => setOpen(false)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          service={editing ?? undefined}
        />
      )}
    </section>
  );
}
