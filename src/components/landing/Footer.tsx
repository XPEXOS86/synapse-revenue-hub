import { Link } from "react-router-dom";
import XpexLogo from "./XpexLogo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/overview" },
      { label: "API", href: "/api" },
      { label: "Bulk Validation", href: "/bulk-validation" },
      { label: "Pricing", href: "/pricing-info" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Security", href: "/security" },
      { label: "Enterprise", href: "/enterprise-solutions" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
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
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
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
