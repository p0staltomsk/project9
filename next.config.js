const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GROG_API_KEY: process.env.GROG_API_KEY,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/project9' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/project9' : '',
  publicRuntimeConfig: {
    basePath: process.env.NODE_ENV === 'production' ? '/project9' : '',
    neoApiEndpoint: process.env.NEO_API_ENDPOINT || '/api/neo'
  },
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig
