interface ClarificationMessageProps {
  question: string;
  questions?: string[];
  suggestions?: string[];
  timestamp: string;
}

export function ClarificationMessage({
  question,
  questions,
  suggestions,
  timestamp,
}: ClarificationMessageProps) {
  return (
    <div className="border border-teal-800 rounded-lg p-4 bg-teal-950/30 mr-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-teal-500">Clarification Needed</span>
        <span className="text-zinc-600">•</span>
        <span className="text-xs text-zinc-500">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-zinc-300 mb-3">{question}</p>

      {questions && questions.length > 0 && (
        <div className="space-y-2 mb-3">
          <p className="text-sm font-medium text-zinc-300">Please clarify:</p>
          <ul className="space-y-2">
            {questions.map((q, idx) => (
              <li key={idx} className="text-zinc-400 text-sm flex gap-3">
                <span className="text-teal-500">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <span
              key={i}
              className="text-xs bg-teal-900/30 px-2 py-1 rounded text-teal-400"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
