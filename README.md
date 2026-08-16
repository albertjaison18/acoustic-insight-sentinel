# Acoustic Guardian

You are building the frontend for AcousticEdge, a solar-powered edge-AI acoustic sensor network mounted on existing streetlights and utility poles. Each node listens for sound, classifies it on-device (scream/SOS, brake-screech+impact, electrical arcing, ambient noise), and sends only a structured JSON alert — never raw audio — into whichever municipal system owns that event type: Police PCR, EMS/Traffic Dispatch, State Electricity Board maintenance, or Urban Planning noise analytics.

Build this as a real, working, opinionated product — not a generic admin-dashboard template. Follow the design system below exactly; it is derived from the product's own architecture, not decorative.

Tech stack

Next.js 14 (App Router) + TypeScript

Tailwind CSS with a custom token config (no default Tailwind palette — extend tailwind.config with the tokens below)

Framer Motion for all motion

shadcn/ui as unstyled primitives only — restyle every component to match the token system, do not ship default shadcn looks

Mapbox GL JS (or deck.gl if you want true 3D pole-height extrusion) for the spatial node map

Recharts for the analytics portal

Zustand for client state

A mock EventSource/interval-based simulator that pushes fake alert JSON payloads on a randomized timer, so the dashboard feels alive without a real backend

Lucide icons, IBM Plex Mono or JetBrains Mono for anything numeric/technical (node IDs, lat/lng, timestamps, JSON payloads)

Design thesis — why these three languages, specifically

Don't use "liquid glass," "spatial UI," and "neomorphism" as trend stickers. Each one is assigned to a specific part of the product because it maps onto something real:

Liquid glass = the privacy architecture, made visible. AcousticEdge's entire pitch is "no raw audio ever leaves the device — only structured, transparent alert payloads." So every floating data panel (alert feed, stat clusters, incident drawer) is rendered as translucent frosted glass over the live map — the UI itself is literally transparent, echoing "zero surveillance footprint." This is the signature idea. Say it once, subtly, in the landing page copy — don't over-explain it in the UI itself.

Neomorphism = the physical hardware, made tactile. Node health cards, power-mode toggles (solar/grid), and the fleet-management panel represent real embedded devices sitting on real poles. These get soft dual-shadow extruded surfaces that read like a physical control panel or the enclosure of the device itself — because that's what they're standing in for.

Spatial UI = the city, made legible. The node map is not a flat pin-drop Google Maps embed — it's a dark, layered, parallax city surface where node pins sit at slightly different z-depths, glass panels float above it with real elevation (shadow + blur increasing with hover), and the whole thing responds subtly to mouse movement. This is the spatial layer because the product's actual value is turning physical city infrastructure into a sensing layer — the map should feel like infrastructure, not a widget.

Token system

Color (dark-mode-first; this is a night-operations control-room product, not a SaaS marketing site):

TokenHexUsevoid#0A0E17base backgroundslate#121A2Bpanel/card base, neomorphic surface colorsignal#3FE0C5primary accent — acoustic/signal teal, used sparingly (nav highlights, active states, the waveform signature)p0-red#FF3B5Cdistress/scream — policep1-amber#FFA83Dbrake-screech+impact / electrical arcing — EMS + electricity boardp4-blue#5B8DEFambient noise-pollution mapping — urban planningglass-whitergba(255,255,255,0.06)frosted panel fill, layered with backdrop-blur

Do not introduce a warm cream/terracotta palette or a broadsheet/newspaper layout — this is a civic night-ops product, not an editorial site.

Type:

Display: Space Grotesk — geometric, technical, used with restraint (hero headline, section numerals only)

Body/UI: Inter

Data/mono: IBM Plex Mono — every coordinate, node ID, timestamp, and JSON payload snippet renders in this. This is a deliberate signature: raw data looks like raw data, everywhere, all the time — it reinforces "structured alert payload, not surveillance footage."

