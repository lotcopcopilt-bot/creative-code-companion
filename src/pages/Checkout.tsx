import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    kkiapay: {
      open: (config: {
        amount: number;
        position: string;
        callback: string;
        data: string;
        theme: string;
        key: string;
      }) => void;
    };
    successCallback: (response: { transactionId: string }) => void;
  }
}

const Checkout = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: product, isLoading } = useProduct("");
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load KKiaPay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.kkiapay.me/k.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Setup callback
  useEffect(() => {
    window.successCallback = async (response: { transactionId: string }) => {
      try {
        setIsProcessing(true);
        
        // Verify payment and create order
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: {
            transactionId: response.transactionId,
            productId,
            buyerEmail: email,
          },
        });

        if (error) throw error;

        toast({
          title: "Paiement réussi !",
          description: "Vous allez recevoir un email avec le lien de téléchargement.",
        });

        navigate("/success");
      } catch (error) {
        console.error("Payment verification error:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification du paiement.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };
  }, [email, productId, navigate, toast]);

  const handlePayment = async () => {
    if (!email) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer votre adresse email.",
        variant: "destructive",
      });
      return;
    }

    if (!product) return;

    try {
      // Get public key from environment
      const { data: keyData } = await supabase.functions.invoke("get-kkiapay-key");
      
      if (!window.kkiapay) {
        toast({
          title: "Erreur",
          description: "Le système de paiement n'est pas encore chargé. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      window.kkiapay.open({
        amount: product.price,
        position: "center",
        callback: "successCallback",
        data: JSON.stringify({ productId, email }),
        theme: "#f97316",
        key: keyData.publicKey,
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du lancement du paiement.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg">Chargement...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
            <Button onClick={() => navigate("/marketplace")}>
              Retour au marketplace
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Finaliser votre achat</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Informations de paiement */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Vous recevrez le lien de téléchargement à cette adresse
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing || !email}
                >
                  {isProcessing ? "Traitement..." : "Payer maintenant"}
                </Button>
              </CardContent>
            </Card>

            {/* Résumé de la commande */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={product.image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200"}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      par {product.sellers?.boutique_name}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Prix</span>
                    <span className="font-medium">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">${product.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg text-sm">
                  <p className="font-medium mb-2">Ce qui est inclus :</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>✓ Téléchargement instantané</li>
                    <li>✓ Accès à vie</li>
                    <li>✓ Mises à jour gratuites</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
