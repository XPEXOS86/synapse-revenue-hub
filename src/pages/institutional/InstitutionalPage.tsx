import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import XpexLogo from "@/components/landing/XpexLogo";

interface InstitutionalPageProps {
  category: string;
  title: string;
  headline: string;
  content: string[];
}

const InstitutionalPage = ({ category, title, headline, content }: InstitutionalPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <XpexLogo className="w-7 h-7" />
            <span className="font-display font-bold text-base tracking-tight">Xpex Systems AI</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="max-w-[720px] mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{category}</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-3">{headline}</h1>
          <p className="text-sm text-muted-foreground mb-10">{title} — Xpex Systems AI</p>
          <div className="space-y-5">
            {content.map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstitutionalPage;
