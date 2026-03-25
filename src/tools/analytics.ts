import { z } from "zod";
import { ShopifyClient } from "../shopify-client.js";

export const getAnalyticsSchema = z.object({
  days: z.number().min(1).max(365).default(30).describe("Number of days to analyze (default 30)"),
});

export type GetAnalyticsInput = z.infer<typeof getAnalyticsSchema>;

export async function getAnalytics(client: ShopifyClient, input: GetAnalyticsInput) {
  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - input.days * 86400000).toISOString();

  // Fetch recent orders to derive analytics
  const result = await client.getOrders({
    limit: 50,
    dateRange: { start: startDate, end: endDate },
  });

  const orders = result.data?.orders?.edges?.map((e: any) => e.node) || [];

  // Revenue calculation
  let totalRevenue = 0;
  let currency = "USD";
  const productSales: Record<string, { title: string; quantity: number; revenue: number }> = {};
  const dailyRevenue: Record<string, number> = {};

  for (const order of orders) {
    const amount = parseFloat(order.totalPriceSet?.shopMoney?.amount || "0");
    currency = order.totalPriceSet?.shopMoney?.currencyCode || currency;
    totalRevenue += amount;

    const day = order.createdAt?.split("T")[0] || "unknown";
    dailyRevenue[day] = (dailyRevenue[day] || 0) + amount;

    for (const li of order.lineItems?.edges || []) {
      const item = li.node;
      const key = item.title;
      if (!productSales[key]) productSales[key] = { title: key, quantity: 0, revenue: 0 };
      productSales[key].quantity += item.quantity;
      productSales[key].revenue += parseFloat(item.originalUnitPriceSet?.shopMoney?.amount || "0") * item.quantity;
    }
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const revenueTrend = Object.entries(dailyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, revenue: amount.toFixed(2) }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          period: { days: input.days, start: startDate.split("T")[0], end: endDate.split("T")[0] },
          summary: {
            totalOrders: orders.length,
            totalRevenue: `${totalRevenue.toFixed(2)} ${currency}`,
            averageOrderValue: orders.length > 0 ? `${(totalRevenue / orders.length).toFixed(2)} ${currency}` : "0.00",
          },
          topSellingProducts: topProducts,
          dailyRevenueTrend: revenueTrend,
        }, null, 2),
      },
    ],
  };
}
