import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Store, Package, ShoppingCart, Plus, Loader2, LogOut, Settings, LayoutDashboard } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      } else {
        navigate("/create-boutique");
      }
      setIsLoading(false);
    };

    if (user) {
      fetchSellerData();
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-dark/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105">
              <img src={logo} alt="E-combox" className="h-10 w-10" />
              <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                E-combox
              </span>
            </Link>
            <span className="hidden md:block text-muted-foreground">|</span>
            <span className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-foreground hover:bg-muted/50">
                  {seller.logo_url ? (
                    <img 
                      src={seller.logo_url} 
                      alt={seller.boutique_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <Store className="h-5 w-5" />
                  )}
                  <span className="hidden md:block">{seller.boutique_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="py-8 px-4">
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
              <h1 className="text-3xl font-bold text-foreground">Bienvenue, {seller.boutique_name}</h1>
              <p className="text-muted-foreground">Gérez votre boutique et vos produits</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ma Boutique</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{seller.boutique_name}</div>
                <p className="text-xs text-muted-foreground">Boutique active</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Produits</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Produits publiés</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
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

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Gérez votre boutique facilement</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
              <Button variant="outline">
                <Store className="mr-2 h-4 w-4" />
                Voir ma boutique
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;