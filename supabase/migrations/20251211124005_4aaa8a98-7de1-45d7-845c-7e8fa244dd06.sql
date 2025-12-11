-- Fix function search_path security issue
CREATE OR REPLACE FUNCTION public.generate_member_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_no IS NULL OR NEW.member_no = '' THEN
    NEW.member_no := 'M' || LPAD(nextval('public.member_no_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;