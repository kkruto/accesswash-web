/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Images configuration for external domains
  images: {
    domains: [
      'demo.accesswash.org',
      'api.accesswash.org',
      'localhost',
    ],
  },
  
  // Redirects for better UX
  async redirects() {
    return [
      // Redirect root to demo tenant for development
      {
        source: '/',
        destination: '/demo',
        permanent: false,
      },
    ]
  },
  
  // Custom headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig