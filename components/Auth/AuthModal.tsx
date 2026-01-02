"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, checkUsername } = useAuth();

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const exists = await checkUsername(username);

      if (exists) {
        await login(username, password);
        onSuccess();
        onClose();
        resetForm();
      } else {
        setShowConfirm(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await register(username, password);
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setShowConfirm(false);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">Welcome</h2>

        {!showConfirm ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              title="Username must be 3-20 characters, alphanumeric and underscores only"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
              required
              minLength={8}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2 rounded font-medium disabled:opacity-50"
            >
              {loading ? "..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="text-zinc-400 text-sm mb-4">
              Username{" "}
              <span className="text-white font-medium">{username}</span>{" "}
              doesn&apos;t exist. Create a new account?
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
              required
              minLength={8}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmPassword("");
                  setError("");
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-2 rounded font-medium disabled:opacity-50"
              >
                {loading ? "..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        <button
          onClick={handleClose}
          className="mt-4 text-zinc-500 hover:text-zinc-400 text-sm w-full text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
