-- 1. Create a private storage bucket for product files
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-files', 'product-files', false)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS policies for product-files bucket
-- Only authenticated buyers with valid orders can download
CREATE POLICY "Buyers can download purchased products"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-files' AND
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.payment_status = 'completed'
    AND o.buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND o.download_expires_at > now()
    AND (storage.foldername(name))[1] = o.product_id::text
  )
);

-- Sellers can upload to their own product folders
CREATE POLICY "Sellers can upload product files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-files' AND
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.sellers s ON p.seller_id = s.id
    WHERE s.user_id = auth.uid()
    AND (storage.foldername(name))[1] = p.id::text
  )
);

-- Sellers can update their own product files
CREATE POLICY "Sellers can update product files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-files' AND
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.sellers s ON p.seller_id = s.id
    WHERE s.user_id = auth.uid()
    AND (storage.foldername(name))[1] = p.id::text
  )
);

-- Sellers can delete their own product files
CREATE POLICY "Sellers can delete product files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-files' AND
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.sellers s ON p.seller_id = s.id
    WHERE s.user_id = auth.uid()
    AND (storage.foldername(name))[1] = p.id::text
  )
);

-- 3. Drop and recreate seller view to exclude sensitive data
DROP VIEW IF EXISTS public.seller_orders;

CREATE VIEW public.seller_orders 
WITH (security_invoker = true)
AS
SELECT 
  o.id,
  o.product_id,
  o.amount,
  o.payment_status,
  o.created_at,
  -- Mask the email
  CONCAT(LEFT(o.buyer_email, 2), '***@', SPLIT_PART(o.buyer_email, '@', 2)) as masked_buyer_email,
  p.title as product_title,
  p.seller_id
  -- Explicitly exclude: download_token, download_expires_at, downloaded_at, transaction_id
FROM public.orders o
JOIN public.products p ON o.product_id = p.id;

GRANT SELECT ON public.seller_orders TO authenticated;

-- 4. Update orders RLS - remove policy that exposes all fields to sellers
DROP POLICY IF EXISTS "Sellers can view their orders via products" ON public.orders;

-- Sellers should use the seller_orders view instead (which masks emails and excludes tokens)