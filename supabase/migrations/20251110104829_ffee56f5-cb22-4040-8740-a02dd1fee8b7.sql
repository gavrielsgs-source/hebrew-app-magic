-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted columns for sensitive data
-- We'll use pgp_sym_encrypt for symmetric encryption

-- Encrypt facebook_tokens.access_token
-- First, add a new encrypted column
ALTER TABLE public.facebook_tokens 
ADD COLUMN IF NOT EXISTS access_token_encrypted BYTEA;

-- Encrypt existing tokens (if any)
UPDATE public.facebook_tokens 
SET access_token_encrypted = pgp_sym_encrypt(access_token, current_setting('app.encryption_key', true))
WHERE access_token IS NOT NULL AND access_token_encrypted IS NULL;

-- Encrypt subscriptions.payment_token
-- First, add a new encrypted column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_token_encrypted BYTEA;

-- Encrypt existing tokens (if any)
UPDATE public.subscriptions 
SET payment_token_encrypted = pgp_sym_encrypt(payment_token, current_setting('app.encryption_key', true))
WHERE payment_token IS NOT NULL AND payment_token_encrypted IS NULL;

-- Create helper functions for encryption/decryption
CREATE OR REPLACE FUNCTION public.encrypt_token(token TEXT)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN pgp_sym_encrypt(token, current_setting('app.encryption_key', true));
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token BYTEA)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_token, current_setting('app.encryption_key', true));
END;
$$;

-- Add comments for documentation
COMMENT ON COLUMN public.facebook_tokens.access_token_encrypted IS 'Encrypted Facebook access token using pgcrypto';
COMMENT ON COLUMN public.subscriptions.payment_token_encrypted IS 'Encrypted payment token using pgcrypto';
COMMENT ON FUNCTION public.encrypt_token IS 'Helper function to encrypt tokens';
COMMENT ON FUNCTION public.decrypt_token IS 'Helper function to decrypt tokens';
