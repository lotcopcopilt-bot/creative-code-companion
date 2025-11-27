import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User } from "lucide-react";
import logo from "@/assets/logo.png";

export const Header = () => {
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
          <Link to="/become-seller" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
            Devenir vendeur
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <User className="h-5 w-5" />
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Commencer
          </Button>
        </div>
      </div>
    </header>
  );
};
