import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const DashboardCarts = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Paniers abandonnés</h1>
          <p className="text-muted-foreground">
            Récupérez les ventes perdues
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paniers abandonnés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valeur totale perdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 FCFA</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux de récupération
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Aucun panier abandonné</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Les paniers abandonnés apparaîtront ici lorsque des clients ajouteront
                des produits sans finaliser leur achat.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCarts;
