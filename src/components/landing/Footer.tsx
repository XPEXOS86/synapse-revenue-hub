import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="container px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <img src={logo} alt="Gold Mail Validator" className="h-5 w-5 rounded" />
          <span className="text-sm font-display font-medium">Gold Mail Validator</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 Gold Mail Validator. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
