import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title?: string | undefined;
  subtitle?: string | undefined;
  right?: ReactNode;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section className={cn("panel p-5", className)}>
      {(title || right) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-tight">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="panel px-4 py-3">
      <p className="stat-label">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-xl font-semibold tabular-nums",
          accent && "text-emerald-hi",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Bar({
  value,
  max = 100,
  tone = "emerald",
  label,
}: {
  value: number;
  max?: number;
  tone?: "emerald" | "warn" | "muted";
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{label}</span>
          <span className="tabular-nums text-foreground">{Math.round(value)}</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            tone === "emerald" && "bg-emerald-hi",
            tone === "warn" && "bg-warn",
            tone === "muted" && "bg-muted-foreground",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Chip({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "emerald" | "muted" | "gold" | "bad";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        tone === "emerald" && "emerald-chip",
        tone === "muted" && "border border-border bg-secondary text-muted-foreground",
        tone === "gold" && "border border-gold/40 bg-gold/15 text-gold",
        tone === "bad" && "border border-destructive/40 bg-destructive/15 text-destructive",
      )}
    >
      {children}
    </span>
  );
}

export function ActionButton({
  children,
  onClick,
  disabled,
  variant = "solid",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "solid" | "ghost" | "danger";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40",
        variant === "solid" &&
          "bg-emerald-hi text-primary-foreground hover:brightness-110 active:scale-[0.98]",
        variant === "ghost" &&
          "border border-border bg-secondary text-foreground hover:border-emerald-hi/50 hover:text-emerald-hi",
        variant === "danger" &&
          "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
        className,
      )}
    >
      {children}
    </button>
  );
}
