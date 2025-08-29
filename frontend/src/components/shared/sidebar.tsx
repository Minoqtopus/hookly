"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import { Logo } from "app/(public)/components/logo";
import {
    History,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Sparkles,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/generate", icon: Sparkles, label: "Generate" },
  { href: "/history", icon: History, label: "History" },
];

const settingsNav = [{ href: "/settings", icon: Settings, label: "Settings" }];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const NavLink = ({ href, icon: Icon, label }: (typeof navItems)[0]) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        pathname === href && "bg-secondary text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background/50 backdrop-blur-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border flex-col flex transition-transform transform",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          {/* Header */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Logo />
              <span>Hookly</span>
            </Link>
          </div>
          {/* Nav */}
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
          </div>
          {/* Footer */}
          <div className="mt-auto p-4 border-t">
            <div className="p-4 rounded-lg bg-secondary space-y-3">
              <div className="text-center text-sm">
                <p>
                  <span className="font-semibold">5 / 15</span> Generations Used
                </p>
                <Progress value={(5 / 15) * 100} className="mt-2 h-2" />
              </div>
              <Button size="sm" className="w-full">
                Upgrade to Pro
              </Button>
            </div>
            <div className="p-4 mt-4 rounded-lg bg-secondary">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  U
                </div>
                <div>
                  <p className="font-semibold">User</p>
                  <p className="text-xs text-muted-foreground">Trial Plan</p>
                </div>
                <button className="ml-auto text-muted-foreground hover:text-foreground">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
