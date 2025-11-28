import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Paiement réussi !</h1>
                <p className="text-muted-foreground">
                  Votre achat a été effectué avec succès.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg text-left">
                <h3 className="font-semibold mb-2">Prochaines étapes :</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Un email de confirmation a été envoyé</li>
                  <li>✓ Vous trouverez le lien de téléchargement dans votre email</li>
                  <li>✓ Le lien est valable pendant 24 heures</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/marketplace")}>
                  Continuer mes achats
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Retour à l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Success;
