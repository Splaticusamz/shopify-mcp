import { z } from "zod";
import { ShopifyClient } from "../shopify-client.js";

export const getInventorySchema = z.object({
  limit: z.number().min(1).max(100).default(50).describe("Number of variants to check"),
  low_stock_threshold: z.number().default(5).describe("Threshold below which items are flagged as low stock"),
});

export type GetInventoryInput = z.infer<typeof getInventorySchema>;

export async function getInventory(client: ShopifyClient, input: GetInventoryInput) {
  const result = await client.getInventory({ limit: input.limit });

  const items = result.data?.productVariants?.edges?.map((edge: any) => {
    const node = edge.node;
    const levels = node.inventoryItem?.inventoryLevels?.edges?.map((l: any) => ({
      location: l.node.location?.name,
      available: l.node.quantities?.find((q: any) => q.name === "available")?.quantity ?? 0,
    })) || [];

    const totalAvailable = levels.reduce((sum: number, l: any) => sum + (l.available || 0), 0);

    return {
      product: node.product?.title,
      variant: node.title,
      sku: node.sku,
      totalAvailable,
      lowStock: totalAvailable <= input.low_stock_threshold,
      levels,
    };
  }) || [];

  const lowStockItems = items.filter((i: any) => i.lowStock);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          inventory: items,
          summary: {
            totalItems: items.length,
            lowStockCount: lowStockItems.length,
            lowStockItems: lowStockItems.map((i: any) => `${i.product} - ${i.variant} (${i.totalAvailable} available)`),
          },
        }, null, 2),
      },
    ],
  };
}
