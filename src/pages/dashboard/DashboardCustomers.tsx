import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Customer {
  email: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase: string;
}

const DashboardCustomers = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
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
    const fetchCustomers = async () => {
      if (!sellerId) return;

      const { data, error } = await supabase
        .from("seller_orders")
        .select("*")
        .eq("seller_id", sellerId)
        .eq("payment_status", "completed");

      if (!error && data) {
        // Aggregate by email
        const customerMap = new Map<string, Customer>();
        
        data.forEach((order) => {
          const email = order.masked_buyer_email || "unknown";
          const existing = customerMap.get(email);
          
          if (existing) {
            existing.totalPurchases += 1;
            existing.totalSpent += order.amount || 0;
            if (order.created_at && order.created_at > existing.lastPurchase) {
              existing.lastPurchase = order.created_at;
            }
          } else {
            customerMap.set(email, {
              email,
              totalPurchases: 1,
              totalSpent: order.amount || 0,
              lastPurchase: order.created_at || "",
            });
          }
        });

        setCustomers(Array.from(customerMap.values()));
      }
      setIsLoading(false);
    };

    if (sellerId) {
      fetchCustomers();
    }
  }, [sellerId]);

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
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Gérez vos clients et leur historique
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valeur moyenne client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.length > 0
                  ? Math.round(
                      customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                        customers.length
                    ).toLocaleString("fr-FR")
                  : 0}{" "}
                FCFA
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Achats répétés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter((c) => c.totalPurchases > 1).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des clients</CardTitle>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun client pour le moment</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Achats</TableHead>
                    <TableHead>Total dépensé</TableHead>
                    <TableHead>Dernier achat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.email}>
                      <TableCell className="font-medium">
                        {customer.email}
                      </TableCell>
                      <TableCell>{customer.totalPurchases}</TableCell>
                      <TableCell>
                        {customer.totalSpent.toLocaleString("fr-FR")} FCFA
                      </TableCell>
                      <TableCell>
                        {customer.lastPurchase
                          ? format(new Date(customer.lastPurchase), "dd MMM yyyy", {
                              locale: fr,
                            })
                          : "—"}
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

export default DashboardCustomers;
