import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star } from "lucide-react";

// Données temporaires pour la démo
const mockProducts = [
  {
    id: 1,
    title: "Guide complet du Marketing Digital 2025",
    seller: "Marketing Pro",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
    rating: 4.8,
    sales: 234,
    category: "E-book"
  },
  {
    id: 2,
    title: "Template Notion pour Entrepreneurs",
    seller: "Productivity Hub",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500",
    rating: 4.9,
    sales: 456,
    category: "Template"
  },
  {
    id: 3,
    title: "Formation Photoshop - Niveau Avancé",
    seller: "Design Academy",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=500",
    rating: 4.7,
    sales: 189,
    category: "Formation"
  },
  {
    id: 4,
    title: "Pack de 50 Templates Instagram",
    seller: "Social Media Master",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500",
    rating: 4.6,
    sales: 567,
    category: "Design"
  },
  {
    id: 5,
    title: "Masterclass Développement Web",
    seller: "Code Academy",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500",
    rating: 4.9,
    sales: 312,
    category: "Formation"
  },
  {
    id: 6,
    title: "Kit UI/UX Designer Complet",
    seller: "Design Studio",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500",
    rating: 4.8,
    sales: 423,
    category: "Design"
  }
];

const Marketplace = () => {
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
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtres
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Tous
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              E-books
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Formations
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Templates
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Design
            </Badge>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 flex-1">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden aspect-video">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-background/90 text-foreground">
                      {product.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    par {product.seller}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.sales} ventes)
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                  <Button className="bg-primary hover:bg-primary/90">
                    Voir le produit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Charger plus de produits
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Marketplace;
