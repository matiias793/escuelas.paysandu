'use client';

import Image from 'next/image';

type FacadeImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Solo para las primeras fotos visibles (LCP). El resto entra lazy por defecto. */
  priority?: boolean;
  objectFit?: 'cover' | 'contain';
  quality?: number;
  onClick?: () => void;
};

/**
 * Fachada vía next/image (AVIF/WebP, tamaño responsive, lazy load).
 * Parent debe ser `relative` con tamaño definido (aspect-* / fill container).
 */
export default function FacadeImage({
  src,
  alt,
  sizes,
  className = '',
  priority = false,
  objectFit = 'cover',
  quality = 72,
  onClick,
}: FacadeImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={`${objectFit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
      onClick={onClick}
    />
  );
}
