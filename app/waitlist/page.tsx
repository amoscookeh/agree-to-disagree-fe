"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { config } from "@/lib/config";

export default function WaitlistPage() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch(`${config.apiUrl}/api/waitlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Failed to join waitlist");
        }

        await refreshUser();
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [token, email, refreshUser]
  );

  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <article className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          You&apos;ve used all your researches!
        </h1>
        <p className="text-zinc-400 mb-2">
          Join the waitlist to get notified when we launch more features and
          increase limits.
        </p>
        <p className="text-zinc-500 text-sm mb-8">
          Logged in as <span className="text-teal-500">{user.username}</span>
        </p>

        {submitted ? (
          <div role="status" aria-live="polite">
            <p className="text-teal-500 mb-4">
              Thanks! We&apos;ll be in touch at {email}
            </p>
            <button
              onClick={handleGoHome}
              className="text-zinc-500 hover:text-zinc-400 text-sm"
            >
              ← Back to home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                required
                aria-describedby={error ? "waitlist-error" : undefined}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
                aria-busy={loading}
              >
                {loading ? "..." : "Join"}
              </button>
            </div>
            {error && (
              <p
                id="waitlist-error"
                className="text-red-500 text-sm"
                role="alert"
              >
                {error}
              </p>
            )}
          </form>
        )}
      </article>
    </main>
  );
}
