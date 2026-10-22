import { site } from '@/content/site';

/** JSON-LD @graph: one Person + two Services. No ratings or reviews (M-09). */
export function JsonLd() {
  const id = `${site.siteUrl}/#wale`;
  const sameAs = site.instagram.url ? [site.instagram.url] : undefined;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': id,
        name: site.fullName ?? site.name,
        jobTitle: site.role,
        image: `${site.siteUrl}/images/${site.hero.image.file}`,
        telephone: `+${site.whatsapp.number}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: site.seo.locality,
          addressRegion: site.seo.region,
          addressCountry: site.seo.country,
        },
        ...(sameAs ? { sameAs } : {}),
      },
      ...site.seo.services.map((name) => ({
        '@type': 'Service',
        name,
        provider: { '@id': id },
        areaServed: { '@type': 'City', name: site.seo.city },
      })),
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
