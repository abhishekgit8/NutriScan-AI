"use client";

import { getHealthScoreColor, getHealthScoreLabel } from "@/lib/utils";

interface Props {
  score: number;
  size?: number;
}

export default function HealthScoreRing({ score, size = 180 }: Props) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const label = getHealthScoreLabel(score);
  const color = getHealthScoreColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
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
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            / 100
          </span>
        </div>
      </div>
      <span
        className="mt-2 rounded-full px-3 py-1 text-xs font-medium"
        style={{
          backgroundColor: `${color}15`,
          color: color,
        }}
      >
        {label}
      </span>
    </div>
  );
}
