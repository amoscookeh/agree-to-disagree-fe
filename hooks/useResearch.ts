import { useState, useCallback, useMemo } from "react";
import { APIResearchStream, ResearchStream } from "@/lib/researchStream";
import type { ResearchState, SSEEvent } from "@/lib/types";

interface UseResearchOptions {
  stream?: ResearchStream;
  token?: string | null;
}

export function useResearch(options: UseResearchOptions = {}) {
  const stream = useMemo(() => {
    if (options.stream) return options.stream;
    return new APIResearchStream(undefined, () => options.token || null);
  }, [options.stream, options.token]);

  const [state, setState] = useState<ResearchState>({
    status: "idle",
    threadId: null,
    queryId: null,
    clarification: null,
    progress: [],
    report: null,
    error: null,
  });
  const [originalQuery, setOriginalQuery] = useState<string>("");

  const startResearch = useCallback(
    async (query: string, clarificationResponse?: string) => {
      if (!clarificationResponse) {
        setOriginalQuery(query);
      }

      setState({
        status: "researching",
        threadId: null,
        queryId: null,
        clarification: null,
        progress: [],
        report: null,
        error: null,
      });

      for await (const event of stream.stream(query, clarificationResponse)) {
        handleEvent(event);
      }
    },
    [stream]
  );

  const handleEvent = (event: SSEEvent) => {
    switch (event.type) {
      case "thread":
        setState((prev) => ({
          ...prev,
          threadId: event.data.thread_id,
          queryId: event.data.query_id,
        }));
        break;

      case "clarification":
        setState((prev) => ({
          ...prev,
          status: "clarifying",
          threadId: event.data.thread_id,
          clarification: event.data,
        }));
        break;

      case "progress":
        setState((prev) => ({
          ...prev,
          status: "researching",
          progress: [...prev.progress, event.data],
        }));
        break;

      case "report":
        setState((prev) => ({
          ...prev,
          status: "complete",
          threadId: event.data.thread_id,
          report: event.data,
        }));
        break;

      case "error":
        setState((prev) => ({
          ...prev,
          status: "error",
          error: event.data,
        }));
        break;

      case "done":
        setState((prev) => ({
          ...prev,
          threadId: event.data.thread_id,
          queryId: event.data.query_id,
        }));
        break;
    }
  };

  const reset = useCallback(() => {
    setState({
      status: "idle",
      threadId: null,
      queryId: null,
      clarification: null,
      progress: [],
      report: null,
      error: null,
    });
    setOriginalQuery("");
  }, []);

  const submitClarification = useCallback(
    async (response: string) => {
      if (!state.clarification || !originalQuery) return;

      await startResearch(originalQuery, response);
    },
    [state.clarification, originalQuery, startResearch]
  );

  return {
    ...state,
    startResearch,
    submitClarification,
    reset,
  };
}
