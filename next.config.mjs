/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://events.mapbox.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,POST',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
