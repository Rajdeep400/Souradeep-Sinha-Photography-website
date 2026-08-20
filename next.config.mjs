/** @type {import('next').NextConfig} */
const nextConfig = {
  // Native / heavy node modules must stay outside the bundler.
  serverExternalPackages: ['better-sqlite3', 'sharp'],
  images: { unoptimized: true },
  poweredByHeader: false,
  compress: true,
  experimental: {
    // uploads can be large DSLR files
    serverActions: { bodySizeLimit: '50mb' },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        // never let a studio page or API response be cached by a proxy
        source: '/studio/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
