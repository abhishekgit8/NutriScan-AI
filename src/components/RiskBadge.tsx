"use client";

interface Props {
  score?: number;
  size?: "sm" | "md" | "lg";
}

function getGrade(score: number): { letter: string; color: string; bgColor: string; textColor: string } {
  if (score >= 80) return { letter: "A", color: "#006c49", bgColor: "rgba(16, 185, 129, 0.15)", textColor: "#00422b" };
  if (score >= 60) return { letter: "B", color: "#006c49", bgColor: "rgba(16, 185, 129, 0.1)", textColor: "#00422b" };
  if (score >= 40) return { letter: "C", color: "#855300", bgColor: "rgba(254, 166, 25, 0.15)", textColor: "#684000" };
  if (score >= 20) return { letter: "D", color: "#855300", bgColor: "rgba(254, 166, 25, 0.2)", textColor: "#684000" };
  return { letter: "E", color: "#bc0b3b", bgColor: "rgba(255, 120, 134, 0.15)", textColor: "#780021" };
}

export default function RiskBadge({ score, size = "md" }: Props) {
  const grade = getGrade(score || 50);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]}`}
        style={{ backgroundColor: grade.bgColor, color: grade.textColor }}
      >
        <span>{grade.letter}</span>
        {score !== undefined && <span className="opacity-70">({score}/100)</span>}
      </div>
    </div>
  );
}

// Score card widget matching the Stitch design
export function RiskScoreRing({ score }: { score: number }) {
  const grade = getGrade(score);

  return (
    <div
      className="flex items-center gap-4 rounded-xl p-4"
      style={{ backgroundColor: grade.bgColor, border: `1px solid ${grade.color}20` }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-xl shadow-md"
        style={{
          backgroundColor: grade.color,
          color: "#ffffff",
          width: "96px",
          height: "96px",
        }}
      >
        <span className="text-4xl font-extrabold leading-none" style={{ fontFamily: "Inter" }}>
          {grade.letter}
        </span>
        <span className="text-xs font-bold opacity-80">{score}/100</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1">
          <svg className="w-4 h-4" style={{ color: grade.color }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: grade.color }}>
            AI Summary
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--on-surface)" }}>
          {/* This will be populated by the parent component */}
        </p>
      </div>
    </div>
  );
}
