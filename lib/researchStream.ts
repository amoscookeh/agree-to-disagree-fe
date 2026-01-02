import { SSEEvent } from "./types";

export interface ResearchStream {
  stream(query: string): AsyncGenerator<SSEEvent>;
}

export class MockResearchStream implements ResearchStream {
  async *stream(query: string): AsyncGenerator<SSEEvent> {
    const threadId = crypto.randomUUID();

    await delay(500);
    yield {
      type: "progress",
      data: {
        agent: "clarification",
        status: "complete",
        message: "Query understood and refined",
        tool_calls: [],
        sources_searched: [],
        timestamp: new Date().toISOString(),
      },
    };

    await delay(800);
    yield {
      type: "progress",
      data: {
        agent: "left_research",
        status: "starting",
        message: "Initiating search of progressive sources...",
        tool_calls: [],
        sources_searched: [],
        timestamp: new Date().toISOString(),
      },
    };

    await delay(1200);
    yield {
      type: "progress",
      data: {
        agent: "left_research",
        status: "searching",
        message: "Searching The Guardian for relevant articles...",
        tool_calls: [
          {
            tool: "guardian_search",
            input: { query, max_results: 5 },
            output_preview: "Found 5 relevant articles",
          },
        ],
        sources_searched: ["The Guardian"],
        results_count: 5,
        timestamp: new Date().toISOString(),
      },
    };

    await delay(1000);
    yield {
      type: "progress",
      data: {
        agent: "right_research",
        status: "starting",
        message: "Initiating search of conservative sources...",
        tool_calls: [],
        sources_searched: [],
        timestamp: new Date().toISOString(),
      },
    };

    await delay(1200);
    yield {
      type: "progress",
      data: {
        agent: "right_research",
        status: "searching",
        message: "Searching NY Post for relevant articles...",
        tool_calls: [
          {
            tool: "nypost_rss",
            input: { query, max_results: 5 },
            output_preview: "Found 4 relevant articles",
          },
        ],
        sources_searched: ["NY Post"],
        results_count: 4,
        timestamp: new Date().toISOString(),
      },
    };

    await delay(800);
    yield {
      type: "progress",
      data: {
        agent: "academic_research",
        status: "starting",
        message: "Searching academic and statistical sources...",
        tool_calls: [],
        sources_searched: [],
        timestamp: new Date().toISOString(),
      },
    };

    await delay(1500);
    yield {
      type: "progress",
      data: {
        agent: "academic_research",
        status: "complete",
        message: "Retrieved data from Semantic Scholar and Census Bureau",
        tool_calls: [
          {
            tool: "semantic_scholar",
            input: { query },
            output_preview: "Found 3 peer-reviewed papers",
          },
        ],
        sources_searched: ["Semantic Scholar", "US Census Bureau"],
        results_count: 3,
        timestamp: new Date().toISOString(),
      },
    };

    await delay(1000);
    yield {
      type: "progress",
      data: {
        agent: "synthesis",
        status: "analyzing",
        message: "Analyzing perspectives and synthesizing report...",
        tool_calls: [],
        sources_searched: [],
        timestamp: new Date().toISOString(),
      },
    };

    await delay(2000);
    yield {
      type: "progress",
      data: {
        agent: "synthesis",
        status: "complete",
        message: "Report synthesis complete",
        tool_calls: [],
        sources_searched: [],
        timestamp: new Date().toISOString(),
      },
    };

    await delay(500);
    yield {
      type: "progress",
      data: {
        agent: "quality_check",
        status: "complete",
        message: "Quality check passed - citation score: 0.87",
        tool_calls: [],
        sources_searched: [],
        timestamp: new Date().toISOString(),
      },
    };

    await delay(800);
    yield {
      type: "report",
      data: {
        thread_id: threadId,
        summary: `The debate surrounding "${query}" reveals significant ideological divisions while also highlighting areas of unexpected agreement. Progressive sources emphasize systemic factors and collective solutions, while conservative sources focus on individual responsibility and market-based approaches. Both perspectives acknowledge the complexity of the issue and the need for evidence-based policy.`,
        claim_a: {
          stance: "Progressive",
          title: "Systemic reform addresses root causes",
          evidence: [
            {
              claim:
                "Research shows that structural interventions yield better long-term outcomes than individual-focused approaches",
              source: "The Guardian",
              url: "https://theguardian.com/example-article-1",
              confidence: 0.85,
            },
            {
              claim:
                "Government programs have historically reduced inequality when properly funded and implemented",
              source: "Semantic Scholar",
              url: "https://semanticscholar.org/paper/example",
              confidence: 0.9,
            },
            {
              claim:
                "Data from Census Bureau confirms disparities that require policy intervention",
              source: "US Census Bureau",
              url: "https://census.gov/data/example",
              confidence: 0.95,
            },
          ],
        },
        claim_b: {
          stance: "Conservative",
          title: "Market solutions and individual agency drive progress",
          evidence: [
            {
              claim:
                "Private sector innovation has consistently outperformed government programs in efficiency and outcomes",
              source: "NY Post",
              url: "https://nypost.com/example-article-1",
              confidence: 0.8,
            },
            {
              claim:
                "Economic data shows that reduced regulation correlates with increased opportunity and mobility",
              source: "Breitbart",
              url: "https://breitbart.com/example-article",
              confidence: 0.75,
            },
            {
              claim:
                "Historical analysis reveals unintended consequences of large-scale government interventions",
              source: "NY Post",
              url: "https://nypost.com/example-article-2",
              confidence: 0.82,
            },
          ],
        },
        agreements: [
          "Both perspectives acknowledge that current approaches have limitations",
          "There is consensus that evidence-based policy is preferable to ideology-driven decisions",
          "All sources agree that the issue affects multiple demographic groups differently",
        ],
        disagreements: [
          {
            topic: "Role of government intervention",
            left_position:
              "Government must actively address systemic inequalities through policy and funding",
            right_position:
              "Government intervention often creates inefficiencies; market forces should drive solutions",
            reason:
              "Fundamentally different views on the effectiveness and appropriate scope of government action",
          },
          {
            topic: "Primary cause of the problem",
            left_position: "Structural and systemic factors create barriers",
            right_position:
              "Individual choices and cultural factors are primary",
            reason:
              "Different analytical frameworks lead to different causal interpretations of the same data",
          },
        ],
        uncertainties: [
          "Long-term effects of recent policy changes remain unclear due to insufficient time for comprehensive study",
          "Causal relationships are difficult to establish definitively given the number of confounding variables",
          "Regional variations suggest that no single approach may be universally effective",
        ],
        citations: [
          {
            id: "cite-1",
            source_name: "The Guardian",
            title: "Systemic approaches show promise in new research",
            url: "https://theguardian.com/example-article-1",
            published_date: "2025-12-15",
            ideological_lean: "left",
            snippet:
              "New research from leading universities suggests that addressing root causes through policy intervention yields better outcomes...",
          },
          {
            id: "cite-2",
            source_name: "NY Post",
            title: "Market-driven solutions outperform government programs",
            url: "https://nypost.com/example-article-1",
            published_date: "2025-12-18",
            ideological_lean: "right",
            snippet:
              "Analysis of recent data shows private sector initiatives achieving results at lower cost than comparable government efforts...",
          },
          {
            id: "cite-3",
            source_name: "Semantic Scholar",
            title: "Meta-analysis of intervention effectiveness",
            url: "https://semanticscholar.org/paper/example",
            published_date: "2025-11-30",
            ideological_lean: "neutral",
            snippet:
              "This meta-analysis examines 50 years of policy interventions across multiple domains, finding mixed results that depend heavily on implementation quality...",
          },
          {
            id: "cite-4",
            source_name: "US Census Bureau",
            title: "Demographic trends and economic indicators 2025",
            url: "https://census.gov/data/example",
            published_date: "2025-12-01",
            ideological_lean: "neutral",
            snippet:
              "Latest census data reveals persistent disparities across demographic groups, with regional variations suggesting complex causal factors...",
          },
          {
            id: "cite-5",
            source_name: "Breitbart",
            title: "Regulation reduction correlates with economic growth",
            url: "https://breitbart.com/example-article",
            published_date: "2025-12-20",
            ideological_lean: "right",
            snippet:
              "States that reduced regulatory burdens saw increased business formation and job growth according to new economic analysis...",
          },
        ],
        metadata: {
          sources_searched: 6,
          total_results: 24,
          citation_score: 0.87,
          processing_time_ms: 9800,
        },
      },
    };

    await delay(300);
    yield {
      type: "done",
      data: {
        thread_id: threadId,
        success: true,
      },
    };
  }
}

export class APIResearchStream implements ResearchStream {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl =
      apiUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }

  async *stream(query: string): AsyncGenerator<SSEEvent> {
    let response: Response;

    try {
      response = await fetch(`${this.apiUrl}/api/research`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ query }),
      });
    } catch (error) {
      yield {
        type: "error",
        data: {
          code: "INTERNAL_ERROR",
          message:
            "Cannot connect to backend. Make sure it's running or enable test mode.",
          details: error instanceof Error ? error.message : "Network error",
          recoverable: true,
        },
      };
      return;
    }

    if (!response.ok) {
      yield {
        type: "error",
        data: {
          code: "RESEARCH_FAILED",
          message: `Backend returned error: ${response.status}`,
          recoverable: true,
        },
      };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield {
        type: "error",
        data: {
          code: "INTERNAL_ERROR",
          message: "No response body from backend",
          recoverable: false,
        },
      };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6);
          if (jsonStr.trim()) {
            yield JSON.parse(jsonStr) as SSEEvent;
          }
        }
      }
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// dep injection for research stream
const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE !== "false";
export const researchStream: ResearchStream = isTestMode
  ? new MockResearchStream()
  : new APIResearchStream();
