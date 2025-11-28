-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sellers table
CREATE TABLE public.sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  boutique_name TEXT NOT NULL,
  boutique_slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  file_url TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seller_id, slug)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_email TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL,
  transaction_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  download_token TEXT UNIQUE,
  download_expires_at TIMESTAMP WITH TIME ZONE,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- Sellers policies (public read, owners can update)
CREATE POLICY "Sellers are viewable by everyone"
  ON public.sellers FOR SELECT
  USING (true);

CREATE POLICY "Sellers can update their own profile"
  ON public.sellers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their seller profile"
  ON public.sellers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Products policies (public read active products)
CREATE POLICY "Active products are viewable by everyone"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Sellers can view their own products"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers
      WHERE sellers.id = products.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can create their own products"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sellers
      WHERE sellers.id = products.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update their own products"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers
      WHERE sellers.id = products.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

-- Orders policies (buyers can view their own orders)
CREATE POLICY "Users can view orders with their email"
  ON public.orders FOR SELECT
  USING (buyer_email = auth.jwt()->>'email' OR buyer_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_orders_buyer_email ON public.orders(buyer_email);
CREATE INDEX idx_orders_download_token ON public.orders(download_token);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('E-books', 'ebooks', 'Livres électroniques et guides'),
  ('Formations', 'formations', 'Cours en ligne et tutoriels'),
  ('Templates', 'templates', 'Modèles et fichiers prêts à l''emploi'),
  ('Design', 'design', 'Ressources graphiques et design');

-- Insert sample seller
INSERT INTO public.sellers (boutique_name, boutique_slug, description) VALUES
  ('E-COMBOX Store', 'ecombox-store', 'Boutique officielle de produits numériques');

-- Insert sample products (using the seller we just created)
INSERT INTO public.products (seller_id, category_id, title, slug, description, price, image_url, file_url, rating, sales_count)
SELECT 
  (SELECT id FROM public.sellers WHERE boutique_slug = 'ecombox-store'),
  (SELECT id FROM public.categories WHERE slug = 'ebooks'),
  'Guide complet du Marketing Digital 2025',
  'guide-marketing-digital-2025',
  'Apprenez toutes les techniques du marketing digital moderne',
  29.99,
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
  'https://example.com/file1.pdf',
  4.8,
  234
UNION ALL
SELECT 
  (SELECT id FROM public.sellers WHERE boutique_slug = 'ecombox-store'),
  (SELECT id FROM public.categories WHERE slug = 'templates'),
  'Template Notion pour Entrepreneurs',
  'template-notion-entrepreneurs',
  'Organisation complète pour votre business',
  19.99,
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500',
  'https://example.com/file2.zip',
  4.9,
  456
UNION ALL
SELECT 
  (SELECT id FROM public.sellers WHERE boutique_slug = 'ecombox-store'),
  (SELECT id FROM public.categories WHERE slug = 'formations'),
  'Formation Photoshop - Niveau Avancé',
  'formation-photoshop-avance',
  'Maîtrisez Photoshop comme un pro',
  49.99,
  'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=500',
  'https://example.com/file3.zip',
  4.7,
  189
UNION ALL
SELECT 
  (SELECT id FROM public.sellers WHERE boutique_slug = 'ecombox-store'),
  (SELECT id FROM public.categories WHERE slug = 'design'),
  'Pack de 50 Templates Instagram',
  'pack-templates-instagram',
  'Templates prêts à l''emploi pour Instagram',
  24.99,
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500',
  'https://example.com/file4.zip',
  4.6,
  567
UNION ALL
SELECT 
  (SELECT id FROM public.sellers WHERE boutique_slug = 'ecombox-store'),
  (SELECT id FROM public.categories WHERE slug = 'formations'),
  'Masterclass Développement Web',
  'masterclass-dev-web',
  'Devenez développeur web professionnel',
  79.99,
  'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500',
  'https://example.com/file5.zip',
  4.9,
  312
UNION ALL
SELECT 
  (SELECT id FROM public.sellers WHERE boutique_slug = 'ecombox-store'),
  (SELECT id FROM public.categories WHERE slug = 'design'),
  'Kit UI/UX Designer Complet',
  'kit-uiux-designer',
  'Tous les outils pour designer des interfaces',
  39.99,
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
  'https://example.com/file6.zip',
  4.8,
  423;