import { useState, useCallback } from 'react'

interface UseLoadingOptions {
  initialLoading?: boolean
  delay?: number
}

export const useLoading = (options: UseLoadingOptions = {}) => {
  const { initialLoading = false, delay = 0 } = options
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [loadingText, setLoadingText] = useState<string>("Loading...")

  const startLoading = useCallback((text?: string) => {
    if (text) {
      setLoadingText(text)
    }
    
    if (delay > 0) {
      setTimeout(() => setIsLoading(true), delay)
    } else {
      setIsLoading(true)
    }
  }, [delay])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setLoadingText("Loading...")
  }, [])

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    text?: string
  ): Promise<T> => {
    try {
      startLoading(text)
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading,
    setLoadingText
  }
} 