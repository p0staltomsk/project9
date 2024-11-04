import { useState, useEffect } from 'react'

export function useClientOnly<T>(value: T): T | null {
  const [clientValue, setClientValue] = useState<T | null>(null)
  
  useEffect(() => {
    setClientValue(value)
  }, [value])
  
  return clientValue
} 