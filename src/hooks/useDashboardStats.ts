import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, eachDayOfInterval, parseISO } from "date-fns";

interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  salesData: Array<{ date: string; sales: number; revenue: number }>;
  topProducts: Array<{ id: string; title: string; sales: number; revenue: number }>;
}

interface UseDashboardStatsProps {
  sellerId: string | null;
  dateRange: { from: Date; to: Date };
}

const useDashboardStats = ({ sellerId, dateRange }: UseDashboardStatsProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    salesData: [],
    topProducts: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!sellerId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Get seller's products
        const { data: products } = await supabase
          .from("products")
          .select("id, title, price, sales_count")
          .eq("seller_id", sellerId)
          .eq("is_active", true);

        const productIds = products?.map((p) => p.id) || [];
        const totalProducts = products?.length || 0;

        if (productIds.length === 0) {
          setStats({
            totalSales: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            totalProducts: 0,
            salesData: [],
            topProducts: [],
          });
          setIsLoading(false);
          return;
        }

        // Get orders for seller's products within date range using seller_orders view
        // This view masks buyer emails and filters by seller ownership
        const { data: orders } = await supabase
          .from("seller_orders")
          .select("id, product_id, amount, masked_buyer_email, created_at")
          .eq("seller_id", sellerId)
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());

        const validOrders = orders || [];

        // Calculate totals
        const totalSales = validOrders.length;
        const totalRevenue = validOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
        const uniqueCustomers = new Set(validOrders.map((o) => o.masked_buyer_email)).size;

        // Group sales by date
        const salesByDate: Record<string, { sales: number; revenue: number }> = {};
        
        // Initialize all days in the range
        const allDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
        allDays.forEach((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          salesByDate[dateKey] = { sales: 0, revenue: 0 };
        });

        // Fill in actual sales
        validOrders.forEach((order) => {
          const dateKey = format(parseISO(order.created_at), "yyyy-MM-dd");
          if (salesByDate[dateKey]) {
            salesByDate[dateKey].sales += 1;
            salesByDate[dateKey].revenue += order.amount;
          }
        });

        const salesData = Object.entries(salesByDate)
          .map(([date, data]) => ({
            date,
            sales: data.sales,
            revenue: data.revenue,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Calculate top products
        const productSales: Record<string, { sales: number; revenue: number }> = {};
        validOrders.forEach((order) => {
          if (!productSales[order.product_id]) {
            productSales[order.product_id] = { sales: 0, revenue: 0 };
          }
          productSales[order.product_id].sales += 1;
          productSales[order.product_id].revenue += order.amount;
        });

        const topProducts = Object.entries(productSales)
          .map(([productId, data]) => {
            const product = products?.find((p) => p.id === productId);
            return {
              id: productId,
              title: product?.title || "Produit inconnu",
              sales: data.sales,
              revenue: data.revenue,
            };
          })
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        setStats({
          totalSales,
          totalRevenue,
          totalCustomers: uniqueCustomers,
          totalProducts,
          salesData,
          topProducts,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [sellerId, dateRange.from.toISOString(), dateRange.to.toISOString()]);

  return { stats, isLoading };
};

export default useDashboardStats;
