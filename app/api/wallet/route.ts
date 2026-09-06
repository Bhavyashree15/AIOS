import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server configuration is missing')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function getAccessToken(req: NextRequest) {
  const authorization = req.headers.get('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice(7).trim()
}

export async function GET(req: NextRequest) {
  try {
    const token = getAccessToken(req)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = getSupabaseAdmin()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance, currency, created_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (walletError) {
      console.error('Wallet lookup failed:', walletError)

      return NextResponse.json(
        { error: 'Failed to load wallet' },
        { status: 500 }
      )
    }

    if (!wallet) {
      return NextResponse.json({
        balance: 0,
        currency: 'AIOS',
        transactions: [],
      })
    }

    const { data: transactions, error: transactionError } =
      await supabase
        .from('wallet_transactions')
        .select(
          `
            id,
            type,
            amount,
            balance_after,
            description,
            metadata,
            created_at
          `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    if (transactionError) {
      console.error(
        'Transaction lookup failed:',
        transactionError
      )

      return NextResponse.json(
        { error: 'Failed to load transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      balance: Number(wallet.balance),
      currency: wallet.currency,
      transactions: transactions ?? [],
    })
  } catch (error) {
    console.error('Wallet GET error:', error)

    return NextResponse.json(
      { error: 'Failed to load wallet' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAccessToken(req)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = getSupabaseAdmin()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const body = await req.json()

    const {
      type,
      amount,
      description,
      idempotencyKey,
      metadata,
    } = body

    /*
     * Public wallet API only allows AI usage charges.
     *
     * Users cannot directly create:
     * - credit_topup
     * - credit_bonus
     * - refund
     * - adjustment
     *
     * Those operations will be handled by trusted
     * server-side systems later.
     */

    if (type !== 'ai_usage') {
      return NextResponse.json(
        {
          error:
            'This transaction type is not available through the public wallet API',
        },
        { status: 403 }
      )
    }

    if (
      typeof amount !== 'number' ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: 'Invalid transaction amount' },
        { status: 400 }
      )
    }

    if (
      idempotencyKey !== undefined &&
      idempotencyKey !== null &&
      typeof idempotencyKey !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid idempotency key' },
        { status: 400 }
      )
    }

    const signedAmount = -Math.abs(amount)

    const { data, error } = await supabase.rpc(
      'apply_wallet_transaction',
      {
        p_user_id: user.id,
        p_type: 'ai_usage',
        p_amount: signedAmount,
        p_description:
          typeof description === 'string'
            ? description.slice(0, 500)
            : null,
        p_idempotency_key:
          typeof idempotencyKey === 'string'
            ? idempotencyKey
            : null,
        p_metadata:
          metadata &&
          typeof metadata === 'object' &&
          !Array.isArray(metadata)
            ? metadata
            : {},
      }
    )

    if (error) {
      if (
        error.message.includes('INSUFFICIENT_BALANCE')
      ) {
        return NextResponse.json(
          {
            error: 'Insufficient AIOS wallet balance',
            code: 'INSUFFICIENT_BALANCE',
          },
          { status: 402 }
        )
      }

      console.error(
        'Wallet transaction failed:',
        error
      )

      return NextResponse.json(
        {
          error: 'Failed to process wallet transaction',
        },
        { status: 500 }
      )
    }

    const result = Array.isArray(data)
      ? data[0]
      : data

    return NextResponse.json({
      success: true,
      transactionId: result?.transaction_id,
      walletId: result?.wallet_id,
      balance: Number(
        result?.new_balance ?? 0
      ),
    })
  } catch (error) {
    console.error('Wallet POST error:', error)

    return NextResponse.json(
      {
        error: 'Failed to process wallet transaction',
      },
      { status: 500 }
    )
  }
}
