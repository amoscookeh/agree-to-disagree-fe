import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  MockResearchStream,
  APIResearchStream,
  researchStream,
} from "../lib/researchStream";

describe("ResearchStream", () => {
  describe("MockResearchStream", () => {
    it("should yield progress and report events", async () => {
      const mock = new MockResearchStream();
      const events = [];

      for await (const event of mock.stream("test query")) {
        events.push(event);
      }

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe("progress");
      expect(events[events.length - 1].type).toBe("done");

      const reportEvent = events.find((e) => e.type === "report");
      expect(reportEvent).toBeDefined();
      if (reportEvent && reportEvent.type === "report") {
        expect(reportEvent.data.summary).toContain("test query");
      }
    }, 15000);
  });

  describe("APIResearchStream", () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it("should yield error event when fetch fails", async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

      const api = new APIResearchStream("http://localhost:8000");
      const events = [];

      for await (const event of api.stream("test query")) {
        events.push(event);
      }

      expect(events.length).toBe(1);
      expect(events[0].type).toBe("error");
      if (events[0].type === "error") {
        expect(events[0].data.code).toBe("INTERNAL_ERROR");
        expect(events[0].data.message).toContain("Cannot connect to backend");
      }
    });

    it("should yield error event when response is not ok", async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const api = new APIResearchStream("http://localhost:8000");
      const events = [];

      for await (const event of api.stream("test query")) {
        events.push(event);
      }

      expect(events.length).toBe(1);
      expect(events[0].type).toBe("error");
      if (events[0].type === "error") {
        expect(events[0].data.code).toBe("RESEARCH_FAILED");
        expect(events[0].data.message).toContain("500");
      }
    });
  });

  describe("researchStream default", () => {
    it("should default to MockResearchStream when NEXT_PUBLIC_TEST_MODE is not set", () => {
      expect(researchStream).toBeInstanceOf(MockResearchStream);
    });
  });
});
