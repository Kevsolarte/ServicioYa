// src/pages/Landing/components/cardServicio.tsx
import './cardServicio.css';
import { absUrl } from '../../../lib/url';

type Props = {
  name: string;
  business: string;
  price: number;
  durationMinutes: number;
  image?: string;
  onClick?: () => void;
};

const priceFmt = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n);

export default function ServiceCard({
  name, business, price, durationMinutes, image, onClick
}: Props) {
  const src = absUrl(image) || 'https://placehold.co/1000x600?text=Servicio';

  return (
    <article className="card card--svc" onClick={onClick}>
      <img
        className="card__img"
        src={src}
        alt={name}
        loading="lazy"
        onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/1000x600?text=Servicio'; }}
      />

      <div className="card__body">
        <div className="card__row">
          <h3 className="card__title">{name}</h3>
          <div className="card__price">{priceFmt(price)}</div>
        </div>

        <div className="card__biz">{business}</div>
        <div className="card__meta">{durationMinutes} min</div>

        <div className="card__actions">
          <button className="btn btn--dark pill" type="button">Reservar</button>
        </div>
      </div>
    </article>
  );
}