Signature element: a live waveform that runs across the landing page hero, "listening" to ambient motion (or a looped idle animation), which on scroll morphs/settles into the city skyline / node map silhouette. Reuse a simplified version of this waveform as the loading/idle state inside the live dashboard (e.g., the alert feed's empty state is a flat, calm waveform line — "no signal is exactly what safety looks like most of the time").

Screens to build

Landing page (pitch to municipal buyers — BMC/BBMP/Smart City SPVs)

Hero: waveform signature + one-line thesis ("One node. Three city systems. Zero surveillance footprint.") — write your own supporting copy, don't lift PRD sentences verbatim.

Section: the two-stage on-device pipeline, shown as a real diagram (mic → trigger classifier → confirmation classifier → structured JSON), not a generic "how it works" 3-icon row.

Section: the four priority classes (P0/P1/P1/P4) and which city system each routes to — this is a real routing table, present it as one.

Section: honest limitations, presented as a credibility signal, not buried — false-positive validation still pending, 2G→NB-IoT migration roadmap. Give this its own quiet, low-drama section; don't dress it up.

Section: cost/BOM (~₹1,460/node) and two deployment modes (streetlight/pole, solar vs. railway platform, grid-powered).

CTA toward a live demo of the dashboard.

Operations Command Dashboard (the core app — Police/EMS view)

Left: spatial node map (see below) as the dominant surface.

Floating glass panels over the map: live alert feed (newest first, auto-scrolling), active-incident count by priority, node-fleet-health summary strip.

New alert arrival: card slides in with an expanding sonar-ping ring in the priority color; P0 gets a brief edge-of-screen glow flash and is announced via an ARIA live region (this is a real safety feature, not decoration).

Clicking an alert opens the Incident Drawer: node ID, lat/lng (mono font), classification confidence, timestamp, a mini-map centered on that node, and a "structured payload" readout shown as literal JSON in mono — reinforcing that this is all the system ever sees.

Node Network Map (full-screen spatial view)

All fixed nodes (streetlight/pole icons) + personal/keychain nodes (a visually distinct marker) on one layer, toggleable.

Node pins pulse at idle; hover lifts a glass tooltip with parallax tilt tied to cursor position (disable this under prefers-reduced-motion).

Filter rail (glass, floating) for priority class, power mode (solar/grid), node status (online/tamper-flagged/offline).

Smart City Analytics Portal (Urban Planning view — deliberately calmer register)

P4 aggregated noise-pollution heatmap over time (Recharts + a simple grid/heatmap, not real-time — this data updates daily per the PRD, so don't animate it like a live feed).

Trend charts by district/pole cluster.

This screen should visually feel like a different department's tool — slower, more analytical, less alarm-driven than the ops dashboard, even though it shares the same shell and token system.

Node Fleet / Hardware Admin (Neomorphic showcase screen)

Grid of node cards, each a neomorphic "device panel": battery %, solar input, GSM signal strength, last heartbeat, tamper-flag state.

Power-mode toggle (solar vs. grid) rendered as a real inset/extruded neomorphic switch.

A tamper-flagged or offline node should look visually "unhealthy" — desaturated, shadow flattened — distinct from the glass/spatial language used elsewhere; this is the one screen that should feel like touching hardware, not glass.

Personal Node companion (secondary, mobile-width mock)

Simple screen showing "Stage-1 detection on-device → relay via BLE → phone → same backend." One toggle (active/opt-in), one status line, nothing else — the personal node is intentionally minimal by design (no onboard SIM/GSM), and the UI should reflect that restraint.

Mock data model

ts

type Alert = {
  id: string;
  node_id: number;
  class: "P0" | "P1_impact" | "P1_arcing" | "P4";
  lat: number;
  lng: number;
  confidence: number; // 0-1
  timestamp: string;
  status: "new" | "acknowledged" | "resolved";
};

type Node = {
  id: number;
  type: "fixed" | "personal";
  power_mode: "solar" | "grid" | "phone_relay";
  battery_pct: number | null;
  gsm_signal: number | null; // null for personal nodes (uses phone's connection)
  last_heartbeat: string;
  tamper_flagged: boolean;
  lat: number;
  lng: number;
};

Simulate a slow trickle of P4 events, occasional P1s, and rare P0s, so the dashboard's calm/alarm contrast is visible without needing a real backend.

Motion rules

One orchestrated moment per screen, not scattered effects everywhere — the landing hero waveform-to-skyline is the big one; everything else (hover lifts, ping rings, drawer slide-ins) should be quick and quiet.

Respect prefers-reduced-motion everywhere — swap parallax/ping animations for static equivalents.

P0 alert entrance is the one place where a stronger visual beat is justified — this is a real safety signal.

Quality floor (non-negotiable)

Fully responsive down to mobile, including the ops dashboard (dispatchers may check it on a phone).

Visible keyboard focus states on every interactive element, including map pins and glass panel triggers.

Color contrast: P0/P1/P4 colors must remain legible against void/slate backgrounds at WCAG AA for text use.

ARIA live region for new P0 alerts specifically — this is the one place accessibility is also a literal safety requirement, not just compliance.

Don't use numbered-step markers (01/02/03) unless a section is a genuine ordered sequence — the two-stage detection pipeline qualifies; the feature grid does not.

Copy voice

Landing page: confident, specific, civic-infrastructure register — named buyers (BMC/BBMP), named cost figures, honest about limitations. No generic startup marketing fluff ("revolutionize your city").

Ops dashboard: control-room voice. Terse, factual, present-tense. "3 active alerts," "Node 402 — offline 4m," not "You have 3 new notifications!"

Empty/error states: explain what happened and what it means operationally (e.g., "No active alerts — all nodes reporting normal ambient baseline," not "Nothing here yet!").

Notes for you (not part of the copy-paste prompt)

If your agent supports it, ask it to brainstorm the token system against this brief first and self-critique before writing code — that's what keeps "liquid glass + neomorphism + spatial UI" from collapsing into the generic 2026-AI-dashboard look.

The Node Fleet screen is your neomorphism showcase, the Ops Dashboard/map is your glass+spatial showcase — keeping them visually distinct (rather than blending all three languages into every screen) is what will make this read as intentional rather than a trend mashup.

If the target tool is React-artifact-only (e.g. building inside a Claude.ai artifact rather than a full Next.js repo), swap Mapbox GL for a custom SVG/Canvas spatial map — Mapbox needs an API key and external tiles that won't work in a sandboxed artifact.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0e6a9cb5-231b-4fd0-8f3f-0a0096792c91).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
