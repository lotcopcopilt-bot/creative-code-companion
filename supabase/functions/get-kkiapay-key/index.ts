import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const publicKey = Deno.env.get('KKIAPAY_PUBLIC_KEY');
    
    if (!publicKey) {
      console.error("KKIAPAY_PUBLIC_KEY not configured");
      return new Response(
        JSON.stringify({ error: 'Configuration du service de paiement manquante' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    return new Response(
      JSON.stringify({ publicKey }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error getting KKiaPay key:", error);
    return new Response(
      JSON.stringify({ error: 'Service temporairement indisponible' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
