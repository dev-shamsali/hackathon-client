/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://api-hackathon.nexcorealliance.com'
    : 'http://localhost:5000');

const nextConfig = {
  images: { remotePatterns: [] },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  async rewrites() {
    return [
      { source: '/api/:path*',     destination: `${backendUrl}/api/:path*`     },
      { source: '/uploads/:path*', destination: `${backendUrl}/uploads/:path*` }
    ];
  }
};

module.exports = nextConfig;
