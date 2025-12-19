import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://lovable.dev',
  'https://id-preview--hpifmzuwlgmekbgtsqip.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace('id-preview--', '')))
    ? origin 
    : ALLOWED_ORIGINS[0];
    
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { downloadToken } = body;

    // Validate download token
    if (!downloadToken || typeof downloadToken !== 'string' || downloadToken.length > 100) {
      console.error("Invalid download token");
      return new Response(
        JSON.stringify({ error: 'Token de téléchargement invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify download token and check expiry
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('product_id, download_expires_at, downloaded_at, payment_status')
      .eq('download_token', downloadToken)
      .eq('payment_status', 'completed')
      .single();

    if (orderError || !order) {
      console.error("Invalid or expired download link:", orderError);
      return new Response(
        JSON.stringify({ error: 'Lien de téléchargement invalide ou expiré' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiry (24 hours)
    if (new Date(order.download_expires_at) < new Date()) {
      console.error("Download link has expired");
      return new Response(
        JSON.stringify({ error: 'Le lien de téléchargement a expiré' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get product file URL
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('file_url, title')
      .eq('id', order.product_id)
      .single();

    if (productError || !product) {
      console.error("Product not found:", productError);
      return new Response(
        JSON.stringify({ error: 'Produit non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update downloaded_at timestamp
    await supabase
      .from('orders')
      .update({ downloaded_at: new Date().toISOString() })
      .eq('download_token', downloadToken);

    console.log("Download validated for product:", product.title);

    // Check if file is in Storage (product-files bucket) or external URL
    let downloadUrl = product.file_url;
    
    // If file_url is a Storage path (starts with product-files/ or contains storage path pattern)
    if (product.file_url && !product.file_url.startsWith('http')) {
      // Generate signed URL for Storage file (expires in 5 minutes)
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from('product-files')
        .createSignedUrl(product.file_url, 300); // 5 minutes expiry

      if (signedError) {
        console.error("Error creating signed URL:", signedError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la génération du lien de téléchargement' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      downloadUrl = signedData.signedUrl;
    } else if (product.file_url && product.file_url.includes('/storage/v1/object/')) {
      // Extract path from Storage URL and create signed URL
      const pathMatch = product.file_url.match(/\/storage\/v1\/object\/(?:public|sign)\/product-files\/(.+)/);
      if (pathMatch) {
        const filePath = pathMatch[1];
        const { data: signedData, error: signedError } = await supabase
          .storage
          .from('product-files')
          .createSignedUrl(filePath, 300);

        if (!signedError && signedData) {
          downloadUrl = signedData.signedUrl;
        }
      }
    }

    // Return the signed URL
    return new Response(
      JSON.stringify({ 
        downloadUrl: downloadUrl,
        productTitle: product.title
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing download:", error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue lors du traitement' }),
      {
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});