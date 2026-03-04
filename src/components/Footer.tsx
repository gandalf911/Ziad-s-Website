const Footer = () => {
  return (
    <footer className="relative py-16 px-4">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-12 mb-16">
          <div>
            <h3 className="font-display text-2xl font-bold gradient-text mb-4">NEXUS</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Crafting next-generation digital experiences that push boundaries.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Navigate</h4>
            <ul className="space-y-3">
              {['Work', 'About', 'Services', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Connect</h4>
            <ul className="space-y-3">
              {['Twitter', 'GitHub', 'LinkedIn', 'Dribbble'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 NEXUS. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Built with Three.js & Anime.js
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
