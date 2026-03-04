import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { toast } from 'sonner';

const ContactSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated.current) {
            animated.current = true;
            anime({
              targets: sectionRef.current?.querySelectorAll('.contact-el'),
              translateY: [40, 0],
              opacity: [0, 1],
              delay: anime.stagger(120),
              duration: 1200,
              easing: 'easeOutExpo',
            });
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    toast.success('Message received — we\'ll be in touch.');
    setForm({ name: '', email: '', message: '' });
  };

  const inputClass =
    'w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors';

  return (
    <section id="contact" ref={sectionRef} className="py-32 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
        {/* Left — CTA */}
        <div>
          <p className="contact-el opacity-0 text-primary text-xs tracking-[0.3em] uppercase mb-4">
            Contact
          </p>
          <h2 className="contact-el opacity-0 text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Let's build something.
          </h2>
          <p className="contact-el opacity-0 text-muted-foreground text-sm leading-relaxed mb-10 max-w-sm">
            Have a project in mind? Tell us about it — or skip straight to a conversation.
          </p>
          <a
            href="#"
            className="contact-el opacity-0 inline-block px-8 py-3 border border-primary text-primary font-semibold text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Book a Call →
          </a>
        </div>

        {/* Right — Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="contact-el opacity-0">
            <input
              type="text"
              placeholder="Name"
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="contact-el opacity-0">
            <input
              type="email"
              placeholder="Email"
              maxLength={255}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="contact-el opacity-0">
            <textarea
              placeholder="Tell us about your project"
              maxLength={1000}
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="contact-el opacity-0">
            <button
              type="submit"
              className="w-full px-8 py-3 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
