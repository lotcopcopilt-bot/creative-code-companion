import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Store, FileText, Upload, Loader2, ArrowRight, X } from "lucide-react";
import { User } from "@supabase/supabase-js";
import logo from "@/assets/logo.png";

const CreateBoutique = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [boutiqueName, setBoutiqueName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingBoutique = async (userId: string) => {
      const { data: seller } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (seller) {
        navigate("/dashboard");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        } else {
          setTimeout(() => {
            checkExistingBoutique(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        checkExistingBoutique(session.user.id);
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "Le logo ne doit pas dépasser 2 Mo.",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      let logoUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from("boutique-logos")
          .upload(fileName, logoFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("boutique-logos")
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      const { error } = await supabase.from("sellers").insert({
        user_id: user.id,
        boutique_name: boutiqueName,
        boutique_slug: slug,
        description: description || null,
        logo_url: logoUrl,
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
        navigate("/dashboard");
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      <div className="p-4">
        <Link to="/" className="flex items-center gap-2 w-fit transition-transform hover:scale-105">
          <img src={logo} alt="E-combox" className="h-10 w-10" />
          <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
            E-combox
          </span>
        </Link>
      </div>
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Créez votre boutique</h1>
            <p className="text-muted-foreground">
              Configurez votre espace vendeur en quelques secondes
            </p>
          </div>

          <Card className="border-border/50 bg-card/80 backdrop-blur">
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
                  <Label>Logo de la boutique</Label>
                  {logoPreview ? (
                    <div className="relative w-24 h-24">
                      <img
                        src={logoPreview}
                        alt="Aperçu du logo"
                        className="w-24 h-24 rounded-lg object-cover border border-border"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Cliquez pour uploader votre logo
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG jusqu'à 2 Mo
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
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
    </div>
  );
};

export default CreateBoutique;