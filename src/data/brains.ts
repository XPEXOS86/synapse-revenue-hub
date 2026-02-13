import { Mail, Database, TrendingUp, Target, Workflow, LucideIcon } from "lucide-react";

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
  color: string; // tailwind gradient stop
}

export const brains: BrainProduct[] = [
  {
    id: "email-validation",
    name: "Email Validation Brain",
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
        price: "R$497",
        period: "/mês",
        features: ["5.000 validações/mês", "Dashboard básico", "1 integração", "Suporte email"],
      },
      {
        name: "Growth",
        price: "R$1.997",
        period: "/mês",
        features: ["50.000 validações/mês", "Dashboard avançado", "Todas integrações", "Suporte prioritário", "API access"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "R$8.000+",
        period: "/mês",
        features: ["Validações ilimitadas", "SLA dedicado", "Custom webhooks", "Onboarding 1:1"],
      },
    ],
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: "data-enrichment",
    name: "Data Enrichment Brain",
    shortName: "Data Enrichment",
    icon: Database,
    tagline: "Enriqueça leads com dados de empresa, cargo e segmento",
    description:
      "Transforme leads frios em oportunidades quentes. Enriquecimento automático com dados de empresa, cargo, segmento e score de intenção.",
    features: [
      "Enriquecimento de leads (empresa, cargo, segmento)",
      "Score de intenção e risco",
      "Dashboard analytics",
      "Agents de integração Zapier/CRM",
      "Billing engine + API key",
      "Demo SaaS interativa",
      "Webhook listener configurável",
    ],
    integrations: ["Stripe", "ClickBank", "Zapier", "HubSpot", "Meta Ads", "Google Ads"],
    pricing: [
      {
        name: "Starter",
        price: "R$697",
        period: "/mês",
        features: ["3.000 enriquecimentos/mês", "Dashboard básico", "1 integração", "Suporte email"],
      },
      {
        name: "Growth",
        price: "R$2.997",
        period: "/mês",
        features: ["30.000 enriquecimentos/mês", "Dashboard avançado", "Todas integrações", "API access", "CRM sync"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "R$10.000+",
        period: "/mês",
        features: ["Enriquecimentos ilimitados", "SLA dedicado", "Custom fields", "Onboarding 1:1"],
      },
    ],
    color: "from-violet-400 to-purple-500",
  },
  {
    id: "revenue-intelligence",
    name: "Revenue Intelligence Brain",
    shortName: "Revenue Intelligence",
    icon: TrendingUp,
    tagline: "Otimize funis e campanhas com inteligência de receita",
    description:
      "Conecte dados de vendas e ads em um único dashboard. Agentes autônomos monitoram funis, sugerem otimizações e maximizam seu ROI.",
    features: [
      "Conecta dados de vendas e ads",
      "Sugestão de otimização automática",
      "Agentes monitoram funis e campanhas",
      "Dashboard interativo",
      "Billing integrado",
      "Demo interativa SaaS",
      "Webhook listener e API Gateway",
    ],
    integrations: ["Stripe", "ClickBank", "Zapier", "HubSpot", "Meta Ads", "Google Ads"],
    pricing: [
      {
        name: "Starter",
        price: "R$997",
        period: "/mês",
        features: ["2 funis monitorados", "Dashboard básico", "1 integração", "Reports semanais"],
      },
      {
        name: "Growth",
        price: "R$3.997",
        period: "/mês",
        features: ["Funis ilimitados", "Dashboard avançado", "Todas integrações", "Reports diários", "AI suggestions"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "R$12.000+",
        period: "/mês",
        features: ["Tudo do Growth", "SLA dedicado", "Custom agents", "Onboarding 1:1"],
      },
    ],
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: "ad-optimization",
    name: "Ad Optimization Brain",
    shortName: "Ad Optimization",
    icon: Target,
    tagline: "Otimize campanhas Meta & Google automaticamente",
    description:
      "IA que monitora performance e budget em tempo real. Análise de ROI, otimização automática de bids e sugestões de criativos.",
    features: [
      "Otimização automática de campanhas Meta & Google",
      "Análise de ROI em tempo real",
      "Agentes monitoram performance e budget",
      "Dashboard de analytics",
      "Billing engine integrado",
      "Demo interativa SaaS",
      "Webhook listener configurável",
    ],
    integrations: ["Stripe", "ClickBank", "Zapier", "HubSpot", "Meta Ads", "Google Ads"],
    pricing: [
      {
        name: "Starter",
        price: "R$497",
        period: "/mês",
        features: ["3 campanhas", "Dashboard básico", "1 plataforma", "Reports semanais"],
      },
      {
        name: "Growth",
        price: "R$1.997",
        period: "/mês",
        features: ["Campanhas ilimitadas", "Meta + Google", "Dashboard avançado", "Reports diários", "Auto-optimization"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "R$7.500+",
        period: "/mês",
        features: ["Tudo do Growth", "SLA dedicado", "Custom strategies", "Onboarding 1:1"],
      },
    ],
    color: "from-orange-400 to-red-500",
  },
  {
    id: "workflow-automation",
    name: "Workflow Automation Brain",
    shortName: "Workflow Automation",
    icon: Workflow,
    tagline: "Automatize processos entre múltiplos SaaS",
    description:
      "Agentes inteligentes criam triggers e ações automáticas entre suas ferramentas. Conecte Zapier, CRM, email e mais em workflows poderosos.",
    features: [
      "Automação de processos via Zapier e Webhooks",
      "Agents para triggers e ações em múltiplos SaaS",
      "Dashboard interativo",
      "Billing integrado",
      "Demo SaaS completa",
      "API key management",
      "Webhook listener configurável",
    ],
    integrations: ["Stripe", "ClickBank", "Zapier", "HubSpot", "Meta Ads", "Google Ads"],
    pricing: [
      {
        name: "Starter",
        price: "R$597",
        period: "/mês",
        features: ["5 workflows ativos", "Dashboard básico", "1 integração", "Suporte email"],
      },
      {
        name: "Growth",
        price: "R$2.497",
        period: "/mês",
        features: ["Workflows ilimitados", "Dashboard avançado", "Todas integrações", "Suporte prioritário", "Custom triggers"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "R$9.000+",
        period: "/mês",
        features: ["Tudo do Growth", "SLA dedicado", "Custom agents", "Onboarding 1:1"],
      },
    ],
    color: "from-pink-400 to-rose-500",
  },
];
