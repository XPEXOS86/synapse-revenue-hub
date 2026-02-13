import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  delay?: number;
}

const AnimatedNumber = ({ target }: { target: number }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const mv = { v: 0 };
    const ctrl = animate(mv, { v: target }, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: () => setDisplay(Math.round(mv.v)),
    });
    return () => ctrl.stop();
  }, [target]);

  return <>{display.toLocaleString()}</>;
};

const MetricCard = ({ title, value, change, trend, icon: Icon, delay = 0 }: MetricCardProps) => {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const isNumeric = !isNaN(numericValue) && value !== "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -2, boxShadow: "var(--shadow-glow)" }}
      className="bg-gradient-card rounded-xl border border-border/50 p-5 transition-colors hover:border-primary/20"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: "spring" }}
          className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"
        >
          <Icon className="h-4 w-4 text-primary" />
        </motion.div>
      </div>
      <div className="text-2xl font-bold mb-1">
        {isNumeric ? <AnimatedNumber target={numericValue} /> : value}
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
          {trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {change} vs mês anterior
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;
