import { z } from "zod";
import { ShopifyClient } from "../shopify-client.js";

export const getOrdersSchema = z.object({
  limit: z.number().min(1).max(50).default(10).describe("Number of orders to return"),
  status: z.string().optional().describe("Financial status filter (e.g., paid, pending, refunded)"),
  start_date: z.string().optional().describe("Start date (ISO 8601)"),
  end_date: z.string().optional().describe("End date (ISO 8601)"),
});

export type GetOrdersInput = z.infer<typeof getOrdersSchema>;

export async function getOrders(client: ShopifyClient, input: GetOrdersInput) {
  const dateRange = input.start_date && input.end_date
    ? { start: input.start_date, end: input.end_date }
    : undefined;

  const result = await client.getOrders({
    limit: input.limit,
    status: input.status,
    dateRange,
  });

  const orders = result.data?.orders?.edges?.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      name: node.name,
      createdAt: node.createdAt,
      financialStatus: node.displayFinancialStatus,
      fulfillmentStatus: node.displayFulfillmentStatus,
      total: node.totalPriceSet?.shopMoney,
      subtotal: node.subtotalPriceSet?.shopMoney,
      customer: node.customer
        ? { name: `${node.customer.firstName || ""} ${node.customer.lastName || ""}`.trim(), email: node.customer.email }
        : null,
      lineItems: node.lineItems?.edges?.map((li: any) => ({
        title: li.node.title,
        quantity: li.node.quantity,
        unitPrice: li.node.originalUnitPriceSet?.shopMoney,
      })) || [],
    };
  }) || [];

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total?.amount || "0"), 0);
  const currency = orders[0]?.total?.currencyCode || "USD";

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          orders,
          summary: {
            orderCount: orders.length,
            totalRevenue: `${totalRevenue.toFixed(2)} ${currency}`,
            averageOrderValue: orders.length > 0 ? `${(totalRevenue / orders.length).toFixed(2)} ${currency}` : "0.00",
          },
        }, null, 2),
      },
    ],
  };
}
