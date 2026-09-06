-- ============================================
-- AIOS WALLET LEDGER
-- Migration: 001_wallet_ledger.sql
-- ============================================

-- Required for UUID generation
create extension if not exists pgcrypto;


-- ============================================
-- WALLETS
-- One wallet per authenticated user
-- ============================================

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique
    references auth.users(id)
    on delete cascade,

  balance numeric(20, 8) not null default 0
    check (balance >= 0),

  currency text not null default 'AIOS',

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================
-- WALLET TRANSACTIONS
-- Immutable financial ledger
-- ============================================

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),

  wallet_id uuid not null
    references public.wallets(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  type text not null
    check (
      type in (
        'credit_topup',
        'credit_bonus',
        'ai_usage',
        'refund',
        'adjustment'
      )
    ),

  amount numeric(20, 8) not null
    check (amount <> 0),

  balance_after numeric(20, 8) not null
    check (balance_after >= 0),

  description text,

  idempotency_key text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint wallet_transactions_idempotency_unique
    unique (user_id, idempotency_key)
);


-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_wallet_transactions_user
  on public.wallet_transactions(user_id);

create index if not exists idx_wallet_transactions_wallet
  on public.wallet_transactions(wallet_id);

create index if not exists idx_wallet_transactions_created
  on public.wallet_transactions(created_at desc);


-- ============================================
-- AUTOMATIC updated_at
-- ============================================

create or replace function public.set_wallet_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


drop trigger if exists wallet_updated_at
on public.wallets;


create trigger wallet_updated_at
before update on public.wallets
for each row
execute function public.set_wallet_updated_at();


-- ============================================
-- CREATE WALLET WHEN USER SIGNS UP
-- ============================================

create or replace function public.create_wallet_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.wallets (user_id)
  values (new.id)

  on conflict (user_id)
  do nothing;

  return new;

end;
$$;


drop trigger if exists create_wallet_after_signup
on auth.users;


create trigger create_wallet_after_signup
after insert on auth.users
for each row
execute function public.create_wallet_for_user();


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.wallets
enable row level security;

alter table public.wallet_transactions
enable row level security;


-- ============================================
-- WALLET READ POLICY
-- Users can see ONLY their own wallet
-- ============================================

drop policy if exists "Users can view own wallet"
on public.wallets;


create policy "Users can view own wallet"
on public.wallets
for select
to authenticated
using (
  auth.uid() = user_id
);


-- ============================================
-- TRANSACTION READ POLICY
-- Users can see ONLY their own transactions
-- ============================================

drop policy if exists "Users can view own transactions"
on public.wallet_transactions;


create policy "Users can view own transactions"
on public.wallet_transactions
for select
to authenticated
using (
  auth.uid() = user_id
);


-- ============================================
-- IMPORTANT SECURITY RULE
--
-- There are intentionally NO direct
-- INSERT / UPDATE / DELETE policies.
--
-- Wallet mutations happen through the
-- controlled server-side function below.
-- ============================================


-- ============================================
-- ATOMIC WALLET TRANSACTION
-- ============================================

create or replace function public.apply_wallet_transaction(
  p_user_id uuid,
  p_type text,
  p_amount numeric,
  p_description text default null,
  p_idempotency_key text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  transaction_id uuid,
  wallet_id uuid,
  new_balance numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare

  v_wallet public.wallets%rowtype;

  v_transaction public.wallet_transactions%rowtype;

begin

  -- ==========================================
  -- Validate amount
  -- ==========================================

  if p_amount = 0 then
    raise exception 'Transaction amount cannot be zero';
  end if;


  -- ==========================================
  -- Idempotency
  --
  -- Prevents the same transaction from
  -- being processed twice.
  -- ==========================================

  if p_idempotency_key is not null then

    select *
    into v_transaction

    from public.wallet_transactions

    where user_id = p_user_id
      and idempotency_key = p_idempotency_key;

    if found then

      return query

      select
        v_transaction.id,
        v_transaction.wallet_id,
        v_transaction.balance_after;

      return;

    end if;

  end if;


  -- ==========================================
  -- Lock wallet row
  --
  -- Prevents race conditions when multiple
  -- requests modify the same wallet.
  -- ==========================================

  select *
  into v_wallet

  from public.wallets

  where user_id = p_user_id

  for update;


  -- ==========================================
  -- Create wallet if it doesn't exist
  -- ==========================================

  if not found then

    insert into public.wallets (
      user_id
    )

    values (
      p_user_id
    )

    returning *
    into v_wallet;

  end if;


  -- ==========================================
  -- Prevent negative balance
  -- ==========================================

  if v_wallet.balance + p_amount < 0 then

    raise exception 'INSUFFICIENT_BALANCE';

  end if;


  -- ==========================================
  -- Update wallet balance
  -- ==========================================

  update public.wallets

  set balance = balance + p_amount

  where id = v_wallet.id

  returning *
  into v_wallet;


  -- ==========================================
  -- Write ledger entry
  -- ==========================================

  insert into public.wallet_transactions (
    wallet_id,
    user_id,
    type,
    amount,
    balance_after,
    description,
    idempotency_key,
    metadata
  )

  values (
    v_wallet.id,
    p_user_id,
    p_type,
    p_amount,
    v_wallet.balance,
    p_description,
    p_idempotency_key,
    coalesce(p_metadata, '{}'::jsonb)
  )

  returning *
  into v_transaction;


  -- ==========================================
  -- Return result
  -- ==========================================

  return query

  select
    v_transaction.id,
    v_transaction.wallet_id,
    v_transaction.balance_after;

end;
$$;


-- ============================================
-- FUNCTION SECURITY
--
-- Only server-side service_role can execute
-- the wallet mutation function.
-- ============================================

revoke all
on function public.apply_wallet_transaction(
  uuid,
  text,
  numeric,
  text,
  text,
  jsonb
)
from public;


revoke all
on function public.apply_wallet_transaction(
  uuid,
  text,
  numeric,
  text,
  text,
  jsonb
)
from anon;


revoke all
on function public.apply_wallet_transaction(
  uuid,
  text,
  numeric,
  text,
  text,
  jsonb
)
from authenticated;


grant execute
on function public.apply_wallet_transaction(
  uuid,
  text,
  numeric,
  text,
  text,
  jsonb
)
to service_role;
