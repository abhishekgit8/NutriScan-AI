export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="skeleton h-40 w-40 rounded-full" />
        <div className="skeleton h-6 w-32 rounded-full" />
      </div>
      <div className="mt-6 space-y-3">
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-5/6 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="skeleton h-24 rounded-xl" />
        <div className="skeleton h-24 rounded-xl" />
      </div>
      <div className="mt-6 space-y-2">
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-4/5 rounded-full" />
        <div className="skeleton h-3 w-2/3 rounded-full" />
      </div>
    </div>
  );
}
