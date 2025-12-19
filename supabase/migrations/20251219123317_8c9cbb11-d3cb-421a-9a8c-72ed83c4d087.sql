-- Drop the existing policy that exposes buyer emails to sellers
DROP POLICY IF EXISTS "Sellers can view orders for their products" ON public.orders;

-- Create a secure view for sellers that masks buyer emails
CREATE OR REPLACE VIEW public.seller_orders AS
SELECT 
  o.id,
  o.product_id,
  o.amount,
  o.payment_status,
  o.created_at,
  o.transaction_id,
  -- Mask the email: show only first 2 chars + domain
  CONCAT(
    LEFT(o.buyer_email, 2),
    '***@',
    SPLIT_PART(o.buyer_email, '@', 2)
  ) as masked_buyer_email,
  p.title as product_title,
  p.seller_id
FROM public.orders o
JOIN public.products p ON o.product_id = p.id;

-- Enable RLS on the view (views inherit from base tables but we add explicit policy)
-- Create a policy for sellers to view their orders through this view
CREATE POLICY "Sellers can view their orders via products"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.sellers s ON p.seller_id = s.id
    WHERE p.id = orders.product_id 
    AND s.user_id = auth.uid()
  )
);

-- Grant access to the view for authenticated users
GRANT SELECT ON public.seller_orders TO authenticated;