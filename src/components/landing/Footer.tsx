import { Brain } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="container px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-display font-medium">Gayson Full Edition</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 Gayson. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
