"use client";

import { useState } from "react";
import type { ClarificationData } from "@/lib/types";

interface ClarificationPromptProps {
  data: ClarificationData;
  onSubmit: (response: string) => void;
  onCancel: () => void;
}

export function ClarificationPrompt({
  data,
  onSubmit,
  onCancel,
}: ClarificationPromptProps) {
  const [response, setResponse] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim()) {
      onSubmit(response.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Let's clarify your question</h2>
        <p className="text-zinc-400">
          To provide the most accurate research, I need a bit more detail.
        </p>
      </div>

      <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
        <h3 className="text-lg font-semibold mb-4 text-teal-500">
          Questions to help refine your query:
        </h3>
        <ul className="space-y-3">
          {data.questions.map((question, idx) => (
            <li key={idx} className="text-zinc-300 text-sm flex gap-3">
              <span className="text-teal-500 font-mono">•</span>
              <span>{question}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="clarification"
            className="block text-sm text-zinc-400 mb-2"
          >
            Your clarification:
          </label>
          <textarea
            id="clarification"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Please provide more details about what you're looking for..."
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors font-mono text-sm resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!response.trim()}
            className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-mono text-sm rounded-lg transition-colors"
          >
            Continue Research
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-sm rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
