import { config } from "./config";
import type {
  SSEEvent,
  AgentName,
  AgentStatus,
  ClaimData,
  DisagreementItem,
  Citation,
  ToolCall,
  IdeologicalLean,
} from "./types";

export interface ResearchStream {
  stream(
    query: string,
    clarificationResponse?: string
  ): AsyncGenerator<SSEEvent>;
}

export class MockResearchStream implements ResearchStream {
  async *stream(query: string): AsyncGenerator<SSEEvent> {
    const threadId = crypto.randomUUID();
    const queryId = crypto.randomUUID();

    await delay(300);
    yield {
      type: "thread",
      data: {
        thread_id: threadId,
        query_id: queryId,
      },
    };

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
        query_id: queryId,
        success: true,
      },
    };
  }
}

export class APIResearchStream implements ResearchStream {
  private apiUrl: string;
  private getToken?: () => string | null;

  constructor(apiUrl?: string, getToken?: () => string | null) {
    this.apiUrl = apiUrl || config.apiUrl;
    this.getToken = getToken;
  }

  async *stream(
    query: string,
    clarificationResponse?: string
  ): AsyncGenerator<SSEEvent> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };

    const token = this.getToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}/api/research`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query,
          clarification_response: clarificationResponse || null,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Backend returned error: ${response.status}`;
        let errorCode: "RESEARCH_FAILED" | "RATE_LIMITED" | "INTERNAL_ERROR" =
          "RESEARCH_FAILED";

        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }

          if (
            response.status === 403 &&
            errorMessage.toLowerCase().includes("quota")
          ) {
            errorCode = "RATE_LIMITED";
          }
        } catch {
          // ignore json parse errors
        }

        yield {
          type: "error",
          data: {
            code: errorCode,
            message: errorMessage,
            recoverable: errorCode !== "RATE_LIMITED",
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
              const raw = JSON.parse(jsonStr);
              const transformed = this.transformEvent(raw);
              if (transformed) {
                yield transformed;
              }
            }
          }
        }
      }
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
  }

  private transformEvent(raw: Record<string, unknown>): SSEEvent | null {
    const type = raw.type as string | undefined;

    // handle events with explicit type field
    switch (type) {
      case "thread":
        const threadData = raw.data as Record<string, unknown> | undefined;
        return {
          type: "thread",
          data: {
            thread_id:
              (threadData?.thread_id as string) ||
              (raw.thread_id as string) ||
              "",
            query_id:
              (threadData?.query_id as string) ||
              (raw.query_id as string) ||
              "",
          },
        };

      case "progress":
        // progress events have: {type: "progress", data: {agent, status, message, ...}}
        const progressData = raw.data as Record<string, unknown> | undefined;

        // check if data is nested or at root level
        const agent = (progressData?.agent || raw.agent) as AgentName;
        const status = (progressData?.status || raw.status) as AgentStatus;
        const message = (progressData?.message || raw.message) as string;

        if (!agent || !status || !message) {
          console.warn("Invalid progress event, missing required fields:", raw);
          return null;
        }

        return {
          type: "progress",
          data: {
            agent,
            status,
            message,
            tool_calls:
              (progressData?.tool_calls as ToolCall[]) ||
              (raw.tool_calls as ToolCall[]) ||
              [],
            sources_searched:
              (progressData?.sources_searched as string[]) ||
              (raw.sources_searched as string[]) ||
              (progressData?.sources as string[]) ||
              (raw.sources as string[]) ||
              [],
            results_count:
              (progressData?.results_count as number) ||
              (raw.results_count as number) ||
              undefined,
            timestamp:
              (progressData?.timestamp as string) ||
              (raw.timestamp as string) ||
              new Date().toISOString(),
            details:
              (progressData?.details as Record<string, unknown>) ||
              (raw.details as Record<string, unknown>) ||
              undefined,
          },
        };

      case "clarification":
      case "clarification_needed":
        const clarificationData = raw.data as
          | Record<string, unknown>
          | undefined;
        return {
          type: "clarification",
          data: {
            thread_id:
              (clarificationData?.thread_id as string) ||
              (raw.thread_id as string) ||
              "",
            refined_query:
              (clarificationData?.refined_query as string) ||
              (raw.refined_query as string) ||
              "",
            questions:
              (clarificationData?.questions as string[]) ||
              (raw.questions as string[]) ||
              [],
            suggestions:
              (clarificationData?.suggestions as string[]) ||
              (raw.suggestions as string[]) ||
              [],
          },
        };

      case "report":
        const reportData = raw.data as Record<string, unknown>;
        const rawCitations =
          (reportData.citations as Record<string, unknown>[]) || [];

        const formattedCitations: Citation[] = rawCitations.map((c) => ({
          id: (c.id as string) || `cite-${Math.random()}`,
          source_name:
            (c.source as string) || (c.source_name as string) || "Unknown",
          title: (c.title as string) || (c.claim as string) || "",
          url: (c.url as string) || "",
          published_date: c.published_date as string | undefined,
          ideological_lean:
            ((c.perspective || c.ideological_lean) as IdeologicalLean) ||
            "neutral",
          snippet: (c.claim as string) || (c.snippet as string) || "",
        }));

        const metadata = reportData.metadata as
          | Record<string, unknown>
          | undefined;

        return {
          type: "report",
          data: {
            thread_id: (reportData.thread_id as string) || "",
            summary: reportData.summary as string,
            claim_a: reportData.claim_a as ClaimData,
            claim_b: reportData.claim_b as ClaimData,
            agreements: (reportData.agreements as string[]) || [],
            disagreements:
              (reportData.disagreements as DisagreementItem[]) || [],
            uncertainties: (reportData.uncertainties as string[]) || [],
            citations: formattedCitations,
            metadata: metadata
              ? {
                  sources_searched: (metadata.sources_searched as number) || 0,
                  total_results: (metadata.total_results as number) || 0,
                  citation_score: (metadata.citation_score as number) || 0,
                  processing_time_ms:
                    (metadata.processing_time_ms as number) || 0,
                }
              : undefined,
          },
        };

      case "error":
        return {
          type: "error",
          data: {
            code: "RESEARCH_FAILED",
            message: raw.message as string,
            recoverable: true,
          },
        };

      case "done":
        const doneData = raw.data as Record<string, unknown> | undefined;
        return {
          type: "done",
          data: {
            thread_id:
              (doneData?.thread_id as string) ||
              (raw.thread_id as string) ||
              "",
            query_id:
              (doneData?.query_id as string) || (raw.query_id as string) || "",
            success: true,
          },
        };

      default:
        // fallback: if no type but has agent/status/message, treat as progress
        const fallbackData = raw.data as Record<string, unknown> | undefined;
        const fallbackAgent = (fallbackData?.agent || raw.agent) as AgentName;
        const fallbackStatus = (fallbackData?.status ||
          raw.status) as AgentStatus;
        const fallbackMessage = (fallbackData?.message ||
          raw.message) as string;

        if (fallbackAgent && fallbackStatus && fallbackMessage) {
          return {
            type: "progress",
            data: {
              agent: fallbackAgent,
              status: fallbackStatus,
              message: fallbackMessage,
              tool_calls:
                (fallbackData?.tool_calls as ToolCall[]) ||
                (raw.tool_calls as ToolCall[]) ||
                [],
              sources_searched:
                (fallbackData?.sources_searched as string[]) ||
                (raw.sources_searched as string[]) ||
                (fallbackData?.sources as string[]) ||
                (raw.sources as string[]) ||
                [],
              results_count:
                (fallbackData?.results_count as number) ||
                (raw.results_count as number) ||
                undefined,
              timestamp:
                (fallbackData?.timestamp as string) ||
                (raw.timestamp as string) ||
                new Date().toISOString(),
              details:
                (fallbackData?.details as Record<string, unknown>) ||
                (raw.details as Record<string, unknown>) ||
                undefined,
            },
          };
        }

        console.warn("Unknown event format:", raw);
        return null;
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// always use real API for research - mock is only for component testing
export const researchStream: ResearchStream = new APIResearchStream();
