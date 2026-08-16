import { NextRequest, NextResponse } from 'next/server'

let walletBalance = 100.00
let transactions: { id: string, amount: number, type: string, description: string, date: string }[] = []

export async function GET() {
  return NextResponse.json({
    balance: walletBalance,
    transactions: transactions.slice(0, 20),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { amount, type, description } = await req.json()
    
    if (type === 'credit_topup') {
      walletBalance += amount
      transactions.unshift({
        id: Date.now().toString(),
        amount,
        type: 'credit_topup',
        description: description || 'Wallet top-up',
        date: new Date().toISOString(),
      })
      return NextResponse.json({ success: true, balance: walletBalance })
    }
    
    return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 })
  }
}
