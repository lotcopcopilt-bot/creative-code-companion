import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface TopProduct {
  id: string;
  title: string;
  sales: number;
  revenue: number;
}

interface TopProductsChartProps {
  products: TopProduct[];
  isLoading?: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(262, 83%, 58%)",
  "hsl(142, 76%, 36%)",
  "hsl(47, 100%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(340, 82%, 52%)",
];

const TopProductsChart = ({ products, isLoading }: TopProductsChartProps) => {
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Top produits par vente</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Top produits par vente</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p>Aucun produit vendu</p>
            <p className="text-sm">Les top produits apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = products.map((product, index) => ({
    name: product.title.length > 20 ? product.title.slice(0, 20) + "..." : product.title,
    value: product.sales,
    revenue: product.revenue,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">{data.name}</p>
          <p className="text-sm text-primary">
            Ventes: <span className="font-bold">{data.value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Revenu: <span className="font-bold">{data.revenue.toLocaleString("fr-FR")} FCFA</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Top produits par vente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductsChart;
