import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  ShoppingBag,
  Zap,
  Users,
  MessageSquare,
  BarChart3,
  Download,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
}

const NavItem = ({ icon, label, href, active, disabled }: NavItemProps) => (
  <Link
    to={disabled ? "#" : href}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
      disabled && "opacity-50 cursor-not-allowed pointer-events-none"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

interface DashboardSidebarProps {
  boutiqueName?: string;
  logoUrl?: string | null;
}

const DashboardSidebar = ({ boutiqueName, logoUrl }: DashboardSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Tableau de bord", href: "/dashboard" },
    { icon: <Package className="h-5 w-5" />, label: "Produits", href: "/dashboard/products", disabled: true },
    { icon: <ShoppingCart className="h-5 w-5" />, label: "Ventes", href: "/dashboard/sales", disabled: true },
    { icon: <Receipt className="h-5 w-5" />, label: "Transactions", href: "/dashboard/transactions", disabled: true },
    { icon: <ShoppingBag className="h-5 w-5" />, label: "Paniers", href: "/dashboard/carts", disabled: true },
    { icon: <Zap className="h-5 w-5" />, label: "Automatisation", href: "/dashboard/automation", disabled: true },
    { icon: <Users className="h-5 w-5" />, label: "Clients", href: "/dashboard/customers", disabled: true },
    { icon: <MessageSquare className="h-5 w-5" />, label: "Reviews", href: "/dashboard/reviews", disabled: true },
    { icon: <BarChart3 className="h-5 w-5" />, label: "Analytiques", href: "/dashboard/analytics", disabled: true },
    { icon: <Download className="h-5 w-5" />, label: "Exportations", href: "/dashboard/exports", disabled: true },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <img src={logo} alt="E-combox" className="h-9 w-9" />
        <span className="text-xl font-bold bg-gradient-brand bg-clip-text text-transparent">
          E-combox
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={currentPath === item.href}
            disabled={item.disabled}
          />
        ))}
      </nav>

      {/* Boutique Info */}
      {boutiqueName && (
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={boutiqueName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{boutiqueName}</p>
              <p className="text-xs text-muted-foreground">Boutique active</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
