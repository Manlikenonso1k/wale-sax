import type { GalleryItem } from '@/content/site';
import { Picture } from '@/components/ui/Picture';

/**
 * DOM gallery (§8.5): one 16:9 tile + a 2×2 grid of squares; extra items continue in a
 * 3-column grid. Each tile is a button that opens the Lightbox from its own rect.
 * Without JS the tiles still show every photo and caption.
 */
export function DomGallery({ items }: { items: GalleryItem[] }) {
  const [lead, ...rest] = items;
  const squares = rest.slice(0, 4);
  const extra = rest.slice(4);
  const tile = (item: GalleryItem, index: number, shape: 'wide' | 'square', sizes: string) => (
    <button type="button" className={`gtile gtile--${shape} press`} data-gallery-id={item.id} data-lightbox-index={index} aria-haspopup="dialog">
      <Picture name={item.image} alt={item.alt} sizes={sizes} />
      <span className="gtile__caption">{item.caption}</span>
    </button>
  );
  return (
    <div className="dom-gallery" data-gallery="dom">
      <div className="dom-gallery__main">
        {lead && <div className="dom-gallery__lead">{tile(lead, 0, 'wide', '(min-width: 900px) 760px, 100vw')}</div>}
        {squares.length > 0 && (
          <ul className="dom-gallery__squares">
            {squares.map((it, i) => (
              <li key={it.id}>{tile(it, i + 1, 'square', '(min-width: 900px) 220px, 50vw')}</li>
            ))}
          </ul>
        )}
      </div>
      {extra.length > 0 && (
        <ul className="dom-gallery__extra">
          {extra.map((it, i) => (
            <li key={it.id}>{tile(it, i + 5, 'square', '(min-width: 900px) 380px, 50vw')}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
