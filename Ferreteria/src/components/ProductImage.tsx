import type { ImgHTMLAttributes, SyntheticEvent } from 'react';
import type { Product } from '../types';

export const FALLBACK_PRODUCT_IMAGE = '/products/default.svg';

function showFallbackImage(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (!image.src.endsWith(FALLBACK_PRODUCT_IMAGE)) {
    image.src = FALLBACK_PRODUCT_IMAGE;
  }
}

type ProductImageProps = { product: Product } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;

export default function ProductImage({ product, ...imgProps }: ProductImageProps) {
  return (
    <img
      src={product.imageUrl || FALLBACK_PRODUCT_IMAGE}
      alt={product.name}
      onError={showFallbackImage}
      {...imgProps}
    />
  );
}
