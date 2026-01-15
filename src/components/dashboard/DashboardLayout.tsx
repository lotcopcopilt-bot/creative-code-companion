import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

interface SellerData {
  id: string;
  boutique_name: string;
  boutique_slug: string;
  logo_url: string | null;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<SellerData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data } = await supabase
        .from("sellers")
        .select("id, boutique_name, boutique_slug, logo_url")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        setSeller(data);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        boutiqueName={seller?.boutique_name}
        logoUrl={seller?.logo_url}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader
          boutiqueName={seller?.boutique_name}
          boutiqueSlug={seller?.boutique_slug}
          logoUrl={seller?.logo_url}
          userEmail={user?.email}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
