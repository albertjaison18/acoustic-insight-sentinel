import { create } from "zustand";
import { FLEET } from "./data";
import type { Alert, AlertClass } from "./types";

const CANDIDATES = FLEET.filter((n) => n.online);

function pickClass(): AlertClass {
  const r = Math.random();
  if (r < 0.72) return "P4";
  if (r < 0.86) return "P1_impact";
  if (r < 0.96) return "P1_arcing";
  return "P0";
}

let seq = 0;
function makeAlert(): Alert {
  const node = CANDIDATES[Math.floor(Math.random() * CANDIDATES.length)]!;
  const cls = pickClass();
  seq += 1;
  return {
    id: `AE-${Date.now().toString(36).toUpperCase()}-${seq}`,
    node_id: node.id,
    class: cls,
    lat: +node.lat.toFixed(5),
    lng: +node.lng.toFixed(5),
    confidence: +(cls === "P0" ? 0.88 + Math.random() * 0.11 : 0.7 + Math.random() * 0.29).toFixed(
      2,
    ),
    timestamp: new Date().toISOString(),
    status: "new",
  };
}

type State = {
  alerts: Alert[];
  running: boolean;
  selectedId: string | null;
  lastP0: Alert | null;
  push: (a: Alert) => void;
  select: (id: string | null) => void;
  setStatus: (id: string, status: Alert["status"]) => void;
  toggleRunning: () => void;
};

export const useAlertStore = create<State>((set) => ({
  alerts: [],
  running: true,
  selectedId: null,
  lastP0: null,
  push: (a) =>
    set((s) => ({
      alerts: [a, ...s.alerts].slice(0, 60),
      lastP0: a.class === "P0" ? a : s.lastP0,
    })),
  select: (id) => set({ selectedId: id }),
  setStatus: (id, status) =>
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)) })),
  toggleRunning: () => set((s) => ({ running: !s.running })),
}));

let started = false;
/** Mock simulator: slow trickle of P4, occasional P1, rare P0. */
export function startSimulator() {
  if (started || typeof window === "undefined") return;
  started = true;
  const { push } = useAlertStore.getState();
  push(makeAlert());
  const tick = () => {
    const delay = 3500 + Math.random() * 6500;
    window.setTimeout(() => {
      if (useAlertStore.getState().running) useAlertStore.getState().push(makeAlert());
      tick();
    }, delay);
  };
  tick();
}
