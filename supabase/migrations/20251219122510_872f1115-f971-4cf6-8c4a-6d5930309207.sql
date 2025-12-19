-- Drop existing problematic policies on orders
DROP POLICY IF EXISTS "Users can view orders with their email" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create proper RLS policies for orders table

-- 1. Authenticated users can only view their own orders (by auth.uid() email match)
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (
  buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 2. Sellers can view orders for their products
CREATE POLICY "Sellers can view orders for their products" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.sellers s ON p.seller_id = s.id
    WHERE p.id = orders.product_id 
    AND s.user_id = auth.uid()
  )
);

-- 3. Only service role (edge functions) can insert orders - no direct client inserts
-- Orders are created via verify-payment edge function which uses service role key
CREATE POLICY "Service role can insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (false);

-- 4. Allow service role to update orders (for download tracking)
CREATE POLICY "Service role can update orders" 
ON public.orders 
FOR UPDATE 
USING (false);

-- Enable leaked password protection (auth setting will be done separately)