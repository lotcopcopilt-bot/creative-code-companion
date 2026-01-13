import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Sparkles, ArrowRight } from "lucide-react";

const CreateBoutiqueCTA = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full bg-card border-border">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Créez votre boutique</CardTitle>
          <CardDescription className="text-base">
            Lancez votre business en quelques minutes et commencez à vendre vos produits digitaux.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Produits illimités</p>
                <p className="text-sm text-muted-foreground">
                  Vendez autant de produits digitaux que vous voulez
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Paiements Mobile Money</p>
                <p className="text-sm text-muted-foreground">
                  Acceptez les paiements locaux facilement
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Tableau de bord intelligent</p>
                <p className="text-sm text-muted-foreground">
                  Suivez vos ventes et performances en temps réel
                </p>
              </div>
            </div>
          </div>

          <Button asChild className="w-full" size="lg">
            <Link to="/create-boutique">
              Créer ma boutique
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateBoutiqueCTA;
