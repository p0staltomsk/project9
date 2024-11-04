export const getApiUrl = (path: string): string => {
  const isProduction = process.env.NODE_ENV === 'production'
  const basePath = isProduction ? '/project9' : ''
  return `${basePath}${path}`
}
