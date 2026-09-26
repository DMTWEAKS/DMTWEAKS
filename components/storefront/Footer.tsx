import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/store", label: "Products" },
  { href: "/policy", label: "Policy" },
  { href: "https://discord.gg/PwxWSsZzUP", label: "Discord" },
];

const Footer = () => {
  return (
    <footer className="py-5 px-4 border-t relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DM Tweaks. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="https://jupiterax.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Crafted by Jupiterax
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer
