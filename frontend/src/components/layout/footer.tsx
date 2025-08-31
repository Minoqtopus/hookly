import { Instagram, Twitter } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";

const links = {
  Product: [
    { name: "Demo", href: "/demo" },
    { name: "Pricing", href: "/pricing" },
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
  ],
  Legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-semibold">Hookly</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              AI-Powered Viral Content Generation
            </p>
          </div>
          {Object.entries(links).map(([title, linkItems]) => (
            <div key={title} className="flex flex-col gap-4">
              <h3 className="font-semibold text-sm">{title}</h3>
              <div className="flex flex-col gap-2">
                {linkItems.map((link) => (
                  <Link
                    href={link.href}
                    key={link.name}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-8 flex justify-center items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Hookly. All rights reserved.
          </p>
          {/* <div className="flex gap-4">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <Twitter className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <Instagram className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-youtube"
              >
                <path d="M10.7 8.5l3.8 2.2-3.8 2.2V8.5z" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
};
