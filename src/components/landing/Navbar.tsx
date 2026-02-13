import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-lg">Gayson</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="/#brains" className="hover:text-foreground transition-colors">Brains</a>
          <a href="/#agents" className="hover:text-foreground transition-colors">EdFunk Agents</a>
          <a href="/#integrations" className="hover:text-foreground transition-colors">Integrações</a>
        </div>
        <Button size="sm" className="font-semibold">
          Acessar
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
