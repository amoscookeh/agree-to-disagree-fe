# Agree 2 Disagree Frontend

Next.js frontend for balanced political research—surfaces progressive and conservative perspectives with real-time streaming.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000, enter "What are perspectives on climate policy?" and get dual-perspective analysis with citations.

## Installation

**Requirements:** Node.js 20+

```bash
npm install
```

## Usage

**Development (mock data):**

```bash
npm run dev
```

**With real backend:**

```bash
cp env.example .env.local
# set NEXT_PUBLIC_TEST_MODE=false
npm run dev
```

**Tests:**

```bash
npm test           # run tests
npm run ci         # run all checks (lint, type, test, build)
```

Backend must be running at `http://localhost:8000` for real mode.

## Features

- Real-time SSE streaming updates
- Dual perspectives (progressive vs conservative)
- Citation tracking for all claims
- Query clarification flow
- Dark theme with Space Mono font

## Configuration

`.env.local`:

```bash
NEXT_PUBLIC_TEST_MODE=true          # false for real backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Defaults:** Mock mode enabled, backend at localhost:8000

## Architecture

- **Dependency injection:** `ResearchStream` interface for mock/real backend swapping
- **Type safety:** TypeScript strict mode
- **SSE streaming:** Proper cleanup on unmount
- **Component isolation:** Independent Chat, Progress, Report components

## Project Status

**Status:** MVP in development  
**Stability:** Experimental
