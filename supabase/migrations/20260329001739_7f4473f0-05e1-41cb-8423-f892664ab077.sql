-- Create the missing sequence and function that generate_technician_number trigger depends on
CREATE SEQUENCE IF NOT EXISTS public.uf_tec_seq START WITH 101;
CREATE SEQUENCE IF NOT EXISTS public.uf_inv_seq START WITH 101;
CREATE SEQUENCE IF NOT EXISTS public.uf_ct_seq START WITH 101;
CREATE SEQUENCE IF NOT EXISTS public.uf_doc_seq START WITH 101;

CREATE OR REPLACE FUNCTION public.generate_unified_serial(prefix text, seq_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_year TEXT;
  v_seq INT;
BEGIN
  v_year := to_char(NOW(), 'YY');
  EXECUTE 'SELECT nextval(''' || seq_name || ''')' INTO v_seq;
  RETURN 'UF-' || prefix || '-' || v_year || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$function$