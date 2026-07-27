"use client";

import { RiskTier } from "@/types";
import { getRiskTierConfig } from "@/lib/utils";

interface Props {
  tier: RiskTier;
  score?: number;
  size?: "sm" | "md" | "lg";
}

export default function RiskBadge({ tier, score, size = "md" }: Props) {
  const config = getRiskTierConfig(tier);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]} ${config.badgeClass}`}
      >
        <span>{config.emoji}</span>
        <span>{config.label}</span>
      </div>
      {score !== undefined && (
        <span className="text-xs text-[var(--text-secondary)]">
          Score: {score}/100
        </span>
      )}
    </div>
  );
}

// Visual ring version for the scan results page
export function RiskScoreRing({ tier, score }: { tier: RiskTier; score: number }) {
  const config = getRiskTierConfig(tier);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[180px] w-[180px]">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color: config.color }}>
            {score}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">/ 100</span>
        </div>
      </div>
      <span
        className="mt-2 rounded-full px-3 py-1 text-xs font-semibold"
        style={{
          backgroundColor: `${config.color}15`,
          color: config.color,
        }}
      >
        {config.emoji} {config.label}
      </span>
    </div>
  );
}
