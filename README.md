# Agree 2 Disagree Frontend

Next.js frontend for balanced political research—surfaces progressive and conservative perspectives with real-time streaming.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000, enter "What are perspectives on climate policy?" and get dual-perspective analysis with citations.

## Installation

Requires Node.js 20+ and backend running at localhost:8000.

```bash
npm install
cp env.example .env.local
npm run dev
```

## Usage

```bash
npm run dev     # development server
npm run build   # production build
npm run ci      # format, lint, type-check, test, build
```

## Features

- Real-time SSE streaming with progress updates
- Dual perspectives (progressive vs conservative)
- Supervisor pattern: multi-cycle deep research with sub-queries and drafts
- Citation tracking for all claims
- Query clarification flow
- Persistent conversation threads
- Follow-up questions on existing research

## Configuration

`.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Architecture

- `hooks/useResearchThread` — SSE event handling via reducer pattern
- `components/Thread/` — message display (user, agent, drafts, reports)
- `lib/researchStream.ts` — streaming interface with cleanup
- TypeScript strict mode throughout

## Project Status

MVP in development. APIs may change.
