// src/pages/Bussiness/Admin/components/Servicio/ServiceCard.tsx
import type { Service } from '../../../../../api/services';

type Props = {
  service: Service;
  onEdit?: (svc: Service) => void;  // 👈 nuevo
};

export default function ServiceCard({ service, onEdit }: Props) {
  return (
    <div
      className="srvcard"
      role="button"
      onClick={() => onEdit?.(service)}
      title="Editar servicio"
      style={{cursor:'pointer'}}
    >
      <div className="srvcard__head">
        <h4 className="srvcard__title">{service.name}</h4>
        {service.isActive === false && <span className="tag">Inactivo</span>}
      </div>

      {service.description && (
        <p className="srvcard__desc">{service.description}</p>
      )}

      <div className="srvcard__meta">
        <div>
          <div className="lbl">Precio</div>
          <div className="strong">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(service.price)}
          </div>
        </div>
        <div>
          <div className="lbl">Duración</div>
          <div className="strong">{service.durationMinutes} min</div>
        </div>
      </div>
    </div>
  );
}
