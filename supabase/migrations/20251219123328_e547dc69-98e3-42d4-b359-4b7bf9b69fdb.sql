-- Drop and recreate the view with SECURITY INVOKER (default, but explicit for clarity)
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
  o.transaction_id,
  CONCAT(
    LEFT(o.buyer_email, 2),
    '***@',
    SPLIT_PART(o.buyer_email, '@', 2)
  ) as masked_buyer_email,
  p.title as product_title,
  p.seller_id
FROM public.orders o
JOIN public.products p ON o.product_id = p.id;

-- Re-grant access
GRANT SELECT ON public.seller_orders TO authenticated;