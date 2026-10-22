import type { GalleryItem } from '@/content/site';
import { Picture } from '@/components/ui/Picture';

/**
 * Fallback gallery (§8.5): one 16:9 tile + a 2×2 grid of squares; extra items continue
 * in a 3-column grid. M2 turns each tile into a button that opens the Lightbox.
 */
export function DomGallery({ items }: { items: GalleryItem[] }) {
  const [lead, ...rest] = items;
  const squares = rest.slice(0, 4);
  const extra = rest.slice(4);
  const tile = (item: GalleryItem, shape: 'wide' | 'square', sizes: string) => (
    <figure className={`gtile gtile--${shape}`} data-gallery-id={item.id}>
      <Picture name={item.image} alt={item.alt} sizes={sizes} />
      <figcaption className="gtile__caption">{item.caption}</figcaption>
    </figure>
  );
  return (
    <div className="dom-gallery" data-gallery="dom">
      <div className="dom-gallery__main">
        {lead && <div className="dom-gallery__lead">{tile(lead, 'wide', '(min-width: 900px) 760px, 100vw')}</div>}
        {squares.length > 0 && (
          <ul className="dom-gallery__squares">
            {squares.map((it) => (
              <li key={it.id}>{tile(it, 'square', '(min-width: 900px) 220px, 50vw')}</li>
            ))}
          </ul>
        )}
      </div>
      {extra.length > 0 && (
        <ul className="dom-gallery__extra">
          {extra.map((it) => (
            <li key={it.id}>{tile(it, 'square', '(min-width: 900px) 380px, 50vw')}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
