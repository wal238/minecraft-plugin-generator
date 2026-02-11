import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      {
        userAgent: '*',
        disallow: ['/account', '/api/', '/login', '/signup', '/reset-password', '/update-password', '/callback'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
