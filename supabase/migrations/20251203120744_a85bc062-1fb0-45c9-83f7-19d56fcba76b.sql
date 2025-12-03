-- Create storage bucket for boutique logos
INSERT INTO storage.buckets (id, name, public) VALUES ('boutique-logos', 'boutique-logos', true);

-- Create policy for logo uploads
CREATE POLICY "Users can upload their own logo"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'boutique-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for public access to logos
CREATE POLICY "Logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'boutique-logos');

-- Create policy for users to update their logo
CREATE POLICY "Users can update their own logo"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'boutique-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to delete their logo
CREATE POLICY "Users can delete their own logo"
ON storage.objects
FOR DELETE
USING (bucket_id = 'boutique-logos' AND auth.uid()::text = (storage.foldername(name))[1]);