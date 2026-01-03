import { useReducer, useCallback, useMemo } from "react";
import { APIResearchStream, ResearchStream } from "@/lib/researchStream";
import type {
  SSEEvent,
  ClarificationData,
  ProgressData,
  ReportData,
  ErrorData,
  FollowupAnswerData,
} from "@/lib/types";

type ThreadEvent =
  | { type: "user_query"; query: string; timestamp: string }
  | { type: "progress"; data: ProgressData }
  | { type: "clarification"; data: ClarificationData }
  | { type: "user_response"; response: string; timestamp: string }
  | { type: "report"; data: ReportData }
  | { type: "followup_answer"; data: FollowupAnswerData };

interface ThreadState {
  status:
    | "idle"
    | "clarifying"
    | "researching"
    | "followup"
    | "complete"
    | "error";
  threadId: string | null;
  queryId: string | null;
  events: ThreadEvent[];
  error: ErrorData | null;
}

type ThreadAction =
  | { type: "START_RESEARCH"; query: string }
  | { type: "START_FOLLOWUP"; query: string }
  | { type: "SET_THREAD"; threadId: string; queryId: string }
  | { type: "ADD_PROGRESS"; data: ProgressData }
  | { type: "SET_CLARIFICATION"; data: ClarificationData }
  | { type: "SUBMIT_CLARIFICATION"; response: string }
  | { type: "SET_REPORT"; data: ReportData }
  | { type: "SET_FOLLOWUP_ANSWER"; data: FollowupAnswerData }
  | { type: "SET_ERROR"; data: ErrorData }
  | { type: "RESET" };

function threadReducer(state: ThreadState, action: ThreadAction): ThreadState {
  switch (action.type) {
    case "START_RESEARCH":
      return {
        ...state,
        status: "researching",
        events: [
          {
            type: "user_query",
            query: action.query,
            timestamp: new Date().toISOString(),
          },
        ],
        error: null,
      };

    case "START_FOLLOWUP":
      return {
        ...state,
        status: "followup",
        events: [
          ...state.events,
          {
            type: "user_query",
            query: action.query,
            timestamp: new Date().toISOString(),
          },
        ],
        error: null,
      };

    case "SET_THREAD":
      return {
        ...state,
        threadId: action.threadId,
        queryId: action.queryId,
      };

    case "ADD_PROGRESS":
      return {
        ...state,
        status: state.status === "followup" ? "followup" : "researching",
        events: [...state.events, { type: "progress", data: action.data }],
      };

    case "SET_CLARIFICATION":
      return {
        ...state,
        status: "clarifying",
        events: [...state.events, { type: "clarification", data: action.data }],
      };

    case "SUBMIT_CLARIFICATION":
      return {
        ...state,
        status: "researching",
        events: [
          ...state.events,
          {
            type: "user_response",
            response: action.response,
            timestamp: new Date().toISOString(),
          },
        ],
      };

    case "SET_REPORT":
      return {
        ...state,
        status: "complete",
        events: [...state.events, { type: "report", data: action.data }],
      };

    case "SET_FOLLOWUP_ANSWER":
      return {
        ...state,
        status: "complete",
        events: [
          ...state.events,
          { type: "followup_answer", data: action.data },
        ],
      };

    case "SET_ERROR":
      return {
        ...state,
        status: "error",
        error: action.data,
      };

    case "RESET":
      return {
        status: "idle",
        threadId: null,
        queryId: null,
        events: [],
        error: null,
      };

    default:
      return state;
  }
}

const initialState: ThreadState = {
  status: "idle",
  threadId: null,
  queryId: null,
  events: [],
  error: null,
};

interface UseResearchThreadOptions {
  token?: string | null;
}

export function useResearchThread(options: UseResearchThreadOptions = {}) {
  const stream = useMemo<ResearchStream>(() => {
    return new APIResearchStream(undefined, () => options.token || null);
  }, [options.token]);

  const [state, dispatch] = useReducer(threadReducer, initialState);

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case "thread":
        dispatch({
          type: "SET_THREAD",
          threadId: event.data.thread_id,
          queryId: event.data.query_id,
        });
        break;
      case "progress":
        dispatch({ type: "ADD_PROGRESS", data: event.data });
        break;
      case "clarification":
        dispatch({ type: "SET_CLARIFICATION", data: event.data });
        break;
      case "report":
        dispatch({ type: "SET_REPORT", data: event.data });
        break;
      case "followup_answer":
        dispatch({ type: "SET_FOLLOWUP_ANSWER", data: event.data });
        break;
      case "error":
        dispatch({ type: "SET_ERROR", data: event.data });
        break;
      case "done":
        dispatch({
          type: "SET_THREAD",
          threadId: event.data.thread_id,
          queryId: event.data.query_id,
        });
        break;
    }
  }, []);

  const startResearch = useCallback(
    async (query: string, clarificationResponse?: string) => {
      if (!clarificationResponse) {
        dispatch({ type: "START_RESEARCH", query });
      } else {
        dispatch({
          type: "SUBMIT_CLARIFICATION",
          response: clarificationResponse,
        });
      }

      for await (const event of stream.stream(query, clarificationResponse)) {
        handleSSEEvent(event);
      }
    },
    [stream, handleSSEEvent]
  );

  const submitClarification = useCallback(
    async (response: string) => {
      const userQueryEvent = state.events.find((e) => e.type === "user_query");
      if (!userQueryEvent || userQueryEvent.type !== "user_query") return;

      await startResearch(userQueryEvent.query, response);
    },
    [state.events, startResearch]
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // derived state
  const clarification = useMemo(() => {
    const event = state.events.findLast((e) => e.type === "clarification");
    return event?.type === "clarification" ? event.data : null;
  }, [state.events]);

  const report = useMemo(() => {
    const event = state.events.find((e) => e.type === "report");
    return event?.type === "report" ? event.data : null;
  }, [state.events]);

  return {
    status: state.status,
    threadId: state.threadId,
    queryId: state.queryId,
    events: state.events,
    clarification,
    report,
    error: state.error,
    startResearch,
    submitClarification,
    reset,
  };
}

export type { ThreadEvent, ThreadState };
