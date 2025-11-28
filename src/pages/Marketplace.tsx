import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star } from "lucide-react";
import { useProducts, useCategories } from "@/hooks/useProducts";

const Marketplace = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("tous");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: products, isLoading: productsLoading } = useProducts(
    selectedCategory === "tous" ? undefined : selectedCategory
  );
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const filteredProducts = products?.filter((product) =>
    searchQuery
      ? product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sellers.boutique_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-dark text-white py-12">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Marketplace de produits{" "}
              <span className="bg-gradient-brand bg-clip-text text-transparent">
                digitaux
              </span>
            </h1>
            <p className="text-white/80 text-lg">
              Découvrez des milliers de produits numériques créés par des experts
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b bg-background">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un produit, un créateur..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtres
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge 
              variant={selectedCategory === "tous" ? "secondary" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSelectedCategory("tous")}
            >
              Tous
            </Badge>
            {!categoriesLoading && categories?.map((category) => (
              <Badge 
                key={category.id}
                variant={selectedCategory === category.slug ? "secondary" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 flex-1">
        <div className="container">
          {productsLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-lg">Chargement des produits...</div>
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden aspect-video">
                        <img 
                          src={product.image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500"} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.categories && (
                          <Badge className="absolute top-3 right-3 bg-background/90 text-foreground">
                            {product.categories.name}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        par {product.sellers.boutique_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({product.sales_count} ventes)
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      <Button className="bg-primary hover:bg-primary/90">
                        Voir le produit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                Aucun produit trouvé pour votre recherche.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Marketplace;
