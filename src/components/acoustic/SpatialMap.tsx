import { useMemo, useRef, useState } from "react";
import { BOUNDS, CITY_CENTER } from "@/lib/acoustic/data";
import type { NodeUnit, OmniEarAlert } from "@/lib/acoustic/types";
import { CLASS_META } from "@/lib/acoustic/types";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "./Waveform";

export function project(lat: number, lng: number) {
  const x = ((lng - (CITY_CENTER.lng - BOUNDS.lngSpan / 2)) / BOUNDS.lngSpan) * 100;
  const y = (1 - (lat - (CITY_CENTER.lat - BOUNDS.latSpan / 2)) / BOUNDS.latSpan) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(3, Math.min(97, y)) };
}

function getPriorityColor(priority: OmniEarAlert["priority"]) {
  if (priority === "P0") return "var(--p0)";
  if (priority === "P1") return "var(--p1)";
  return "var(--p4)";
}

type Props = {
  nodes: NodeUnit[];
  alerts?: OmniEarAlert[];
  selectedNodeId?: number | null;
  onSelectNode?: (n: NodeUnit) => void;
  className?: string;
  compact?: boolean;
};

/**
 * Spatial city surface. Custom SVG/DOM layers (no external tiles / API key),
 * with parallax depth: roads < blocks < nodes < glass.
 */
export function SpatialMap({
  nodes,
  alerts = [],
  selectedNodeId,
  onSelectNode,
  className,
  compact,
}: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState<NodeUnit | null>(null);

  const roads = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        v: 6 + i * 11 + (i % 3) * 2,
        h: 4 + i * 12 + (i % 2) * 3,
      })),
    [],
  );

  const activeByNode = useMemo(() => {
    const m = new Map<string, OmniEarAlert>();
    alerts.forEach((alert) => {
      const key = String(alert.node_id);
      if (!m.has(key)) m.set(key, alert);
    });
    return m;
  }, [alerts]);

  const move = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setP({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  const layer = (depth: number) => ({
    transform: reduced ? undefined : `translate3d(${p.x * depth}px, ${p.y * depth}px, 0)`,
  });

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={() => {
        setP({ x: 0, y: 0 });
        setHover(null);
      }}
      className={cn(
        "city-surface relative overflow-hidden rounded-xl border border-white/10",
        className,
      )}
    >
      <div className="hairline-grid absolute inset-[-4%] opacity-70" style={layer(-8)} />
      <svg
        className="absolute inset-[-3%]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={layer(-16)}
        aria-hidden="true"
      >
        {roads.map((r, i) => (
          <g key={i} stroke="rgba(255,255,255,0.07)" strokeWidth={i % 3 === 0 ? 0.5 : 0.22}>
            <line x1={r.v} y1="0" x2={r.v + 3} y2="100" />
            <line x1="0" y1={r.h} x2="100" y2={r.h - 2} />
          </g>
        ))}
        <path
          d="M0,64 C22,58 34,74 52,68 C70,62 84,76 100,70"
          fill="none"
          stroke="rgba(91,141,239,0.25)"
          strokeWidth="1.4"
        />
      </svg>

      <div className="absolute inset-0" style={layer(-26)}>
        {nodes.map((n) => {
          const { x, y } = project(n.lat, n.lng);
          const alert = activeByNode.get(String(n.id));
          const meta = alert ? (CLASS_META[alert.class as keyof typeof CLASS_META] ?? null) : null;
          const color = !n.online
            ? "rgba(255,255,255,0.25)"
            : n.tamper_flagged
              ? "var(--p1)"
              : alert
                ? getPriorityColor(alert.priority)
                : meta
                  ? meta.color
                  : "var(--signal)";
          const selected = selectedNodeId === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onSelectNode?.(n)}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              aria-label={`Node ${n.id}, ${n.type}, ${n.online ? "online" : "offline"}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2 transition-transform hover:scale-125 focus-visible:scale-125"
              style={{ left: `${x}%`, top: `${y}%`, zIndex: selected ? 30 : 10 }}
            >
              {alert && !reduced && (
                <span
                  className="ping-ring absolute inset-0 rounded-full"
                  style={{ boxShadow: `0 0 0 2px ${color}`, background: `${color}22` }}
                />
              )}
              <span
                className={cn(
                  "block rounded-full",
                  n.type === "personal" ? "size-2 rotate-45 rounded-[2px]" : "size-2.5",
                  selected && "ring-2 ring-white/70 ring-offset-2 ring-offset-transparent",
                )}
                style={{
                  background: color,
                  boxShadow: n.online ? `0 0 12px ${color}` : "none",
                  opacity: n.online ? 1 : 0.5,
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0" style={layer(-28)}>
        {Array.from(activeByNode.values()).map((alert) => {
          const { x, y } = project(alert.lat, alert.lng);
          const color = getPriorityColor(alert.priority);
          return (
            <span
              key={`${alert.node_id}-${alert.timestamp}`}
              aria-label={`${alert.priority} ${alert.label} at ${alert.lat}, ${alert.lng}`}
              className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                background: color,
                boxShadow: `0 0 16px 3px ${color}`,
              }}
            />
          );
        })}
      </div>

      {alerts.length > 0 && !compact && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-40 flex justify-end px-4">
          <div className="glass rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {alerts.length} live alerts
          </div>
        </div>
      )}

      {hover && !compact && (
        <div
          className="glass-raised pointer-events-none absolute z-40 rounded-lg px-3 py-2 text-xs"
          style={{
            left: `${project(hover.lat, hover.lng).x}%`,
            top: `${project(hover.lat, hover.lng).y}%`,
            transform: `translate(-50%, -140%) rotateX(${reduced ? 0 : -p.y * 8}deg) rotateY(${reduced ? 0 : p.x * 10}deg)`,
          }}
        >
          <div className="mono text-signal">NODE {hover.id}</div>
          <div className="mono text-[11px] text-muted-foreground">
            {hover.lat.toFixed(4)}, {hover.lng.toFixed(4)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {hover.type === "personal" ? "Personal / BLE relay" : hover.power_mode} ·{" "}
            {hover.online ? (hover.tamper_flagged ? "tamper-flagged" : "online") : "offline"}
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_120%,transparent_40%,rgba(10,14,23,0.85))]" />
    </div>
  );
}
