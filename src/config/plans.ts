// Stripe plan configuration - maps Stripe IDs to app tiers
// NOTE: Stripe products/prices will be updated in a future step
export const PLANS = {
  starter: {
    name: "Starter",
    price_id: "price_1T1hLRHDcsx7lyooZFDrHGcc",
    product_id: "prod_TzgiYDfBvNP3Jw",
    monthly_price_cents: 4900,
    included_credits: 15000,
    display_price: "$49",
  },
  growth: {
    name: "Growth",
    price_id: "price_1T1hMiHDcsx7lyoocblFV6NN",
    product_id: "prod_Tzgk4bwXtJc7YD",
    monthly_price_cents: 14900,
    included_credits: 75000,
    display_price: "$149",
  },
  scale: {
    name: "Scale",
    price_id: "price_1T1hNHHDcsx7lyoodXWGWS32",
    product_id: "prod_TzgkIZm1yLgEwD",
    monthly_price_cents: 39900,
    included_credits: 250000,
    display_price: "$399",
  },
} as const;

export type PlanTier = keyof typeof PLANS;

export function getPlanByProductId(productId: string): PlanTier | null {
  for (const [tier, plan] of Object.entries(PLANS)) {
    if (plan.product_id === productId) return tier as PlanTier;
  }
  return null;
}

export function getPlanByPriceId(priceId: string): PlanTier | null {
  for (const [tier, plan] of Object.entries(PLANS)) {
    if (plan.price_id === priceId) return tier as PlanTier;
  }
  return null;
}
