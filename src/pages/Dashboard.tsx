import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, ShoppingCart, DollarSign, Users, Package, TrendingUp, Clock, Eye, Globe } from "lucide-react";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DateRangeFilter, { DateRangePreset, getDateRangeFromPreset } from "@/components/dashboard/DateRangeFilter";
import KPICard from "@/components/dashboard/KPICard";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProductsChart from "@/components/dashboard/TopProductsChart";
import CreateBoutiqueCTA from "@/components/dashboard/CreateBoutiqueCTA";
import useDashboardStats from "@/hooks/useDashboardStats";

interface SellerData {
  id: string;
  boutique_name: string;
  boutique_slug: string;
  description: string | null;
  logo_url: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Date range state
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("30days");
  const [dateRange, setDateRange] = useState(getDateRangeFromPreset("30days"));

  // Dashboard stats
  const { stats, isLoading: statsLoading } = useDashboardStats({
    sellerId: seller?.id || null,
    dateRange,
  });

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
        .select("id, boutique_name, boutique_slug, description, logo_url")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setSeller(data);
      } else {
        setSeller(null);
      }

      setIsLoading(false);
    };

    if (user) {
      fetchSellerData();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <DashboardSidebar
        boutiqueName={seller?.boutique_name}
        logoUrl={seller?.logo_url}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <DashboardHeader
          boutiqueName={seller?.boutique_name}
          boutiqueSlug={seller?.boutique_slug}
          logoUrl={seller?.logo_url}
          userEmail={user.email}
          onLogout={handleLogout}
        />

        {/* Content */}
        {seller ? (
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome & Filters */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Bonjour, {seller.boutique_name} 👋
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Voici les performances de votre boutique
                  </p>
                </div>
                <DateRangeFilter
                  selectedPreset={selectedPreset}
                  dateRange={dateRange}
                  onPresetChange={setSelectedPreset}
                  onDateRangeChange={setDateRange}
                />
              </div>

              {/* KPI Grid - Row 1 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  icon={<ShoppingCart className="h-5 w-5" />}
                  label="Nombre de ventes"
                  value={stats.totalSales}
                  tooltip="Nombre total de ventes complétées sur la période"
                />
                <KPICard
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Revenu total"
                  value={stats.totalRevenue.toLocaleString("fr-FR")}
                  suffix="FCFA"
                  tooltip="Revenu total généré sur la période"
                />
                <KPICard
                  icon={<Users className="h-5 w-5" />}
                  label="Nombre de clients"
                  value={stats.totalCustomers}
                  tooltip="Nombre de clients uniques sur la période"
                />
                <KPICard
                  icon={<Package className="h-5 w-5" />}
                  label="Produits actifs"
                  value={stats.totalProducts}
                  tooltip="Nombre de produits actuellement en vente"
                />
              </div>

              {/* KPI Grid - Row 2 (placeholder metrics for future) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Taux de conversion"
                  value="—"
                  suffix="%"
                  tooltip="Pourcentage de visiteurs qui achètent (bientôt disponible)"
                />
                <KPICard
                  icon={<Eye className="h-5 w-5" />}
                  label="Taux de rebond"
                  value="—"
                  suffix="%"
                  tooltip="Visiteurs qui quittent sans interaction (bientôt disponible)"
                />
                <KPICard
                  icon={<Clock className="h-5 w-5" />}
                  label="Durée moy. session"
                  value="—"
                  suffix="s"
                  tooltip="Temps moyen passé sur votre boutique (bientôt disponible)"
                />
                <KPICard
                  icon={<Globe className="h-5 w-5" />}
                  label="Nombre de visites"
                  value="—"
                  tooltip="Nombre total de visites (bientôt disponible)"
                />
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <SalesChart data={stats.salesData} isLoading={statsLoading} />
                <TopProductsChart products={stats.topProducts} isLoading={statsLoading} />
              </div>
            </div>
          </main>
        ) : (
          <CreateBoutiqueCTA />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
