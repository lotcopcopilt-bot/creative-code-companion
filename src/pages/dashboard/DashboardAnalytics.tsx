import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, TrendingUp, Eye, Clock, Globe, ShoppingCart, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import useDashboardStats from "@/hooks/useDashboardStats";
import DateRangeFilter, { DateRangePreset, getDateRangeFromPreset } from "@/components/dashboard/DateRangeFilter";
import SalesChart from "@/components/dashboard/SalesChart";

const DashboardAnalytics = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("30days");
  const [dateRange, setDateRange] = useState(getDateRangeFromPreset("30days"));

  const { stats, isLoading: statsLoading } = useDashboardStats({
    sellerId,
    dateRange,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data: seller } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (seller) {
        setSellerId(seller.id);
      }
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytiques</h1>
            <p className="text-muted-foreground">
              Analysez les performances de votre boutique
            </p>
          </div>
          <DateRangeFilter
            selectedPreset={selectedPreset}
            dateRange={dateRange}
            onPresetChange={setSelectedPreset}
            onDateRangeChange={setDateRange}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ventes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenu
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRevenue.toLocaleString("fr-FR")} FCFA
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taux de conversion
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—%</div>
              <p className="text-xs text-muted-foreground">Bientôt disponible</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Visites
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">Bientôt disponible</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taux de rebond
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—%</div>
              <p className="text-xs text-muted-foreground">Bientôt disponible</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Durée session
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—s</div>
              <p className="text-xs text-muted-foreground">Bientôt disponible</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Évolution des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={stats.salesData} isLoading={statsLoading} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAnalytics;
