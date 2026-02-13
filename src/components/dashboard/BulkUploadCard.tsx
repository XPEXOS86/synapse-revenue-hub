import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BulkUploadCard = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const validFormats = ["text/csv", "text/plain", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
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
    // Simulated upload — real implementation would call bulk edge function
    await new Promise((r) => setTimeout(r, 2000));
    toast.success("Upload concluído! Processamento iniciado.");
    setFile(null);
    setUploading(false);
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

      {file && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
          <Button onClick={handleUpload} disabled={uploading} className="w-full gap-2">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Iniciar Validação em Massa
              </>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BulkUploadCard;
