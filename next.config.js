const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {  
  basePath: '/project9',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    GROG_API_KEY: process.env.GROG_API_KEY,
  },
  assetPrefix: '/project9/',
  publicRuntimeConfig: {
    basePath: '/project9',
    neoApiEndpoint: '/project9/api/neo'
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  compiler: {
    styledComponents: true,
  },
  distDir: '.next',
  async rewrites() {
    return [
      {
        source: '/project9/api/:path*',
        destination: 'http://localhost:8000/:path*',
      }
    ]
  }
}

module.exports = nextConfig
