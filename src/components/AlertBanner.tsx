import { AlertTriangle } from "lucide-react";

interface Props {
  message: string;
}

export default function AlertBanner({ message }: Props) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <div>
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Health Alert
        </p>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
          {message}
        </p>
      </div>
    </div>
  );
}
