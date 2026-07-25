"use client";

import { getHealthScoreColor, getHealthScoreLabel } from "@/lib/utils";

interface Props {
  score: number;
  size?: number;
}

export default function HealthScoreRing({ score, size = 200 }: Props) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = getHealthScoreColor(score);
  const label = getHealthScoreLabel(score);

  const strokeColor =
    score >= 80
      ? "#22c55e"
      : score >= 70
        ? "#3b82f6"
        : score >= 50
          ? "#eab308"
          : score >= 30
            ? "#f97316"
            : "#ef4444";

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
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${colorClass}`}>{score}</span>
          <span className="text-sm text-[var(--text-secondary)]">
            out of 100
          </span>
        </div>
      </div>
      <span
        className={`mt-2 rounded-full px-3 py-1 text-sm font-medium ${
          score >= 80
            ? "bg-green-500/10 text-green-500"
            : score >= 70
              ? "bg-blue-500/10 text-blue-500"
              : score >= 50
                ? "bg-yellow-500/10 text-yellow-500"
                : score >= 30
                  ? "bg-orange-500/10 text-orange-500"
                  : "bg-red-500/10 text-red-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
