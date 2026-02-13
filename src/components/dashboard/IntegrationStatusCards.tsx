import { motion } from "framer-motion";
import { CreditCard, Zap, Share2, BarChart3, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const integrations = [
  { name: "Stripe", icon: CreditCard, status: "planned", color: "text-purple-400" },
  { name: "Zapier", icon: Zap, status: "planned", color: "text-amber-400" },
  { name: "Make", icon: Share2, status: "planned", color: "text-violet-400" },
  { name: "Meta Ads", icon: Target, status: "planned", color: "text-blue-400" },
  { name: "Google Ads", icon: BarChart3, status: "planned", color: "text-green-400" },
  { name: "HubSpot", icon: Users, status: "planned", color: "text-orange-400" },
];

const IntegrationStatusCards = () => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-gradient-card rounded-xl border border-border/50 p-6"
  >
    <h3 className="font-semibold text-lg mb-4">Integrações</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {integrations.map((int, i) => (
        <motion.div
          key={int.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-muted/20 hover:border-primary/20 transition-colors"
        >
          <int.icon className={`h-4 w-4 ${int.color} shrink-0`} />
          <span className="text-sm font-medium truncate">{int.name}</span>
          <Badge variant="outline" className="ml-auto text-[10px] shrink-0 px-1.5">
            {int.status === "active" ? "ON" : "Soon"}
          </Badge>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default IntegrationStatusCards;
