import { z } from "zod";
import { ShopifyClient } from "../shopify-client.js";

export const getCustomersSchema = z.object({
  limit: z.number().min(1).max(50).default(10).describe("Number of customers to return"),
  segment: z.enum(["all", "repeat_buyers", "high_value"]).default("all").describe("Customer segment filter"),
});

export type GetCustomersInput = z.infer<typeof getCustomersSchema>;

export async function getCustomers(client: ShopifyClient, input: GetCustomersInput) {
  let query: string | undefined;
  if (input.segment === "repeat_buyers") {
    query = "orders_count:>1";
  } else if (input.segment === "high_value") {
    query = "total_spent:>100";
  }

  const result = await client.getCustomers({ limit: input.limit, query });

  const customers = result.data?.customers?.edges?.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      name: `${node.firstName || ""} ${node.lastName || ""}`.trim(),
      email: node.email,
      phone: node.phone,
      orderCount: node.numberOfOrders,
      totalSpent: node.amountSpent,
      tags: node.tags,
      createdAt: node.createdAt,
    };
  }) || [];

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          customers,
          count: customers.length,
          segment: input.segment,
        }, null, 2),
      },
    ],
  };
}
