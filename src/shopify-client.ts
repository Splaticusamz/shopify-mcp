export interface ShopifyClientConfig {
  shop: string;
  accessToken: string;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; locations?: any[]; path?: string[] }>;
  extensions?: {
    cost?: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

export class ShopifyClient {
  private shop: string;
  private accessToken: string;
  private apiVersion = "2024-10";

  constructor(config: ShopifyClientConfig) {
    this.shop = config.shop.replace(/\.myshopify\.com$/, "");
    this.accessToken = config.accessToken;
  }

  private get endpoint(): string {
    return `https://${this.shop}.myshopify.com/admin/api/${this.apiVersion}/graphql.json`;
  }

  async query<T = any>(graphql: string, variables?: Record<string, any>): Promise<GraphQLResponse<T>> {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.accessToken,
      },
      body: JSON.stringify({ query: graphql, variables }),
    });

    if (res.status === 429) {
      const retryAfter = parseFloat(res.headers.get("Retry-After") || "2");
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return this.query<T>(graphql, variables);
    }

    if (!res.ok) {
      throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as GraphQLResponse<T>;

    if (json.errors?.length) {
      throw new Error(`GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`);
    }

    // Check throttle status and back off if low
    const available = json.extensions?.cost?.throttleStatus?.currentlyAvailable;
    const restoreRate = json.extensions?.cost?.throttleStatus?.restoreRate;
    if (available !== undefined && restoreRate && available < 100) {
      await new Promise((r) => setTimeout(r, 500));
    }

    return json;
  }

  async getProducts(params: { limit?: number; query?: string; status?: string }) {
    const { limit = 10, query, status } = params;
    const queryParts: string[] = [];
    if (query) queryParts.push(query);
    if (status) queryParts.push(`status:${status}`);
    const searchQuery = queryParts.length > 0 ? queryParts.join(" AND ") : null;

    const gql = `
      query GetProducts($first: Int!, $query: String) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              handle
              status
              productType
              vendor
              createdAt
              updatedAt
              totalInventory
              images(first: 1) {
                edges { node { url altText } }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    sku
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query(gql, { first: limit, query: searchQuery });
  }

  async getOrders(params: { limit?: number; status?: string; dateRange?: { start: string; end: string } }) {
    const { limit = 10, status, dateRange } = params;
    const queryParts: string[] = [];
    if (status) queryParts.push(`financial_status:${status}`);
    if (dateRange) queryParts.push(`created_at:>='${dateRange.start}' created_at:<='${dateRange.end}'`);
    const searchQuery = queryParts.length > 0 ? queryParts.join(" AND ") : null;

    const gql = `
      query GetOrders($first: Int!, $query: String) {
        orders(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet { shopMoney { amount currencyCode } }
              subtotalPriceSet { shopMoney { amount currencyCode } }
              customer { id firstName lastName email }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    originalUnitPriceSet { shopMoney { amount currencyCode } }
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query(gql, { first: limit, query: searchQuery });
  }

  async getInventory(params: { limit?: number }) {
    const { limit = 50 } = params;

    const gql = `
      query GetInventory($first: Int!) {
        productVariants(first: $first) {
          edges {
            node {
              id
              title
              sku
              inventoryQuantity
              product { title handle }
              inventoryItem {
                id
                inventoryLevels(first: 5) {
                  edges {
                    node {
                      id
                      quantities(names: ["available"]) { name quantity }
                      location { name }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.query(gql, { first: limit });
  }

  async getCustomers(params: { limit?: number; query?: string }) {
    const { limit = 10, query } = params;

    const gql = `
      query GetCustomers($first: Int!, $query: String) {
        customers(first: $first, query: $query) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              numberOfOrders
              amountSpent { amount currencyCode }
              tags
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    return this.query(gql, { first: limit, query: query || null });
  }
}
