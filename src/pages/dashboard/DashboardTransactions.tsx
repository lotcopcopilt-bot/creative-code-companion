import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
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

interface Transaction {
  id: string;
  product_title: string | null;
  masked_buyer_email: string | null;
  amount: number | null;
  payment_status: string | null;
  created_at: string | null;
}

const DashboardTransactions = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
    const fetchTransactions = async () => {
      if (!sellerId) return;

      const { data, error } = await supabase
        .from("seller_orders")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (!error) {
        setTransactions(data || []);
      }
      setIsLoading(false);
    };

    if (sellerId) {
      fetchTransactions();
    }
  }, [sellerId]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Complété</Badge>;
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      case "failed":
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">{status || "—"}</Badge>;
    }
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
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Toutes les transactions (complétées, en attente, échouées)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucune transaction</p>
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
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {tx.created_at
                          ? format(new Date(tx.created_at), "dd MMM yyyy HH:mm", {
                              locale: fr,
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {tx.product_title || "—"}
                      </TableCell>
                      <TableCell>{tx.masked_buyer_email || "—"}</TableCell>
                      <TableCell>
                        {tx.amount?.toLocaleString("fr-FR")} FCFA
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.payment_status)}</TableCell>
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

export default DashboardTransactions;
