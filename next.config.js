/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development' && !process.env.VERCEL
    if (isDev) {
      return [
        { source: '/api/:path*', destination: 'http://localhost:5000/api/:path*' },
      ]
    }
    const apiOrigin = process.env.API_ORIGIN // https://attendify-wnl8.onrender.com
    if (apiOrigin) {
      return [
        {
          source: '/api/:path*',
          destination: `${apiOrigin.replace(/\/$/, '')}/api/:path*`,
        },
      ]
    }
    return []
  },
}
module.exports = nextConfig
