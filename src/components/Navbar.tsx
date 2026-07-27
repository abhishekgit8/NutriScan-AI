"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { UserButton, useUser } from "@clerk/nextjs";
import { Moon, Sun, Leaf, User, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { isSignedIn } = useUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/80 backdrop-blur-md dark:bg-[var(--bg)]/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <span className="text-lg font-bold tracking-tight">
            NutriScan
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/scan"
            className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
          >
            Scan
          </Link>

          {isSignedIn && (
            <Link
              href="/dashboard"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 sm:flex"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          )}

          <button
            onClick={toggle}
            className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          ) : (
            <Link
              href="/scan"
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <User className="h-3.5 w-3.5" />
              Guest
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
