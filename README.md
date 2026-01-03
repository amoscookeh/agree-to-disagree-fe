# Agree 2 Disagree Frontend

Next.js frontend for balanced political research—surfaces progressive and conservative perspectives with real-time streaming.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000, enter "What are perspectives on climate policy?" and get dual-perspective analysis with citations.

## Installation

**Requirements:** Node.js 20+, backend running at localhost:8000

```bash
npm install
cp env.example .env.local
```

## Usage

```bash
npm run dev        # development server
npm run build      # production build
npm run lint       # eslint check
npm test           # run tests
npm run ci         # all checks (lint, type, test, build)
```

## Features

- Real-time SSE streaming progress updates
- Dual perspectives (progressive vs conservative)
- Citation tracking for all claims
- Query clarification flow
- Persistent conversation threads at `/chat/[id]`

## Configuration

`.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Architecture

- **Hooks:** `useResearchThread` manages SSE events via reducer pattern
- **Components:** `Thread/` for message display, `Chat/` for input
- **Streaming:** `ResearchStream` interface with proper cleanup
- **Type safety:** TypeScript strict mode throughout

## Project Status

**Status:** MVP in development  
**Stability:** Experimental—APIs may change
