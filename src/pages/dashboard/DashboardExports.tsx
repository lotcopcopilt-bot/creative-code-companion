import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, Download, FileSpreadsheet, FileText, Users, Package, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

const DashboardExports = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const exportData = async (type: string) => {
    if (!sellerId) return;
    
    setExporting(type);
    
    try {
      let data: any[] = [];
      let filename = "";

      switch (type) {
        case "products":
          const { data: products } = await supabase
            .from("products")
            .select("title, price, sales_count, is_active, created_at")
            .eq("seller_id", sellerId);
          data = products || [];
          filename = "produits";
          break;
        case "sales":
          const { data: sales } = await supabase
            .from("seller_orders")
            .select("product_title, masked_buyer_email, amount, payment_status, created_at")
            .eq("seller_id", sellerId)
            .eq("payment_status", "completed");
          data = sales || [];
          filename = "ventes";
          break;
        case "customers":
          const { data: orders } = await supabase
            .from("seller_orders")
            .select("masked_buyer_email, amount, created_at")
            .eq("seller_id", sellerId)
            .eq("payment_status", "completed");
          
          // Aggregate customers
          const customerMap = new Map();
          orders?.forEach(o => {
            const email = o.masked_buyer_email;
            if (customerMap.has(email)) {
              const c = customerMap.get(email);
              c.purchases++;
              c.total += o.amount;
            } else {
              customerMap.set(email, { email, purchases: 1, total: o.amount });
            }
          });
          data = Array.from(customerMap.values());
          filename = "clients";
          break;
      }

      if (data.length === 0) {
        toast.error("Aucune donnée à exporter");
        setExporting(null);
        return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map(row => headers.map(h => `"${row[h] ?? ""}"`).join(","))
      ].join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Export réussi !");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
    
    setExporting(null);
  };

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
          <h1 className="text-2xl font-bold">Exportations</h1>
          <p className="text-muted-foreground">
            Exportez vos données au format CSV
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Produits</CardTitle>
                  <CardDescription>
                    Liste de tous vos produits
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => exportData("products")}
                disabled={exporting === "products"}
              >
                {exporting === "products" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exporter CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Ventes</CardTitle>
                  <CardDescription>
                    Historique des ventes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => exportData("sales")}
                disabled={exporting === "sales"}
              >
                {exporting === "sales" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exporter CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Clients</CardTitle>
                  <CardDescription>
                    Liste des clients
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => exportData("customers")}
                disabled={exporting === "customers"}
              >
                {exporting === "customers" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exporter CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardExports;
