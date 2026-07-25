"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { UserButton, useUser } from "@clerk/nextjs";
import { Moon, Sun, Scan, User } from "lucide-react";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { isSignedIn } = useUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white">
            <Scan className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">
            Nutri<span className="text-indigo-500">Scan</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/scan"
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
          >
            Scan Product
          </Link>

          <button
            onClick={toggle}
            className="rounded-lg p-2 transition hover:bg-[var(--bg-secondary)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {isSignedIn ? (
            <UserButton />
          ) : (
            <Link
              href="/scan"
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition hover:bg-[var(--bg-secondary)]"
            >
              <User className="h-4 w-4" />
              Guest
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
