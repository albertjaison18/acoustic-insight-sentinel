import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Cpu, Lock, Radio, Sun, Waves } from "lucide-react";
import { AppShell } from "@/components/acoustic/AppShell";
import { Waveform } from "@/components/acoustic/Waveform";
import { CLASS_META, type AlertClass } from "@/lib/acoustic/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AcousticEdge — Streetlights that hear, not listen" },
      {
        name: "description",
        content:
          "Solar-powered edge-AI acoustic nodes on streetlights classify screams, impacts and arcing on-device, then send structured JSON alerts to police, EMS and utilities.",
      },
      { property: "og:title", content: "AcousticEdge — Streetlights that hear, not listen" },
      {
        property: "og:description",
        content:
          "Edge-AI acoustic sensing for cities. On-device classification, JSON-only alerts, zero raw audio.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AcousticEdge",
          description:
            "Solar-powered edge-AI acoustic sensor network for municipal safety and noise analytics.",
        }),
      },
    ],
  }),
  component: Landing,
});

const PIPELINE = [
  { k: "capture", t: "MEMS mic array", d: "Continuous 16 kHz buffer, never stored." },
  { k: "features", t: "Log-mel frontend", d: "40-band spectrogram computed in RAM." },
  { k: "infer", t: "On-device CNN", d: "INT8 model on an MCU-class NPU, <60 ms." },
  { k: "emit", t: "JSON alert", d: "class + confidence + node id + coords only." },
  { k: "route", t: "Department fan-out", d: "Signed POST to the owning municipal system." },
];

const BOM = [
  ["MEMS mic array (4×)", "₹ 640"],
  ["Edge NPU module", "₹ 2,150"],
  ["LTE-M / NB-IoT radio", "₹ 1,180"],
  ["6 W solar panel + LFP cell", "₹ 2,400"],
  ["IP66 pole enclosure", "₹ 1,100"],
];

const LIMITS = [
  "Classification degrades above 78 dB(A) of sustained background traffic noise.",
  "Monsoon rain on the enclosure adds broadband noise; P1 recall drops ~9%.",
  "Personal nodes relay over BLE and only report while the phone is in range.",
  "No speech recognition, no speaker ID, no raw audio egress — by construction.",
];

function Landing() {
  const [morph, setMorph] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setMorph(Math.max(0, Math.min(1, y / 520)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AppShell>
      <section className="city-surface relative overflow-hidden">
        <div className="hairline-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-[1100px] px-4 pb-4 pt-20 sm:pt-28">
          <p className="mono text-[11px] uppercase tracking-[0.24em] text-signal">
            edge-ai acoustic sensing
          </p>
          <h1 className="font-display mt-4 text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            Streetlights that hear.
            <br />
            <span className="text-signal">Never streetlights that listen.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Solar-powered nodes classify screams, crashes and electrical arcing on the pole. What
            leaves the device is a few hundred bytes of JSON — class, confidence, node id, coords.
            The audio dies in RAM.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/ops"
              className="inline-flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Open operations <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/map"
              className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm"
            >
              <Radio className="size-4 text-signal" aria-hidden /> See the node network
            </Link>
          </div>
        </div>
        <Waveform morph={morph} height={200} className="relative" />
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-16">
        <h2 className="font-display text-2xl tracking-tight">Detection pipeline</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PIPELINE.map((s, i) => (
            <li key={s.k} className="glass rounded-xl p-4">
              <span className="mono text-[10px] text-signal">0{i + 1}</span>
              <h3 className="mt-2 text-sm font-medium">{s.t}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 pb-16">
        <h2 className="font-display text-2xl tracking-tight">Routing table</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Each class has exactly one owning system. Nothing is broadcast.
        </p>
        <div className="glass mt-6 overflow-x-auto rounded-xl">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3">priority</th>
                <th className="px-4 py-3">class</th>
                <th className="px-4 py-3">routes to</th>
                <th className="px-4 py-3">payload</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(CLASS_META) as AlertClass[]).map((k) => {
                const m = CLASS_META[k];
                return (
                  <tr key={k} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <span
                        className="mono rounded-full px-2 py-0.5 text-[10px]"
                        style={{ background: `color-mix(in oklab, ${m.color} 18%, transparent)`, color: m.color }}
                      >
                        {m.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">{m.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.routeTo}</td>
                    <td className="mono px-4 py-3 text-[11px] text-muted-foreground">JSON · ~280 B</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1100px] gap-6 px-4 pb-24 lg:grid-cols-2">
        <div className="neo rounded-2xl p-6">
          <h2 className="font-display flex items-center gap-2 text-xl tracking-tight">
            <Cpu className="size-4 text-signal" aria-hidden /> Bill of materials
          </h2>
          <ul className="mt-4 space-y-2">
            {BOM.map(([item, cost]) => (
              <li key={item} className="mono flex justify-between text-xs">
                <span className="text-muted-foreground">{item}</span>
                <span>{cost}</span>
              </li>
            ))}
            <li className="mono flex justify-between border-t border-white/10 pt-2 text-xs text-signal">
              <span>per-node total</span>
              <span>₹ 7,470</span>
            </li>
          </ul>
          <p className="mono mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sun className="size-3" aria-hidden /> 6 W panel sustains 24/7 duty at 11% average load
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display flex items-center gap-2 text-xl tracking-tight">
            <Lock className="size-4 text-signal" aria-hidden /> Honest limitations
          </h2>
          <ul className="mt-4 space-y-3">
            {LIMITS.map((l) => (
              <li key={l} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <Waves className="mt-0.5 size-3 shrink-0 text-p4" aria-hidden />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
