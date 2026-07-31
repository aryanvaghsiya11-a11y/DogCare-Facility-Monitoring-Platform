import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-card border border-slate-200/80 bg-white shadow-card transition-shadow hover:shadow-lift",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <header className={clsx("flex items-center justify-between border-b border-slate-100 px-md py-sm", className)}>
      {children}
    </header>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("p-md", className)}>{children}</div>;
}
