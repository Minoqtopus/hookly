"use client";

import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import { useAuth } from "@/domains/auth";
import { Logo } from "./logo";
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
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/generate", icon: Sparkles, label: "Generate" },
  { href: "/history", icon: History, label: "History" },
];

const settingsNav = [{ href: "/settings", icon: Settings, label: "Settings" }];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, remainingGenerations, logout, isLoading, getCurrentUser } =
    useAuth();

  // Debug: Log when remainingGenerations changes
  useEffect(() => {
    console.log(
      "📊 Sidebar: remainingGenerations updated to:",
      remainingGenerations
    );
  }, [remainingGenerations]);

  const handleLogout = async () => {
    await logout();
  };

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
          "fixed inset-y-0 left-0 z-40 w-72 bg-background border-r border-border flex-col flex transition-transform transform",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          {/* Header */}
          <div className="flex h-16 items-center border-b px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
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
            <div
              className="p-4 rounded-lg bg-secondary space-y-3"
              key={`generations-${remainingGenerations}-${
                user?.trial_generations_used || 0
              }`}
            >
              <div className="text-center text-sm mb-4">
                {remainingGenerations > 0 ? (
                  <>
                    <p>
                      <span className="font-semibold text-primary">
                        {remainingGenerations}
                      </span>{" "}
                      Generation{remainingGenerations === 1 ? "" : "s"} Left
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user?.trial_generations_used || 0} /{" "}
                      {(user?.trial_generations_used || 0) +
                        remainingGenerations}{" "}
                      Used
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white font-semibold">Trial Complete</p>
                    <p className="text-xs text-white mt-1">
                      {user?.trial_generations_used || 0} /{" "}
                      {user?.trial_generations_used || 0} Scripts Generated
                    </p>
                  </>
                )}
                {/* <Progress
                  value={Math.min(
                    100,
                    Math.max(
                      0,
                      ((user?.trial_generations_used || 0) /
                        Math.max(
                          1,
                          (user?.trial_generations_used || 0) +
                            remainingGenerations
                        )) *
                        100
                    )
                  )}
                  className="mt-2 h-2"
                /> */}
              </div>
              <Link href="/pricing" target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  className={cn(
                    "w-full transition-all duration-200",
                    remainingGenerations === 0
                      ? "bg-white text-black hover:bg-gray-50 shadow-lg font-semibold border border-gray-200"
                      : "bg-white text-black hover:bg-gray-50 border border-gray-200"
                  )}
                >
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
            <div className="p-4 mt-4 rounded-lg bg-secondary">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm truncate"
                    title={
                      user?.first_name || user?.email?.split("@")[0] || "User"
                    }
                  >
                    {user?.first_name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.plan === "trial"
                      ? "Trial Plan"
                      : user?.plan === "starter"
                      ? "Starter Plan"
                      : user?.plan === "pro"
                      ? "Pro Plan"
                      : "Trial Plan"}
                  </p>
                </div>
                <button
                  className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors rounded-md hover:bg-background/50"
                  onClick={handleLogout}
                  disabled={isLoading}
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
