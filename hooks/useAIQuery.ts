import { useState } from 'react'

interface QueryParams {
  prompt: string
  mode: 'consensus' | 'autopilot'
  models: string[]
}

export function useAIQuery() {
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const query = async (params: QueryParams) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/ai/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to get response')
      }
      
      const data = await res.json()
      setResponse(data)
    } catch (err: any) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return { query, response, isLoading, error }
}
