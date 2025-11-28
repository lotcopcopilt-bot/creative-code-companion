import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  rating: number;
  sales_count: number;
  seller_id: string;
  category_id: string | null;
  sellers: {
    boutique_name: string;
    boutique_slug: string;
  };
  categories: {
    name: string;
    slug: string;
  } | null;
}

export const useProducts = (categorySlug?: string) => {
  return useQuery({
    queryKey: ["products", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          sellers!inner(boutique_name, boutique_slug),
          categories(name, slug)
        `)
        .eq("is_active", true);

      if (categorySlug && categorySlug !== "tous") {
        query = query.eq("categories.slug", categorySlug);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          sellers!inner(boutique_name, boutique_slug, description, logo_url),
          categories(name, slug)
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as Product & {
        sellers: {
          boutique_name: string;
          boutique_slug: string;
          description: string | null;
          logo_url: string | null;
        };
      };
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};
