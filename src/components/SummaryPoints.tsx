interface Props {
  points: string[];
  title?: string;
}

export default function SummaryPoints({
  points,
  title = "Key Insights",
}: Props) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {title}
      </h3>
      <ol className="space-y-2.5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed">{point}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
