import { MetadataRoute } from 'next';
import { MYSTERY_DETAILS } from '@/lib/rosary/mysteryDetails';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://prayholyrosary.netlify.app';
  const now = new Date();

  const mysteryPages = MYSTERY_DETAILS.map((m) => ({
    url: `${baseUrl}/mysteries/${m.setKey}/${m.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...mysteryPages,
  ];
}
