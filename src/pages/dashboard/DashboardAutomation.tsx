import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, Zap, Mail, MessageSquare, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

const DashboardAutomation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Automation states
  const [emailOnSale, setEmailOnSale] = useState(true);
  const [abandonedCartReminder, setAbandonedCartReminder] = useState(false);
  const [reviewRequest, setReviewRequest] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleToggle = (automation: string, value: boolean) => {
    toast.success(`Automatisation ${value ? "activée" : "désactivée"}`);
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
        <div>
          <h1 className="text-2xl font-bold">Automatisation</h1>
          <p className="text-muted-foreground">
            Automatisez vos actions marketing et notifications
          </p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Email après vente</CardTitle>
                  <CardDescription>
                    Envoyer automatiquement un email de remerciement après chaque achat
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-sale">Activer</Label>
                <Switch
                  id="email-sale"
                  checked={emailOnSale}
                  onCheckedChange={(v) => {
                    setEmailOnSale(v);
                    handleToggle("email-sale", v);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Rappel panier abandonné</CardTitle>
                  <CardDescription>
                    Envoyer un rappel aux clients qui n'ont pas finalisé leur achat
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="cart-reminder">Activer</Label>
                <Switch
                  id="cart-reminder"
                  checked={abandonedCartReminder}
                  onCheckedChange={(v) => {
                    setAbandonedCartReminder(v);
                    handleToggle("cart-reminder", v);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Demande d'avis</CardTitle>
                  <CardDescription>
                    Demander un avis client 3 jours après l'achat
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="review-request">Activer</Label>
                <Switch
                  id="review-request"
                  checked={reviewRequest}
                  onCheckedChange={(v) => {
                    setReviewRequest(v);
                    handleToggle("review-request", v);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="flex flex-col items-center text-center">
              <Zap className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Plus d'automatisations bientôt</h3>
              <p className="text-muted-foreground text-sm">
                Séquences email, intégration WhatsApp, notifications push...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAutomation;
