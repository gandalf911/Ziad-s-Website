const Footer = () => {
  return (
    <footer className="relative py-16 px-4">
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />

      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-12 mb-16">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 tracking-tight">SYSTEMS_</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Automation & App Development — engineered for scale.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-4 text-xs uppercase tracking-[0.2em]">Navigate</h4>
            <ul className="space-y-3">
              {[
                { label: 'Services', href: '#services' },
                { label: 'Process', href: '#process' },
                { label: 'Contact', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-4 text-xs uppercase tracking-[0.2em]">Connect</h4>
            <ul className="space-y-3">
              {['LinkedIn', 'GitHub', 'Email'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © 2026 SYSTEMS_. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
