import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check, Zap, Shield, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-dark text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_50%)]"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in">
              Vendez vos produits{" "}
              <span className="bg-gradient-brand bg-clip-text text-transparent">
                digitaux
              </span>{" "}
              facilement
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Créez votre boutique en ligne en quelques minutes. E-books, formations, templates... 
              Vendez tout ce que vous créez, sans commission sur les petites ventes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="text-lg px-8 border-white/20 text-white hover:bg-white/10">
                  Explorer la marketplace
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Configuration en 5 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Des outils puissants pour gérer et développer votre activité de créateur
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Livraison instantanée</h3>
              <p className="text-muted-foreground">
                Vos clients reçoivent leurs fichiers immédiatement après paiement. 
                Aucune intervention de votre part.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Paiements sécurisés</h3>
              <p className="text-muted-foreground">
                Acceptez Mobile Money et PayPal. Tous les paiements sont sécurisés 
                et vous êtes payé directement.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics détaillées</h3>
              <p className="text-muted-foreground">
                Suivez vos ventes, vos revenus et l'engagement de vos clients 
                avec des statistiques en temps réel.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container">
          <div className="bg-gradient-dark text-white rounded-3xl p-12">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div>
                <div className="text-5xl font-bold bg-gradient-brand bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <p className="text-white/70">Créateurs actifs</p>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-brand bg-clip-text text-transparent mb-2">
                  500K+
                </div>
                <p className="text-white/70">Produits vendus</p>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-brand bg-clip-text text-transparent mb-2">
                  98%
                </div>
                <p className="text-white/70">Satisfaction client</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Users className="h-16 w-16 mx-auto text-primary" />
            <h2 className="text-4xl font-bold">Rejoignez des milliers de créateurs</h2>
            <p className="text-muted-foreground text-lg">
              Lancez votre boutique aujourd'hui et commencez à monétiser votre contenu 
              auprès de votre communauté.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8">
              Créer ma boutique gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
