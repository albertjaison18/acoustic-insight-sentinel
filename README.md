# AcousticEdge Dashboard

The AcousticEdge frontend is the operations dashboard for OmniEar's edge-AI acoustic alert pipeline. It receives structured alert JSON over WebSocket; no audio is received, stored, or displayed.

## Requirements

- Node.js 20 or later
- npm 10 or later
- An optional running OmniEar pipeline or `mock_dashboard_listener.py` for live alerts

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The local default WebSocket endpoint is `ws://localhost:8765`. Override it in `.env` when the pipeline is hosted elsewhere:

```env
VITE_WS_URL=ws://hostname:8765
```

## Commands

```bash
npm run dev
npm run build
npx tsc --noEmit
npm run lint
```

## Live alert contract

The dashboard accepts one JSON text frame per alert:

```json
{
  "node_id": "AE-01",
  "timestamp": "2026-08-16T09:12:03Z",
  "class": "P0",
  "label": "scream_distress",
  "confidence": 0.91,
  "lat": 12.9716,
  "lng": 77.5946
}
```

Malformed messages are logged and ignored. The operations feed and node-network map update live; Fleet hardware information and Analytics' historical dB charts remain local demo data because the pipeline does not provide hardware telemetry, sound level, or district aggregates.
