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

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          {user && (
            <div className="mt-4 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.imageUrl}
                alt=""
                className="h-16 w-16 rounded-full"
              />
              <div>
                <p className="font-medium">
                  {user.fullName || user.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Scan History</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-[var(--text-secondary)]">
              <p>No scans yet.</p>
              <Link
                href="/scan"
                className="mt-2 inline-block text-indigo-500 hover:underline"
              >
                Scan your first product
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4 transition hover:bg-[var(--bg-secondary)]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white ${getHealthScoreBgColor(item.healthScore)}`}
                    >
                      {item.healthScore}
                    </div>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {item.barcode} &middot;{" "}
                        {new Date(item.scannedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/scan?barcode=${item.barcode}`}
                      className="rounded-lg p-2 transition hover:bg-[var(--bg-secondary)]"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
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
