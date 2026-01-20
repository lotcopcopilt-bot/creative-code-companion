import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  sales_count: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
}

const DashboardProducts = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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
    const fetchProducts = async () => {
      if (!sellerId) return;

      const { data, error } = await supabase
        .from("products")
        .select("id, title, slug, price, sales_count, is_active, image_url, created_at")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des produits");
      } else {
        setProducts(data || []);
      }
      setIsLoading(false);
    };

    if (sellerId) {
      fetchProducts();
    }
  }, [sellerId]);

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !currentStatus })
      .eq("id", productId);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      setProducts(products.map(p => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ));
      toast.success(currentStatus ? "Produit désactivé" : "Produit activé");
    }
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", productId);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      setProducts(products.filter(p => p.id !== productId));
      toast.success("Produit supprimé");
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Produits</h1>
            <p className="text-muted-foreground">Gérez vos produits digitaux</p>
          </div>
          <Button onClick={() => navigate("/dashboard/products/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tous les produits ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Aucun produit pour le moment</p>
                <Button onClick={() => navigate("/dashboard/products/add")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer votre premier produit
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Ventes</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted" />
                          )}
                          <span className="font-medium">{product.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.price.toLocaleString("fr-FR")} FCFA</TableCell>
                      <TableCell>{product.sales_count}</TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleProductStatus(product.id, product.is_active)}
                          >
                            {product.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteProduct(product.id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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

export default DashboardProducts;
