-- Create member status enum
CREATE TYPE public.member_status AS ENUM ('active', 'inactive', 'suspended');

-- Create members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_no TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  shares_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  savings_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  loan_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status member_status NOT NULL DEFAULT 'active',
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create sequence for member numbers
CREATE SEQUENCE public.member_no_seq START 1;

-- Function to generate member number
CREATE OR REPLACE FUNCTION public.generate_member_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_no IS NULL OR NEW.member_no = '' THEN
    NEW.member_no := 'M' || LPAD(nextval('public.member_no_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate member number
CREATE TRIGGER set_member_no
  BEFORE INSERT ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_member_no();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- RLS policies for authenticated users (staff can view/manage members)
CREATE POLICY "Authenticated users can view members"
  ON public.members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert members"
  ON public.members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update members"
  ON public.members
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index for common queries
CREATE INDEX idx_members_member_no ON public.members(member_no);
CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_members_name ON public.members(first_name, last_name);