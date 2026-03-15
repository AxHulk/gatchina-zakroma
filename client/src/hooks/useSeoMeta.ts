import { useEffect } from 'react';

interface SeoMeta {
  title?: string;
  description?: string;
}

const defaultTitle = 'Гатчинские закрома — свежие фермерские продукты с доставкой';
const defaultDescription = 'Интернет-магазин «Гатчинские закрома». У нас вы можете купить свежие фермерские продукты с доставкой на дом: овощи, фрукты, ягоды, грибы, зелень и орехи. Гарантия качества и быстрая доставка по Гатчине и району.';

export function useSeoMeta({ title, description }: SeoMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    const finalTitle = title ? `${title} — Гатчинские закрома` : defaultTitle;
    document.title = finalTitle;

    let metaDescription = document.querySelector('meta[name="description"]');
    let prevDescription = '';

    if (metaDescription) {
      prevDescription = metaDescription.getAttribute('content') || '';
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute('content', description || defaultDescription);

    return () => {
      document.title = prevTitle;
      if (metaDescription) {
        if (prevDescription) {
          metaDescription.setAttribute('content', prevDescription);
        } else {
          document.head.removeChild(metaDescription!);
        }
      }
    };
  }, [title, description]);
}
