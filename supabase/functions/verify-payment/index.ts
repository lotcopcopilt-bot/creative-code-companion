import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactionId, productId, buyerEmail } = await req.json();

    console.log("Verifying payment:", { transactionId, productId, buyerEmail });

    // Verify payment with KKiaPay
    const privateKey = Deno.env.get('KKIAPAY_PRIVATE_KEY');
    
    const verifyResponse = await fetch(
      `https://api.kkiapay.me/api/v1/transactions/${transactionId}`,
      {
        headers: {
          'x-api-key': privateKey || '',
        },
      }
    );

    if (!verifyResponse.ok) {
      throw new Error('Failed to verify payment');
    }

    const paymentData = await verifyResponse.json();
    
    if (paymentData.status !== 'SUCCESS') {
      throw new Error('Payment not successful');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get product info
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, sellers(boutique_name)')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    // Generate download token
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

    if (orderError) throw orderError;

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
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
