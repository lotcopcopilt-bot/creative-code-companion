import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Sale {
  id: string;
  product_title: string | null;
  masked_buyer_email: string | null;
  amount: number | null;
  payment_status: string | null;
  created_at: string | null;
}

const DashboardSales = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
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

      const { data: seller } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (seller) {
        setSellerId(seller.id);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchSales = async () => {
      if (!sellerId) return;

      const { data, error } = await supabase
        .from("seller_orders")
        .select("*")
        .eq("seller_id", sellerId)
        .eq("payment_status", "completed")
        .order("created_at", { ascending: false });

      if (!error) {
        setSales(data || []);
      }
      setIsLoading(false);
    };

    if (sellerId) {
      fetchSales();
    }
  }, [sellerId]);

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ventes</h1>
            <p className="text-muted-foreground">Historique de vos ventes</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total des ventes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenu total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue.toLocaleString("fr-FR")} FCFA
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Toutes les ventes</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucune vente pour le moment</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {sale.created_at
                          ? format(new Date(sale.created_at), "dd MMM yyyy", { locale: fr })
                          : "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sale.product_title || "—"}
                      </TableCell>
                      <TableCell>{sale.masked_buyer_email || "—"}</TableCell>
                      <TableCell>
                        {sale.amount?.toLocaleString("fr-FR")} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Complété</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSales;
