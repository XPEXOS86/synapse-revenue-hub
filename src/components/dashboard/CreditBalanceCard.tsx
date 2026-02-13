import { motion } from "framer-motion";
import { Coins, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CreditBalanceCard = () => {
  const [balance, setBalance] = useState(0);
  const [totalUsed, setTotalUsed] = useState(0);
  const [totalPurchased, setTotalPurchased] = useState(0);

  useEffect(() => {
    const fetchCredits = async () => {
      const { data } = await supabase
        .from("credits")
        .select("balance, total_used, total_purchased")
        .limit(1)
        .maybeSingle();
      if (data) {
        setBalance(data.balance);
        setTotalUsed(data.total_used);
        setTotalPurchased(data.total_purchased);
      }
    };
    fetchCredits();
  }, []);

  const usedPercent = totalPurchased > 0 ? Math.round((totalUsed / totalPurchased) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-card rounded-xl border border-primary/30 p-6 shadow-glow"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Saldo de Créditos
        </h3>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="text-center py-4">
        <motion.div
          key={balance}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold text-primary font-display"
        >
          {balance.toLocaleString()}
        </motion.div>
        <p className="text-sm text-muted-foreground mt-1">créditos disponíveis</p>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Consumo total</span>
          <span>{totalUsed.toLocaleString()} / {totalPurchased.toLocaleString()}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usedPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{usedPercent}% consumido</p>
      </div>
    </motion.div>
  );
};

export default CreditBalanceCard;
