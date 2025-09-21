/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development' && !process.env.VERCEL

    if (isDev) {
      // LOCAL: your local API *does* use /api
      return [
        { source: '/api/:path*', destination: 'http://localhost:5000/api/:path*' },
      ]
    }

    // VERCEL: Render API lives at root (no /api)
    const apiOrigin = process.env.API_ORIGIN // e.g. https://attendify-wnl8.onrender.com
    if (apiOrigin) {
      return [
        {
          // frontend calls /api/classes → goes to https://attendify-wnl8.onrender.com/classes
          source: '/api/:path*',
          destination: `${apiOrigin.replace(/\/$/, '')}/:path*`,
        },
      ]
    }

    return []
  },
}

module.exports = nextConfig
