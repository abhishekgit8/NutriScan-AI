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
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <ol className="space-y-2">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-500">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed">{point}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
