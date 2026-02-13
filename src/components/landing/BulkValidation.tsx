import { motion } from "framer-motion";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const pieData = [
  { label: "Valid", pct: 72, color: "hsl(var(--primary))" },
  { label: "Risky", pct: 18, color: "hsl(var(--warning))" },
  { label: "Invalid", pct: 10, color: "hsl(var(--destructive))" },
];

const BulkValidation = () => {
  return (
    <section className="py-24 bg-card/20">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bulk Email Cleaning at Scale</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload large datasets and receive structured intelligence reports with risk segmentation and scoring distribution.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Visual chart representation */}
          <div className="rounded-xl border border-border/50 bg-gradient-card p-8">
            <p className="text-sm font-medium mb-6">Validation Results Overview</p>
            <div className="flex items-center gap-8">
              {/* Simple pie visual */}
              <div className="relative w-32 h-32 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="12"
                    strokeDasharray={`${72 * 2.51} ${100 * 2.51}`} strokeLinecap="round" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--warning))" strokeWidth="12"
                    strokeDasharray={`${18 * 2.51} ${100 * 2.51}`} strokeDashoffset={`${-72 * 2.51}`} strokeLinecap="round" />
                </svg>
              </div>
              <div className="space-y-3">
                {pieData.map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-muted-foreground">{d.label}</span>
                    <span className="text-sm font-medium ml-auto">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-border/50 bg-gradient-card p-8 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium mb-2">Export & Integrate</p>
              <p className="text-sm text-muted-foreground mb-6">
                Download clean lists or export directly to your CRM. Create segmented audiences based on validation results.
              </p>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="w-4 h-4" /> Download Clean List
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Upload className="w-4 h-4" /> Export to CRM
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BulkValidation;
