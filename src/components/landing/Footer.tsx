import { Link } from "react-router-dom";
import XpexLogo from "./XpexLogo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/#product" },
      { label: "API", href: "/docs" },
      { label: "Bulk Validation", href: "/#product" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#company" },
      { label: "Security", href: "/#security" },
      { label: "Enterprise", href: "/#pricing" },
      { label: "Contact", href: "/#company" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid sm:grid-cols-4 gap-10 mb-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <XpexLogo className="w-5 h-5" />
              <span className="font-display font-bold text-sm">Xpex Systems AI</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Enterprise email intelligence infrastructure.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/30 pt-6">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Xpex Systems AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
