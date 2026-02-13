import { Mail, LucideIcon } from "lucide-react";

export interface BrainPricing {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}

export interface BrainProduct {
  id: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
  tagline: string;
  description: string;
  features: string[];
  integrations: string[];
  pricing: BrainPricing[];
  color: string;
}

export const brains: BrainProduct[] = [
  {
    id: "email-validation",
    name: "Gold Mail Validator",
    shortName: "Email Validation",
    icon: Mail,
    tagline: "Valide emails em tempo real com score de confiança",
    description:
      "Reduza bounces e proteja sua reputação com validação inteligente. Score de risco, detecção de disposable emails e monitoramento de uso em tempo real.",
    features: [
      "Validação de emails em tempo real",
      "Score de confiança e risco",
      "Dashboard de consumo",
      "Agente de monitoramento de uso",
      "Billing engine integrado",
      "Demo interativa SaaS",
      "Webhook listener (ClickBank/Stripe)",
    ],
    integrations: ["Stripe", "ClickBank", "Zapier", "HubSpot", "Meta Ads", "Google Ads"],
    pricing: [
      {
        name: "Starter",
        price: "$19",
        period: "/mês",
        features: ["100 validações/mês", "Dashboard básico", "1 integração", "Suporte email"],
      },
      {
        name: "Pro",
        price: "$49",
        period: "/mês",
        features: ["1.000 validações/mês", "Dashboard avançado", "Todas integrações", "Suporte prioritário", "API access"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "$199",
        period: "/mês",
        features: ["10.000 validações/mês", "SLA dedicado", "Custom webhooks", "Onboarding 1:1"],
      },
    ],
    color: "from-amber-400 to-yellow-600",
  },
];
