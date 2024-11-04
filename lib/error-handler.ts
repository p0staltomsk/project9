export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error('Application error:', error.message)
    return error.message
  }
  console.error('Unknown error:', error)
  return 'An unknown error occurred'
} 