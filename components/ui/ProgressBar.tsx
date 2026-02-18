"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
}

export default function ProgressBar({
  current,
  total,
  color = "bg-green-400",
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className="w-full">
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-center font-body text-sm text-gray-500 mt-1">
        {current}/{total}
      </p>
    </div>
  );
}
