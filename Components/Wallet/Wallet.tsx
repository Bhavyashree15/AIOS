'use client'

import { useState, useEffect } from 'react'
import { Wallet as WalletIcon, Plus } from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { useWallet } from '@/hooks/useWallet'

export function Wallet() {
  const { balance, isLoading, topUp } = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState(100)

  const handleTopUp = async () => {
    await topUp(amount)
    setIsOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
        <WalletIcon className="h-4 w-4 text-emerald-400" />
        {isLoading ? (
          <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
        ) : (
          <span className="text-sm font-medium text-emerald-400">₹{balance.toFixed(2)}</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="glass hover:bg-white/10 px-3"
      >
        <Plus className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-6 rounded-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Add Credits</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[100, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      amount === amt
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-muted-foreground border border-white/10'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white"
                placeholder="Custom amount"
              />
              <button
                onClick={handleTopUp}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-lg font-semibold"
              >
                Add Credits
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-muted-foreground text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
