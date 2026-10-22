import { getImage } from '@/lib/images';

type Props = {
  name: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * <picture> with AVIF + WebP sources from the build-time manifest (§14).
 * Always cover-fitted by CSS (M-11); width/height prevent layout shift.
 */
export function Picture({ name, alt, sizes, priority = false, className = '' }: Props) {
  const img = getImage(name);
  return (
    <picture className={`picture ${className}`.trim()}>
      {img.avif && <source type="image/avif" srcSet={img.avif} sizes={sizes} />}
      {img.webp && <source type="image/webp" srcSet={img.webp} sizes={sizes} />}
      <img
        src={img.src}
        alt={alt}
        width={img.width}
        height={img.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
