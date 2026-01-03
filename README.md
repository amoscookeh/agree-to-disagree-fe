# Agree to Disagree - Frontend

Next.js chat interface for balanced political research—surfaces progressive and conservative perspectives with real-time streaming and citations.

**Live Demo:** https://agree2disagree.vercel.app/ (backend sleeps after inactivity—give it ~30s to wake up)

**Backend Repository:** [agree-to-disagree-be](https://github.com/amoscookeh/agree-to-disagree-be)

**The Problem:** Political information is fragmented across biased sources, making it time-consuming and difficult for people to understand multiple perspectives. Most Americans rely on 1-2 sources that fit their existing views or get lost in information overload when trying to research opposing viewpoints. This contributes to polarization and poorly-informed political opinions.

**My Solution:** Ask a political question and receive a balanced report analyzing competing claims, evidence from both sides, and clear explanations of where perspectives agree and disagree—leaving you informed enough to form your own opinion.

## Example

Ask "What perspectives exist on climate policy?" and watch the AI:

1. Clarify your query scope
2. Generate sub-queries for left/right angles
3. Research sources in parallel
4. Show drafts as they complete
5. Synthesize balanced report with citations

Then ask follow-ups like "What do economists say?" without re-triggering deep research.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 (requires backend at localhost:8000).

## Installation

**Requirements:** Node.js 20+, backend running at localhost:8000

```bash
npm install
cp env.example .env.local
# edit NEXT_PUBLIC_API_URL if backend is not on localhost:8000
npm run dev
```

## Usage

```bash
npm run dev     # development server (localhost:3000)
npm run build   # production build
npm run ci      # format, lint, type-check, test, build
```

## Features

- **Real-time SSE streaming**: progress updates, sub-queries, drafts, final report
- **Supervisor pattern UI**: shows multi-cycle deep research with supervisor decisions
- **Dual perspectives**: progressive vs conservative claims with evidence
- **Citation tracking**: every claim links to source article
- **Query clarification**: interactive flow when agent needs more context
- **Persistent threads**: conversation history with follow-up questions
- **Follow-up agent**: ask questions about the report without re-researching
- **Tool call visibility**: see what the agent is searching and why

## Configuration

`.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Defaults:**

- API URL: http://localhost:8000
- SSE timeout: 5 minutes
- Max reconnect attempts: 3

## Architecture

**Key components:**

- `hooks/useResearchThread` — SSE event handling via reducer pattern, manages streaming state
- `components/Thread/` — message display (user queries, agent progress, drafts, reports, follow-ups)
- `lib/researchStream.ts` — streaming interface with automatic cleanup
- `context/ResearchContext.tsx` — global research state management

**Layout:**

- Three-column: chat history (left), active chat (middle), report (right)
- Empty state: "Agree 2 Disagree" + "What should we explore today?"

**Tech stack:**

- Next.js 15 (App Router)
- TypeScript strict mode
- Tailwind CSS + DaisyUI
- Vitest for testing

## Design Principles

- **Transparency**: show all agent reasoning, tool calls, and sources
- **Responsiveness**: stream results as available, don't wait for completion
- **Clarity**: distinguish between drafts (in-progress) and final reports
- **Balance**: equal visual weight to left and right perspectives
- **Citation-first**: every claim must link to source

## Project Status

**MVP in development.** APIs may change.

**Supported:**

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Desktop layouts
- SSE streaming

**Known limitations:**

- Limited error handling
- No report export (planned)
- No source filtering (planned)
- Limited error recovery on stream failures

## Contributing

Run checks before committing:

```bash
npm run ci  # format, lint, type-check, test, build
```
