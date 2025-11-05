import './card.css'
import React from 'react'
import { absUrl } from '../../../lib/url';
 

interface CardProps {
  title: string
  description: string
  image?: string
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({ title, description, image, }) => {
    return (
        <div className="card">
            <a href="#">
            <img src={image} alt={title} />
                <h2>{title}</h2>
                <p>{description}</p>
            </a>
        </div>
      )
}
export default Card