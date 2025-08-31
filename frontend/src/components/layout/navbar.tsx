"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const routes = [
  { name: "Pricing", href: "/pricing" },
  { name: "Demo", href: "/demo" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <div className="flex items-center gap-4 bg-background/60 backdrop-blur-md border rounded-full p-2">
          <Link href="/" className="flex items-center gap-2 px-3">
            <Logo />
            <span className="font-semibold">Hookly</span>
          </Link>
          <div className="flex items-center gap-2">
            {routes.map((route) => (
              <Link
                href={route.href}
                key={route.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-colors",
                  pathname === route.href
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/60"
                )}
              >
                {route.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm rounded-full hover:bg-secondary/60 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 text-sm rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-background/95 backdrop-blur-md border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
              <Logo />
              <span className="font-semibold text-lg">Hookly</span>
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-secondary/60 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="border-t bg-background/95 backdrop-blur-md">
              <div className="px-4 py-3 space-y-2">
                {routes.map((route) => (
                  <Link
                    href={route.href}
                    key={route.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "block px-3 py-2 text-sm rounded-lg transition-colors",
                      pathname === route.href
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-secondary/60"
                    )}
                  >
                    {route.name}
                  </Link>
                ))}
                <div className="pt-2 border-t space-y-2">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-sm rounded-lg hover:bg-secondary/60 transition-colors text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for mobile to prevent content overlap */}
      <div className="h-[60px] md:hidden" />
    </>
  );
};
