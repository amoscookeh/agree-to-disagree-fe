# Agree 2 Disagree

Next.js frontend for balanced political research—surfaces progressive and conservative perspectives on US policy debates with real-time streaming and citation tracking.

## Example

Enter a query like "What are perspectives on climate policy?" and get:

- Dual perspective analysis (progressive vs conservative)
- Real-time streaming research updates
- Cited evidence from news sources across the spectrum
- Areas of agreement and key disagreements

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and start researching.

## Installation

**Requirements**: Node.js 18+

```bash
npm install
```

## Usage

**Development (mock data)**:

```bash
npm run dev
```

**With real backend**:

```bash
cp env.example .env.local
# Set NEXT_PUBLIC_TEST_MODE=false in .env.local
npm run dev
```

**Run tests**:

```bash
npm test
```

**Run all CI checks locally**:

```bash
npm run ci
```

This runs formatting, linting, type checking, tests, and build—same as GitHub Actions.

Default: runs with mock data. Backend must be running at `http://localhost:8000` for real mode.

## Features

- **Streaming research**: Real-time SSE updates as research progresses
- **Dual perspectives**: Progressive and conservative viewpoints side-by-side
- **Citation tracking**: Every claim linked to original sources
- **Agreement mapping**: Shows where perspectives align and diverge
- **Clean UI**: Dark theme with Space Mono monospace font

## Configuration

Create `.env.local`:

```bash
NEXT_PUBLIC_TEST_MODE=true          # false to use real backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Defaults**: Mock mode enabled, backend at localhost:8000

## Architecture

- **Dependency injection**: `ResearchStream` interface allows mock/real backend swapping
- **Type safety**: TypeScript strict mode throughout
- **SSE streaming**: Built for Server-Sent Events with proper cleanup
- **Component isolation**: Chat, Progress, and Report components are independent

## Project Status

W.I.P
