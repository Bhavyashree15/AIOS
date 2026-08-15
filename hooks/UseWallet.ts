import { useState, useEffect } from 'react'

export function useWallet() {
  const [balance, setBalance] = useState(100)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('aios_wallet')
    if (saved) {
      setBalance(parseFloat(saved))
    }
    setIsLoading(false)
  }, [])

  const topUp = async (amount: number) => {
    const newBalance = balance + amount
    setBalance(newBalance)
    localStorage.setItem('aios_wallet', String(newBalance))
    return newBalance
  }

  return { balance, isLoading, topUp }
}
