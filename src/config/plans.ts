// Stripe plan configuration - maps Stripe IDs to app tiers
export const PLANS = {
  starter: {
    name: "Starter",
    price_id: "price_1T1hLRHDcsx7lyooZFDrHGcc",
    product_id: "prod_TzgiYDfBvNP3Jw",
    monthly_price_cents: 2900,
    included_credits: 1000,
    display_price: "$29",
  },
  professional: {
    name: "Professional",
    price_id: "price_1T1hMiHDcsx7lyoocblFV6NN",
    product_id: "prod_Tzgk4bwXtJc7YD",
    monthly_price_cents: 9900,
    included_credits: 10000,
    display_price: "$99",
  },
  enterprise: {
    name: "Enterprise",
    price_id: "price_1T1hNHHDcsx7lyoodXWGWS32",
    product_id: "prod_TzgkIZm1yLgEwD",
    monthly_price_cents: 49900,
    included_credits: -1, // unlimited
    display_price: "$499",
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
