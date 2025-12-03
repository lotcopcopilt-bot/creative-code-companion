import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Store, Package, ShoppingCart, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface SellerData {
  id: string;
  boutique_name: string;
  description: string | null;
  logo_url: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("sellers")
        .select("id, boutique_name, description, logo_url")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setSeller(data);
      }
      setIsLoading(false);
    };

    if (user) {
      fetchSellerData();
    }
  }, [user]);

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!seller) {
    navigate("/create-boutique");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="container max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            {seller.logo_url && (
              <img 
                src={seller.logo_url} 
                alt={seller.boutique_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">Bienvenue, {seller.boutique_name}</h1>
              <p className="text-muted-foreground">Gérez votre boutique et vos produits</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ma Boutique</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{seller.boutique_name}</div>
                <p className="text-xs text-muted-foreground">Boutique active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Produits</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Produits publiés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ventes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Ventes totales</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Gérez votre boutique facilement</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button asChild>
                <Link to="/add-product">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un produit
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/marketplace">
                  <Store className="mr-2 h-4 w-4" />
                  Voir la marketplace
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
