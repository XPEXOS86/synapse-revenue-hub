import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import XpexLogo from "./XpexLogo";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <XpexLogo className="w-7 h-7" />
          <span className="font-display font-bold text-base tracking-tight">Xpex Systems AI</span>
        </Link>
        <div className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="/#product" className="hover:text-foreground transition-colors">Product</a>
          <Link to="/docs" className="hover:text-foreground transition-colors">API</Link>
          <a href="/#security" className="hover:text-foreground transition-colors">Security</a>
          <a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="/#company" className="hover:text-foreground transition-colors">Company</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Login
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="font-semibold">
              Start Free
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
