export type AlertPriority = "P0" | "P1" | "P4";

/** The exact JSON alert emitted by omniear_pipeline.py. */
export interface AcousticAlert {
  node_id: string;
  timestamp: string;
  class: AlertPriority;
  label: string;
  confidence: number;
  lat: number;
  lng: number;
}

/** Wire alert enriched only with presentation metadata used by the dashboard. */
export interface OmniEarAlert extends AcousticAlert {
  priority: AlertPriority;
}

export type AlertClass = AlertPriority | "P1_impact" | "P1_arcing";

export type Alert = OmniEarAlert & {
  id?: string;
  status?: "new" | "acknowledged" | "resolved";
};

export type NodeUnit = {
  id: number;
  type: "fixed" | "personal";
  power_mode: "solar" | "grid" | "phone_relay";
  battery_pct: number | null;
  gsm_signal: number | null;
  last_heartbeat: string;
  tamper_flagged: boolean;
  lat: number;
  lng: number;
  district: string;
  online: boolean;
};

export const CLASS_META: Record<
  AlertClass,
  { label: string; routeTo: string; color: string; priority: string; token: string }
> = {
  P0: {
    label: "Scream / SOS",
    routeTo: "Police PCR / Campus Security",
    color: "var(--p0)",
    priority: "P0",
    token: "p0",
  },
  P1: {
    label: "Priority incident",
    routeTo: "EMS / Traffic Dispatch",
    color: "var(--p1)",
    priority: "P1",
    token: "p1",
  },
  P1_impact: {
    label: "Brake-screech + impact",
    routeTo: "EMS / Traffic Dispatch",
    color: "var(--p1)",
    priority: "P1",
    token: "p1",
  },
  P1_arcing: {
    label: "Electrical arcing",
    routeTo: "State Electricity Board",
    color: "var(--p1)",
    priority: "P1",
    token: "p1",
  },
  P4: {
    label: "Ambient noise",
    routeTo: "Urban Planning aggregate only",
    color: "var(--p4)",
    priority: "P4",
    token: "p4",
  },
};

export const DISTRICTS = [
  "Shivajinagar",
  "Indiranagar",
  "Koramangala",
  "Yeshwanthpur",
  "Jayanagar",
  "Whitefield",
];
