"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ScanBarcode, Clock, Heart, User } from "lucide-react";

const navItems = [
  { href: "/scan", icon: ScanBarcode, label: "Scan" },
  { href: "/dashboard", icon: Clock, label: "History" },
  { href: "/profile", icon: Heart, label: "Favorites" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-6 pb-2 pt-2"
      style={{
        backgroundColor: "rgba(248, 249, 255, 0.9)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--outline-variant)",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.04)",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className="flex flex-col items-center justify-center transition-all active:scale-90"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: isActive ? "var(--primary-container)" : "transparent",
              color: isActive ? "var(--on-primary-container)" : "var(--on-surface-variant)",
            }}
          >
            <Icon className="h-6 w-6" />
          </Link>
        );
      })}
    </nav>
  );
}
