"use client";

import { useState, useCallback, FormEvent } from "react";

interface ChatInputProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = "What should we explore today?",
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed && !disabled) {
        onSubmit(trimmed);
        setInput("");
      }
    },
    [input, disabled, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono text-sm"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-mono text-sm rounded-lg transition-colors"
        >
          {disabled ? "..." : "→"}
        </button>
      </div>
    </form>
  );
}
