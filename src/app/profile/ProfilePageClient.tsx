"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ScanHistoryItem, HealthTag, HEALTH_TAG_GROUPS } from "@/types";
import { getRiskTierConfig, getHealthScoreBgColor } from "@/lib/utils";
import { History, Trash2, ExternalLink, Shield, Save } from "lucide-react";
import Link from "next/link";

export default function ProfilePageClient() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<HealthTag[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
          if (data.profile?.healthTags) {
            setSelectedTags(data.profile.healthTags);
          } else {
            const stored = localStorage.getItem("healthTags");
            if (stored) {
              try {
                setSelectedTags(JSON.parse(stored));
              } catch {}
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isLoaded, isSignedIn, router]);

  const toggleTag = (tag: HealthTag) => {
    setSaved(false);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveTags = async () => {
    setSaving(true);
    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_health_tags",
          healthTags: selectedTags,
          email: user?.emailAddresses?.[0]?.emailAddress || "",
          displayName: user?.fullName || "",
        }),
      });
      localStorage.setItem("healthTags", JSON.stringify(selectedTags));
      setSaved(true);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/user?id=${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {}
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 py-8 md:py-12">
        {/* User info */}
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

        {/* Health Profile Tags */}
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Health Profile
            </h2>
          </div>

          <p className="mb-4 text-xs text-[var(--text-secondary)]">
            Select your health conditions and dietary needs. Products will be analyzed against these filters.
          </p>

          <div className="space-y-4">
            {Object.entries(HEALTH_TAG_GROUPS).map(([group, tags]) => (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold text-[var(--text)]">
                  {group}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(({ tag, label }) => {
                    const isActive = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                          isActive
                            ? "bg-green-600 text-white shadow-sm"
                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-[var(--bg-secondary)] dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSaveTags}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
            </button>
            {selectedTags.length > 0 && (
              <span className="text-xs text-[var(--text-secondary)]">
                {selectedTags.length} filter{selectedTags.length > 1 ? "s" : ""} active
              </span>
            )}
          </div>
        </div>

        {/* Scan History */}
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
              {history.map((item) => {
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
                              {riskConfig.emoji}
                            </span>
                          )}
                        </div>
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
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
