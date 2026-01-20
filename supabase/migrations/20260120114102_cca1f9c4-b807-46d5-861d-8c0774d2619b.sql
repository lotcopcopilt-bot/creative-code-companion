-- Fix 1: Revoke public execute permissions on increment_sales_count function
REVOKE EXECUTE ON FUNCTION public.increment_sales_count(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_sales_count(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_sales_count(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_sales_count(UUID) TO service_role;

-- Fix 2: Enable RLS on seller_orders view and add policies
-- Note: seller_orders is a VIEW, so we need to recreate it with security_invoker
DROP VIEW IF EXISTS public.seller_orders;

CREATE VIEW public.seller_orders
WITH (security_invoker = on) AS
SELECT 
    o.id,
    o.created_at,
    o.payment_status,
    o.amount,
    o.product_id,
    p.title AS product_title,
    p.seller_id,
    CONCAT(LEFT(o.buyer_email, 3), '***@', SPLIT_PART(o.buyer_email, '@', 2)) AS masked_buyer_email
FROM orders o
JOIN products p ON o.product_id = p.id
WHERE o.payment_status = 'completed';

-- Grant access to the view
GRANT SELECT ON public.seller_orders TO authenticated;

-- Fix 3: Add unique constraint on transaction_id for replay attack prevention
ALTER TABLE public.orders ADD CONSTRAINT orders_transaction_id_unique UNIQUE (transaction_id);