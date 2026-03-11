/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the OpenAI ChatKit web component script to be loaded
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
