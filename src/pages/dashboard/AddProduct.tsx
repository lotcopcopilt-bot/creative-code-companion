import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Package, FileText, Upload, Loader2, ArrowLeft, X, ImageIcon, File } from "lucide-react";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const AddProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  
  // File states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Get seller ID
      const { data: seller } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!seller) {
        navigate("/create-boutique");
        return;
      }
      setSellerId(seller.id);
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (!error && data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "L'image ne doit pas dépasser 5 Mo.",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "Le fichier ne doit pas dépasser 100 Mo.",
          variant: "destructive",
        });
        return;
      }
      setProductFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeProductFile = () => {
    setProductFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !sellerId) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour ajouter un produit.",
        variant: "destructive",
      });
      return;
    }

    if (!productFile) {
      toast({
        title: "Fichier requis",
        description: "Veuillez ajouter le fichier du produit à vendre.",
        variant: "destructive",
      });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Prix invalide",
        description: "Veuillez entrer un prix valide.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const slug = generateSlug(title) + "-" + Date.now().toString(36);
      let imageUrl = null;

      // Upload product image if provided
      if (imageFile) {
        const imageExt = imageFile.name.split(".").pop();
        const imageName = `${sellerId}/${slug}/image.${imageExt}`;
        
        const { error: imageUploadError } = await supabase.storage
          .from("boutique-logos")
          .upload(imageName, imageFile);

        if (imageUploadError) {
          throw imageUploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("boutique-logos")
          .getPublicUrl(imageName);

        imageUrl = publicUrl;
      }

      // Upload product file
      const fileExt = productFile.name.split(".").pop();
      const fileName = `${sellerId}/${slug}/product.${fileExt}`;
      
      const { error: fileUploadError } = await supabase.storage
        .from("product-files")
        .upload(fileName, productFile);

      if (fileUploadError) {
        throw fileUploadError;
      }

      // Get the file path (not public URL since it's private)
      const fileUrl = fileName;

      // Create product in database
      const { error } = await supabase.from("products").insert({
        seller_id: sellerId,
        title,
        slug,
        description: description || null,
        price: priceNum,
        image_url: imageUrl,
        file_url: fileUrl,
        category_id: categoryId || null,
        is_active: true,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Produit existant",
            description: "Un produit avec ce nom existe déjà.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Produit créé !",
          description: "Votre produit a été ajouté avec succès.",
        });
        navigate("/dashboard/products");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !sellerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Ajouter un produit</h1>
            <p className="text-muted-foreground">Créez un nouveau produit digital</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Informations du produit
            </CardTitle>
            <CardDescription>
              Remplissez les informations de votre produit digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du produit *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="title"
                    type="text"
                    placeholder="Mon super ebook"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="pl-10"
                    required
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre produit..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="pl-10 min-h-[100px]"
                    maxLength={2000}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (FCFA) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="5000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="1"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image du produit</Label>
                {imagePreview ? (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-32 h-32 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour uploader une image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG jusqu'à 5 Mo
                    </p>
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-2">
                <Label>Fichier du produit *</Label>
                {productFile ? (
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50">
                    <File className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{productFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(productFile.size / (1024 * 1024)).toFixed(2)} Mo
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeProductFile}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour uploader le fichier à vendre
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, ZIP, MP3, etc. jusqu'à 100 Mo
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleProductFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/dashboard/products")}
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer le produit"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;
