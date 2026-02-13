import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-lg">Gold Email Validator</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition-colors">Recursos</a>
          <a href="/#pricing" className="hover:text-foreground transition-colors">Preços</a>
          <a href="/#integrations" className="hover:text-foreground transition-colors">Integrações</a>
          <Link to="/docs" className="hover:text-foreground transition-colors">API Docs</Link>
        </div>
        <Link to="/auth">
          <Button size="sm" className="font-semibold">
            Começar grátis
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
