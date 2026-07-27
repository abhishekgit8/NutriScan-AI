"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HealthProfileBanner from "@/components/HealthProfileBanner";
import { ScanHistoryItem, RiskTier } from "@/types";
import { getRiskTierConfig, getHealthScoreBgColor } from "@/lib/utils";
import { Search, Filter, ExternalLink, Trash2, LayoutDashboard } from "lucide-react";
import Link from "next/link";

type FilterTier = "all" | RiskTier;

export default function DashboardPageClient() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTier>("all");

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
    } catch {}
  };

  const filtered = history.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.barcode.includes(search);
    const matchesFilter = filter === "all" || item.riskTier === filter;
    return matchesSearch && matchesFilter;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, ScanHistoryItem[]>>((acc, item) => {
    const date = new Date(item.scannedAt).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const tierCounts = {
    all: history.length,
    safe: history.filter((h) => h.riskTier === "safe").length,
    caution: history.filter((h) => h.riskTier === "caution").length,
    high_risk: history.filter((h) => h.riskTier === "high_risk").length,
  };

  const filterOptions: { id: FilterTier; label: string; count: number }[] = [
    { id: "all", label: "All", count: tierCounts.all },
    { id: "safe", label: "\u{1F7E2} Safe", count: tierCounts.safe },
    { id: "caution", label: "\u{1F7E1} Caution", count: tierCounts.caution },
    { id: "high_risk", label: "\u{1F534} High Risk", count: tierCounts.high_risk },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 py-8 md:py-12">
        <div className="mb-6 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-green-600" />
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>

        <div className="mb-4">
          <HealthProfileBanner />
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scans..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-[var(--bg-secondary)] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === opt.id
                  ? "bg-green-600 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-[var(--bg-secondary)] dark:text-gray-400"
              }`}
            >
              {opt.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                filter === opt.id ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"
              }`}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-12 text-center">
            <Filter className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-[var(--text-secondary)]">
              {search || filter !== "all" ? "No matching scans" : "No scans yet"}
            </p>
            {!search && filter === "all" && (
              <Link
                href="/scan"
                className="mt-2 inline-block text-sm text-green-600 hover:underline"
              >
                Scan your first product
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {date}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => {
                    const riskConfig = item.riskTier ? getRiskTierConfig(item.riskTier) : null;
                    return (
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
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">
                                {item.productName}
                              </p>
                              {riskConfig && (
                                <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${riskConfig.badgeClass}`}>
                                  {riskConfig.emoji} {riskConfig.label}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {item.barcode}
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
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
