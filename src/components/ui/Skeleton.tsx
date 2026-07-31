import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:400px_100%] animate-shimmer",
        className,
      )}
    />
  );
}
