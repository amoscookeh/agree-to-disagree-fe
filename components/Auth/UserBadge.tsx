"use client";

import { useAuth } from "@/context/AuthContext";

export function UserBadge() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-sm font-medium text-white">{user.username}</div>
        <div className="text-xs text-zinc-500">
          {user.researches_used}/{user.max_researches} researches
        </div>
      </div>
      <span className="bg-teal-600/20 text-teal-400 text-xs px-2 py-1 rounded">
        trial
      </span>
      <button
        onClick={logout}
        className="text-zinc-500 hover:text-zinc-400 text-xs"
      >
        Logout
      </button>
    </div>
  );
}
