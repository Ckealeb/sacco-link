-- Create enum for account types
CREATE TYPE public.account_type AS ENUM ('shares', 'savings', 'fixed_deposit', 'loan', 'mm', 'development_fund');

-- Create enum for transaction direction
CREATE TYPE public.transaction_direction AS ENUM ('debit', 'credit');

-- Create accounts table
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  account_type account_type NOT NULL,
  account_no TEXT NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  opened_date DATE NOT NULL DEFAULT CURRENT_DATE,
  closed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  txn_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  direction transaction_direction NOT NULL,
  narration TEXT,
  reference_no TEXT,
  balance_after NUMERIC NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "Authenticated users can view accounts"
ON public.accounts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert accounts"
ON public.accounts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts"
ON public.accounts FOR UPDATE
USING (true);

-- RLS Policies for transactions
CREATE POLICY "Authenticated users can view transactions"
ON public.transactions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert transactions"
ON public.transactions FOR INSERT
WITH CHECK (true);

-- Sequence for account numbers
CREATE SEQUENCE public.account_no_seq START WITH 1;

-- Function to generate account number
CREATE OR REPLACE FUNCTION public.generate_account_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.account_no IS NULL OR NEW.account_no = '' THEN
    NEW.account_no := UPPER(SUBSTRING(NEW.account_type::text, 1, 3)) || '-' || LPAD(nextval('public.account_no_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for auto-generating account number
CREATE TRIGGER generate_account_no_trigger
BEFORE INSERT ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.generate_account_no();

-- Trigger for updating updated_at on accounts
CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_accounts_member_id ON public.accounts(member_id);
CREATE INDEX idx_accounts_account_type ON public.accounts(account_type);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_member_id ON public.transactions(member_id);
CREATE INDEX idx_transactions_txn_date ON public.transactions(txn_date);