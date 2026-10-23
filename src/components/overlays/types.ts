/** Gallery item data prepared on the server for the Lightbox (and the 3D gallery in M3). */
export type LightboxItem = {
  id: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
  /** Largest variant ≤ 1600w (OQ-8) */
  avif: string;
  webp: string;
  src: string;
  videoSrc: string | null;
  externalUrl: string | null;
  externalKind: 'instagram' | 'youtube' | null;
};
