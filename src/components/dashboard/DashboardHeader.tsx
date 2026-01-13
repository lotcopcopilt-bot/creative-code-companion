import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Store, LogOut, Settings, ExternalLink, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import DashboardMobileNav from "./DashboardMobileNav";

interface DashboardHeaderProps {
  boutiqueName?: string;
  boutiqueSlug?: string;
  logoUrl?: string | null;
  userEmail?: string;
  onLogout: () => void;
}

const DashboardHeader = ({
  boutiqueName,
  boutiqueSlug,
  logoUrl,
  userEmail,
  onLogout,
}: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 lg:px-6">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden mr-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <DashboardMobileNav boutiqueName={boutiqueName} logoUrl={logoUrl} />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Visit Boutique */}
        {boutiqueSlug && (
          <Button variant="default" size="sm" asChild className="hidden sm:flex">
            <Link to={`/marketplace`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visiter la boutique
            </Link>
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={boutiqueName || "Boutique"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Store className="h-4 w-4 text-primary" />
                </div>
              )}
              <span className="hidden md:block text-sm font-medium max-w-[150px] truncate">
                {boutiqueName || userEmail}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="text-sm text-muted-foreground cursor-default">
              {userEmail}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
