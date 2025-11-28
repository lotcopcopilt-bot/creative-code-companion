import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart, Award, Download } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";

const Product = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg">Chargement...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
            <Button onClick={() => navigate("/marketplace")}>
              Retour au marketplace
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleBuyNow = () => {
    navigate(`/checkout/${product.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image principale */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg aspect-video bg-muted">
                <img 
                  src={product.image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {product.categories && (
                  <Badge className="absolute top-4 right-4">
                    {product.categories.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Informations produit */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {product.title}
                </h1>
                <p className="text-muted-foreground">
                  par{" "}
                  <span className="text-primary font-medium">
                    {product.sellers.boutique_name}
                  </span>
                </p>
              </div>

              {/* Rating et ventes */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-bold">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  {product.sales_count} ventes
                </span>
              </div>

              {/* Prix */}
              <div className="py-4">
                <div className="text-4xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {product.description || "Pas de description disponible."}
                </p>
              </div>

              {/* Bouton d'achat */}
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={handleBuyNow}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Acheter maintenant
                </Button>
              </div>

              {/* Caractéristiques */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4 text-primary" />
                    <span>Téléchargement instantané</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Garantie satisfait ou remboursé</span>
                  </div>
                </CardContent>
              </Card>

              {/* Vendeur */}
              {product.sellers.description && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">À propos du vendeur</h3>
                    <div className="flex items-start gap-3">
                      {product.sellers.logo_url && (
                        <img 
                          src={product.sellers.logo_url} 
                          alt={product.sellers.boutique_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{product.sellers.boutique_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sellers.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Product;
