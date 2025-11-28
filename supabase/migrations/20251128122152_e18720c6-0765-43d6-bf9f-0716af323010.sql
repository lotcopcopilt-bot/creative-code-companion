-- Create function to increment sales count
CREATE OR REPLACE FUNCTION public.increment_sales_count(product_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.products 
  SET sales_count = sales_count + 1 
  WHERE id = product_id;
$$;