"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const routes = [
  { name: "Pricing", href: "/pricing" },
  { name: "Demo", href: "/demo" },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
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
            className="px-4 py-1.5 text-sm rounded-full"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.5 text-sm rounded-full bg-primary text-primary-foreground"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};
