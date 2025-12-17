import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import Product from "./pages/Product";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Auth from "./pages/Auth";
import CreateBoutique from "./pages/CreateBoutique";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/checkout/:productId" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-boutique" element={<CreateBoutique />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;