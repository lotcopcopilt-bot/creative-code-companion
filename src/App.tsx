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
import DashboardProducts from "./pages/dashboard/DashboardProducts";
import DashboardSales from "./pages/dashboard/DashboardSales";
import DashboardTransactions from "./pages/dashboard/DashboardTransactions";
import DashboardCarts from "./pages/dashboard/DashboardCarts";
import DashboardAutomation from "./pages/dashboard/DashboardAutomation";
import DashboardCustomers from "./pages/dashboard/DashboardCustomers";
import DashboardReviews from "./pages/dashboard/DashboardReviews";
import DashboardAnalytics from "./pages/dashboard/DashboardAnalytics";
import DashboardExports from "./pages/dashboard/DashboardExports";
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
          <Route path="/dashboard/products" element={<DashboardProducts />} />
          <Route path="/dashboard/sales" element={<DashboardSales />} />
          <Route path="/dashboard/transactions" element={<DashboardTransactions />} />
          <Route path="/dashboard/carts" element={<DashboardCarts />} />
          <Route path="/dashboard/automation" element={<DashboardAutomation />} />
          <Route path="/dashboard/customers" element={<DashboardCustomers />} />
          <Route path="/dashboard/reviews" element={<DashboardReviews />} />
          <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
          <Route path="/dashboard/exports" element={<DashboardExports />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;