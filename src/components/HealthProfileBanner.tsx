"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef, useMemo } from "react";
import { HealthTag } from "@/types";
import { getHealthTagLabel } from "@/lib/utils";
import { Shield, X } from "lucide-react";
import Link from "next/link";

function getInitialTags(): HealthTag[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("healthTags");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function HealthProfileBanner() {
  const { isSignedIn } = useUser();
  const [tags, setTags] = useState<HealthTag[]>(getInitialTags);
  const [expanded, setExpanded] = useState(false);
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current || !isSignedIn) return;
    synced.current = true;

    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile?.healthTags) {
          setTags(data.profile.healthTags);
          localStorage.setItem("healthTags", JSON.stringify(data.profile.healthTags));
        }
      })
      .catch(() => {});
  }, [isSignedIn]);

  const removeTag = (tag: HealthTag) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    localStorage.setItem("healthTags", JSON.stringify(next));
    if (isSignedIn) {
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_health_tags", healthTags: next }),
      });
    }
  };

  const displayTags = useMemo(
    () => (expanded ? tags : tags.slice(0, 4)),
    [tags, expanded]
  );
  const remaining = tags.length - displayTags.length;

  if (tags.length === 0) {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-full border border-dashed border-green-300 bg-green-50/50 px-4 py-2 text-xs font-medium text-green-700 transition hover:bg-green-50 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/40"
      >
        <Shield className="h-3.5 w-3.5" />
        Set up your health profile for personalized alerts
      </Link>
    );
  }

  return (
    <div className="animate-slide-down w-full rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 dark:border-green-900 dark:bg-green-950/20">
      <div className="flex items-center gap-2">
        <Shield className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
        <span className="text-xs font-medium text-green-700 dark:text-green-400">
          Active Filters:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300"
            >
              {getHealthTagLabel(tag)}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeTag(tag);
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-green-200 dark:hover:bg-green-800"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          {!expanded && remaining > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400"
            >
              +{remaining} more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
