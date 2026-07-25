"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ScanHistoryItem } from "@/types";
import { getHealthScoreBgColor } from "@/lib/utils";
import { History, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ProfilePageClient() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/scan");
      return;
    }

    if (isSignedIn) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          setHistory(data.history || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isLoaded, isSignedIn, router]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/user?id=${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {
      // silently fail
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 py-8 md:py-12">
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
          <h1 className="text-xl font-bold">Profile</h1>
          {user && (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.imageUrl}
                alt=""
                className="h-12 w-12 rounded-full"
              />
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {user.fullName || user.emailAddresses[0]?.emailAddress}
                </p>
                <p className="truncate text-sm text-[var(--text-secondary)]">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--text-secondary)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Scan History
            </h2>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--text-secondary)]">
              <p>No scans yet.</p>
              <Link
                href="/scan"
                className="mt-2 inline-block text-green-600 hover:underline"
              >
                Scan your first product
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3 transition hover:bg-[var(--bg-secondary)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${getHealthScoreBgColor(item.healthScore)}`}
                    >
                      {item.healthScore}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.productName}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {item.barcode} · {new Date(item.scannedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/scan?barcode=${item.barcode}`}
                      className="rounded-lg p-1.5 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
