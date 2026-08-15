import { AnimatePresence, motion } from "framer-motion";
import { CLASS_META, type Alert } from "@/lib/acoustic/types";
import { fmtTime } from "@/lib/acoustic/data";
import { Waveform, useReducedMotion } from "./Waveform";
import { cn } from "@/lib/utils";

export function AlertRow({
  alert,
  onSelect,
  selected,
}: {
  alert: Alert;
  onSelect: (a: Alert) => void;
  selected?: boolean;
}) {
  const meta = CLASS_META[alert.class];
  const reduced = useReducedMotion();
  return (
    <motion.li
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, x: -18, filter: "blur(6px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: alert.class === "P0" ? 0.45 : 0.22, ease: "easeOut" }}
    >
      <button
        type="button"
        onClick={() => onSelect(alert)}
        className={cn(
          "glass group relative w-full overflow-hidden rounded-lg px-3 py-2.5 text-left transition-all hover:translate-y-[-1px] hover:bg-white/[0.1]",
          selected && "ring-1 ring-signal/60",
        )}
      >
        <span
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: meta.color }}
          aria-hidden
        />
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5 items-center justify-center">
            {alert.status === "new" && !reduced && (
              <span
                className="ping-ring absolute size-2.5 rounded-full"
                style={{ background: meta.color }}
                aria-hidden
              />
            )}
            <span className="size-2 rounded-full" style={{ background: meta.color }} />
          </span>
          <span className="mono text-[11px] font-semibold" style={{ color: meta.color }}>
            {meta.priority}
          </span>
          <span className="truncate text-xs text-foreground">{meta.label}</span>
          <span className="mono ml-auto text-[11px] text-muted-foreground">
            {fmtTime(alert.timestamp)}
          </span>
        </div>
        <div className="mono mt-1.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
          <span>NODE {alert.node_id}</span>
          <span>
            {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
          </span>
          <span>conf {alert.confidence.toFixed(2)}</span>
          <span className="text-foreground/60">→ {meta.routeTo}</span>
        </div>
      </button>
    </motion.li>
  );
}

export function AlertFeed({
  alerts,
  onSelect,
  selectedId,
}: {
  alerts: Alert[];
  onSelect: (a: Alert) => void;
  selectedId: string | null;
}) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
        <Waveform idle height={40} color="rgba(255,255,255,0.35)" />
        <p className="max-w-[24ch] text-xs text-muted-foreground">
          No active alerts — all nodes reporting normal ambient baseline.
        </p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2 p-2">
      <AnimatePresence initial={false}>
        {alerts.map((a) => (
          <AlertRow key={a.id} alert={a} onSelect={onSelect} selected={a.id === selectedId} />
        ))}
      </AnimatePresence>
    </ul>
  );
}
