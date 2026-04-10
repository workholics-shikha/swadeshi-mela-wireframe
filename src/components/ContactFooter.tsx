import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

const ContactFooter = () => (
  <>
    <section id="contact" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Get in Touch</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">Contact Us</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Phone, label: "Phone", value: "+91 12345 67890", href: "tel:+911234567890" },
            { icon: Mail, label: "Email", value: "info@swadeshimela.in", href: "mailto:info@swadeshimela.in" },
            { icon: MapPin, label: "Office", value: "Pragati Maidan, New Delhi – 110001" },
          ].map((c, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-card text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <c.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{c.label}</p>
              {c.href ? (
                <a href={c.href} className="font-display font-semibold text-foreground hover:text-primary transition-colors">
                  {c.value}
                </a>
              ) : (
                <p className="font-display font-semibold text-foreground text-sm">{c.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    <footer className="bg-foreground py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Swadeshi Mela" className="h-10 w-10" />
            <span className="font-display text-xl font-bold text-cream">Swadeshi Mela</span>
          </div>
          <div className="flex gap-4">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors">
                <Icon className="w-5 h-5 text-cream" />
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-cream/10 text-center">
          <p className="text-cream/50 text-sm">© 2026 Swadeshi Mela. All rights reserved. Made with ❤️ in India.</p>
        </div>
      </div>
    </footer>
  </>
);

export default ContactFooter;
