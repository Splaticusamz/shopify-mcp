import { z } from "zod";
import { ShopifyClient } from "../shopify-client.js";

export const getProductsSchema = z.object({
  limit: z.number().min(1).max(50).default(10).describe("Number of products to return"),
  query: z.string().optional().describe("Search query for products"),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional().describe("Filter by product status"),
});

export type GetProductsInput = z.infer<typeof getProductsSchema>;

export async function getProducts(client: ShopifyClient, input: GetProductsInput) {
  const result = await client.getProducts({
    limit: input.limit,
    query: input.query,
    status: input.status,
  });

  const products = result.data?.products?.edges?.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      status: node.status,
      type: node.productType,
      vendor: node.vendor,
      totalInventory: node.totalInventory,
      image: node.images?.edges?.[0]?.node?.url || null,
      variants: node.variants?.edges?.map((v: any) => ({
        id: v.node.id,
        title: v.node.title,
        price: v.node.price,
        sku: v.node.sku,
        inventory: v.node.inventoryQuantity,
      })) || [],
    };
  }) || [];

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ products, count: products.length }, null, 2),
      },
    ],
  };
}
