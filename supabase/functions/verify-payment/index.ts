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

// Input validation helpers
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.length <= 255 && emailRegex.test(email);
}

// Safe error handling - never expose internal details
function getSafeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  
  if (message.includes('not found') || message.includes('no rows')) {
    return 'Produit non trouvé';
  }
  if (message.includes('payment') || message.includes('verify')) {
    return 'Échec de la vérification du paiement';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Service temporairement indisponible';
  }
  
  return 'Une erreur est survenue lors du traitement';
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { transactionId, productId, buyerEmail } = body;

    // Input validation
    if (!transactionId || typeof transactionId !== 'string' || transactionId.length > 100) {
      console.error("Invalid transactionId:", transactionId);
      return new Response(
        JSON.stringify({ error: 'ID de transaction invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!productId || !isValidUUID(productId)) {
      console.error("Invalid productId:", productId);
      return new Response(
        JSON.stringify({ error: 'ID de produit invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!buyerEmail || !isValidEmail(buyerEmail)) {
      console.error("Invalid buyerEmail:", buyerEmail);
      return new Response(
        JSON.stringify({ error: 'Adresse email invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Verifying payment:", { transactionId, productId, buyerEmail: buyerEmail.substring(0, 3) + '***' });

    // Verify payment with KKiaPay
    const privateKey = Deno.env.get('KKIAPAY_PRIVATE_KEY');
    
    if (!privateKey) {
      console.error("KKIAPAY_PRIVATE_KEY not configured");
      return new Response(
        JSON.stringify({ error: 'Configuration du service de paiement manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const verifyResponse = await fetch(
      `https://api.kkiapay.me/api/v1/transactions/${encodeURIComponent(transactionId)}`,
      {
        headers: {
          'x-api-key': privateKey,
        },
      }
    );

    if (!verifyResponse.ok) {
      console.error("KKiaPay verification failed:", verifyResponse.status);
      return new Response(
        JSON.stringify({ error: 'Échec de la vérification du paiement' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentData = await verifyResponse.json();
    
    if (paymentData.status !== 'SUCCESS') {
      console.error("Payment not successful:", paymentData.status);
      return new Response(
        JSON.stringify({ error: 'Le paiement n\'a pas été validé' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get product info
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, sellers(boutique_name)')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error("Product not found:", productError);
      return new Response(
        JSON.stringify({ error: 'Produit non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Replay attack prevention - check if transaction already processed
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('transaction_id', transactionId)
      .single();

    if (existingOrder) {
      console.error("Transaction already processed:", transactionId);
      return new Response(
        JSON.stringify({ error: 'Cette transaction a déjà été traitée' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure download token
    const downloadToken = crypto.randomUUID();
    const downloadExpiresAt = new Date();
    downloadExpiresAt.setHours(downloadExpiresAt.getHours() + 24);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_email: buyerEmail,
        product_id: productId,
        amount: paymentData.amount,
        transaction_id: transactionId,
        payment_status: 'completed',
        download_token: downloadToken,
        download_expires_at: downloadExpiresAt.toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      // Handle unique constraint violation for transaction_id
      if (orderError.code === '23505') {
        console.error("Duplicate transaction:", transactionId);
        return new Response(
          JSON.stringify({ error: 'Cette transaction a déjà été traitée' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error("Order creation failed:", orderError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de la commande' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update product sales count
    await supabase.rpc('increment_sales_count', { product_id: productId });

    console.log("Payment verified and order created:", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        downloadToken,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: getSafeErrorMessage(error) }),
      {
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
