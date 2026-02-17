import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Loader2, CheckCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface BulkResult {
  job_id: string;
  status: string;
  total_emails: number;
  valid: number;
  invalid: number;
  catch_all: number;
  risky: number;
  average_score: number;
}

const BulkUploadCard = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [progress, setProgress] = useState(0);

  const validExtensions = [".csv", ".txt", ".xlsx"];

  const handleFile = useCallback((f: File) => {
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      toast.error("Formato não suportado. Use CSV, TXT ou XLSX.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 50MB.");
      return;
    }
    setFile(f);
    setResult(null);
    toast.success(`Arquivo "${f.name}" selecionado`);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Faça login para usar validação em massa");
        setUploading(false);
        return;
      }

      setProgress(30);

      // Read file content and send as JSON array
      const text = await file.text();
      const emails = text
        .split(/[\n\r,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0 && e.includes("@"));

      if (emails.length === 0) {
        toast.error("Nenhum email válido encontrado no arquivo");
        setUploading(false);
        setProgress(0);
        return;
      }

      setProgress(50);

      const res = await fetch(`${SUPABASE_URL}/functions/v1/bulk-validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          emails,
          file_name: file.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao processar");
        setUploading(false);
        setProgress(0);
        return;
      }

      // Job queued - poll for completion
      setProgress(50);
      toast.info(`Job criado! Processando ${data.total_emails} emails...`);

      const jobId = data.job_id;
      let completed = false;
      for (let attempt = 0; attempt < 120; attempt++) {
        await new Promise((r) => setTimeout(r, 3000));
        const pollRes = await fetch(
          `${SUPABASE_URL}/functions/v1/bulk-validate?job_id=${jobId}`,
          {
            headers: { "Authorization": `Bearer ${session.access_token}` },
          }
        );
        if (!pollRes.ok) continue;
        const job = await pollRes.json();
        const pct = job.total_emails > 0
          ? Math.round(50 + (job.processed / job.total_emails) * 45)
          : 50;
        setProgress(Math.min(pct, 95));

        if (job.status === "completed") {
          setResult({
            job_id: job.id,
            status: "completed",
            total_emails: job.total_emails,
            valid: job.valid_count,
            invalid: job.invalid_count,
            catch_all: job.catch_all_count,
            risky: job.risky_count,
            average_score: 0,
          });
          setProgress(100);
          toast.success(`${job.total_emails} emails validados!`);
          setFile(null);
          completed = true;
          break;
        } else if (job.status === "failed") {
          toast.error(job.last_error || "Job falhou");
          setProgress(0);
          completed = true;
          break;
        }
      }

      if (!completed) {
        toast.info("Job ainda em processamento. Verifique depois.");
      }
    } catch {
      toast.error("Erro de conexão");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-card rounded-xl border border-border/50 p-6"
    >
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Upload className="h-5 w-5 text-primary" />
        Validação em Massa
      </h3>

      {/* Result summary */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-lg border border-primary/20 bg-primary/5"
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Resultado</span>
              <Badge variant="outline" className="ml-auto text-xs">{result.total_emails} emails</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Válidos</span>
                <span className="font-medium text-emerald-400">{result.valid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inválidos</span>
                <span className="font-medium text-red-400">{result.invalid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Catch-all</span>
                <span className="font-medium text-amber-400">{result.catch_all}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risco</span>
                <span className="font-medium text-orange-400">{result.risky}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border/30 flex justify-between text-sm">
              <span className="text-muted-foreground">Score médio</span>
              <span className="font-bold text-primary">{result.average_score}/100</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border/50 hover:border-primary/30"
        }`}
        onClick={() => {
          if (uploading) return;
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".csv,.txt,.xlsx";
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) handleFile(f);
          };
          input.click();
        }}
      >
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <FileText className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
              >
                <X className="h-3 w-3 mr-1" /> Remover
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Arraste sua lista de emails</p>
                <p className="text-xs text-muted-foreground mt-1">CSV, TXT ou XLSX · Máx 50MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      {uploading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">{progress}% processando...</p>
        </motion.div>
      )}

      {file && !uploading && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
          <Button onClick={handleUpload} className="w-full gap-2">
            <CheckCircle className="h-4 w-4" />
            Iniciar Validação em Massa
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BulkUploadCard;
