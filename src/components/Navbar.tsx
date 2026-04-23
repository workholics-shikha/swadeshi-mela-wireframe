import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/#about" },
  { label: "Gallery", to: "/#gallery" },
  { label: "Stalls", to: "/#stalls" },
  { label: "Event Details", to: "/#event" },
  { label: "FAQ", to: "/#faq" },
  { label: "Contact", to: "/#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Swadeshi Mela" className="h-10 w-10 md:h-12 md:w-12" />
          <span className="font-display text-xl md:text-2xl font-bold text-gradient-festive">
            Swadeshi Mela
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((l) => (
            // <Link
            //   key={l.to}
            //   to={l.to}
            //   className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            // >
            //   {l.label}
            // </Link>
            <Link
              key={l.to}
              to="/"
              onClick={() => {
                if (l.to !== "/") {
                  setTimeout(() => {
                    const id = l.to.replace("/#", "");
                    const el = document.getElementById(id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 100);
                }
              }}
            > {l.label} </Link>
          ))}
          <Link
            to="/login"
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Vendor Login
          </Link>
          {/* <Link
            to="/login?redirect=admin"
            className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Admin Panel
          </Link> */}
          <Link
            to="/book-stall"
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Book a Stall
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-card border-t border-border">
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
              onClick={() => setOpen(false)}
            >
              Vendor Login
            </Link>
            <Link
              to="/login?redirect=admin"
              className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
              onClick={() => setOpen(false)}
            >
              Admin Panel
            </Link>
            <Link
              to="/book-stall"
              className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm text-center"
              onClick={() => setOpen(false)}
            >
              Book a Stall
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

