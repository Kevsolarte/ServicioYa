import type { Business } from '../../../api/business';
import type { SaleItem } from './types';

type Props = {
  business: Business;
  items: SaleItem[]; // mock por ahora
};

export default function SalesTab({ business, items }: Props) {
  const total = items.reduce((acc, s) => acc + s.amount, 0);

  return (
    <div>
      <h3>Ventas — {business.displayName}</h3>
      <p className="muted">Resumen de ventas (demo).</p>

      <div className="kpis">
        <div className="kpi">
          <div className="kpi__label">Transacciones</div>
          <div className="kpi__value">{items.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Ingresos</div>
          <div className="kpi__value">
            {new Intl.NumberFormat('es-ES', { style:'currency', currency:'USD' }).format(total)}
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Item</th>
              <th>Cant.</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id}>
                <td>{new Date(s.date).toLocaleDateString()}</td>
                <td>{s.item}</td>
                <td>{s.qty}</td>
                <td>{new Intl.NumberFormat('es-ES', { style:'currency', currency:'USD' }).format(s.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
