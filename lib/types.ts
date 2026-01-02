export type IdeologicalLean = "left" | "right" | "neutral";

export type AgentName =
  | "clarification"
  | "left_research"
  | "right_research"
  | "academic_research"
  | "synthesis"
  | "quality_check";

export type AgentStatus =
  | "starting"
  | "searching"
  | "analyzing"
  | "complete"
  | "error";

export type SSEEventType =
  | "clarification"
  | "progress"
  | "report"
  | "error"
  | "done";

export type ErrorCode =
  | "INVALID_QUERY"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "RESEARCH_FAILED"
  | "INTERNAL_ERROR";

export interface ResearchRequest {
  query: string;
  thread_id?: string | null;
  clarification_response?: string | null;
}

export interface ChatRequest {
  query: string;
  thread_id: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export interface ChatResponse {
  answer: string;
  citations: string[];
  thread_id: string;
}

export interface ClarificationData {
  thread_id: string;
  refined_query: string;
  questions: string[];
  suggestions: string[];
}

export interface ToolCall {
  tool: string;
  input: Record<string, unknown>;
  output_preview?: string;
}

export interface ProgressData {
  agent: AgentName;
  status: AgentStatus;
  message: string;
  tool_calls: ToolCall[];
  sources_searched: string[];
  results_count?: number;
  timestamp: string;
}

export interface EvidenceItem {
  claim: string;
  source: string;
  url: string;
  confidence: number;
}

export interface ClaimData {
  stance: string;
  title: string;
  evidence: EvidenceItem[];
}

export interface DisagreementItem {
  topic: string;
  left_position: string;
  right_position: string;
  reason: string;
}

export interface Citation {
  id: string;
  source_name: string;
  title: string;
  url: string;
  published_date?: string;
  ideological_lean: IdeologicalLean;
  snippet: string;
}

export interface ReportMetadata {
  sources_searched: number;
  total_results: number;
  citation_score: number;
  processing_time_ms: number;
}

export interface ReportData {
  thread_id: string;
  summary: string;
  claim_a: ClaimData;
  claim_b: ClaimData;
  agreements: string[];
  disagreements: DisagreementItem[];
  uncertainties: string[];
  citations: Citation[];
  metadata: ReportMetadata;
}

export interface ErrorData {
  code: ErrorCode;
  message: string;
  details?: string;
  recoverable: boolean;
  thread_id?: string;
}

export interface DoneData {
  thread_id: string;
  success: boolean;
}

export interface SSEClarificationEvent {
  type: "clarification";
  data: ClarificationData;
}

export interface SSEProgressEvent {
  type: "progress";
  data: ProgressData;
}

export interface SSEReportEvent {
  type: "report";
  data: ReportData;
}

export interface SSEErrorEvent {
  type: "error";
  data: ErrorData;
}

export interface SSEDoneEvent {
  type: "done";
  data: DoneData;
}

export type SSEEvent =
  | SSEClarificationEvent
  | SSEProgressEvent
  | SSEReportEvent
  | SSEErrorEvent
  | SSEDoneEvent;

export interface ResearchState {
  status: "idle" | "clarifying" | "researching" | "complete" | "error";
  threadId: string | null;
  clarification: ClarificationData | null;
  progress: ProgressData[];
  report: ReportData | null;
  error: ErrorData | null;
}

export interface DataSourceInfo {
  name: string;
  lean: IdeologicalLean;
  enabled: boolean;
  status: "healthy" | "degraded" | "unavailable";
}
