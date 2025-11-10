-- Fix the encrypt_token and decrypt_token functions to have proper search_path
-- This addresses security linter warnings about mutable search paths

DROP FUNCTION IF EXISTS public.encrypt_token(TEXT);
DROP FUNCTION IF EXISTS public.decrypt_token(BYTEA);

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.encrypt_token(token TEXT)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN pgp_sym_encrypt(token, current_setting('app.encryption_key', true));
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token BYTEA)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_token, current_setting('app.encryption_key', true));
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION public.encrypt_token IS 'Helper function to encrypt tokens - search_path secured';
COMMENT ON FUNCTION public.decrypt_token IS 'Helper function to decrypt tokens - search_path secured';
