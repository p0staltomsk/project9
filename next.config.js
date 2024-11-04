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
    basePath: process.env.BASE_PATH || '',
    neoApiEndpoint: process.env.NEO_API_ENDPOINT || 'https://api.neo.network'
  },
  // Добавляем конфигурацию для статических файлов
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, '.')
    return config
  }
}

module.exports = nextConfig
