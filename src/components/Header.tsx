import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-dark backdrop-blur supports-[backdrop-filter]:bg-gradient-dark/95">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <img src={logo} alt="E-combox" className="h-10 w-10" />
          <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
            E-combox
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
            Accueil
          </Link>
          <Link to="/marketplace" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
            Marketplace
          </Link>
          <Link to="/create-boutique" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
            Devenir vendeur
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/create-boutique">Ma boutique</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          {user ? (
            <Link to="/create-boutique">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Ma boutique
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Commencer
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
