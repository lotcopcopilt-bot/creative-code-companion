import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Store, FileText, Image, Loader2, ArrowRight } from "lucide-react";
import { User } from "@supabase/supabase-js";

const CreateBoutique = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [boutiqueName, setBoutiqueName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour créer une boutique.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);

    try {
      const slug = generateSlug(boutiqueName);

      const { data: existingSeller } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingSeller) {
        toast({
          title: "Boutique existante",
          description: "Vous avez déjà une boutique associée à ce compte.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.from("sellers").insert({
        user_id: user.id,
        boutique_name: boutiqueName,
        boutique_slug: slug,
        description: description || null,
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Nom déjà pris",
            description: "Ce nom de boutique est déjà utilisé. Choisissez un autre nom.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Boutique créée !",
          description: "Votre boutique a été créée avec succès.",
        });
        navigate("/marketplace");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Créez votre boutique</h1>
            <p className="text-muted-foreground text-lg">
              Lancez votre activité de créateur et commencez à vendre vos produits digitaux
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Informations de la boutique
              </CardTitle>
              <CardDescription>
                Ces informations seront affichées sur votre page boutique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="boutique-name">Nom de la boutique *</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="boutique-name"
                      type="text"
                      placeholder="Ma Super Boutique"
                      value={boutiqueName}
                      onChange={(e) => setBoutiqueName(e.target.value)}
                      className="pl-10"
                      required
                      maxLength={100}
                    />
                  </div>
                  {boutiqueName && (
                    <p className="text-sm text-muted-foreground">
                      URL: e-combox.com/boutique/{generateSlug(boutiqueName)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre boutique et ce que vous vendez..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="pl-10 min-h-[100px]"
                      maxLength={500}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-url">URL du logo</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="logo-url"
                      type="url"
                      placeholder="https://exemple.com/mon-logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-url">URL de la bannière</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="banner-url"
                      type="url"
                      placeholder="https://exemple.com/ma-banniere.png"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      Créer ma boutique
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateBoutique;
