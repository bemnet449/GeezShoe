"use client";

import { useState } from "react";

export interface CreateAdminFormProps {
  requesterId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateAdminForm({
  requesterId,
  onSuccess,
  onCancel,
}: CreateAdminFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          requesterId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create admin");
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      onSuccess();
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4"
    >
      <h3 className="font-bold text-stone-800 text-lg">Create New Admin</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block mb-1.5 font-semibold text-stone-700 text-sm">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-black placeholder:text-stone-400"
          placeholder="Admin name"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block mb-1.5 font-semibold text-stone-700 text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-black placeholder:text-stone-400"
          placeholder="admin@example.com"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block mb-1.5 font-semibold text-stone-700 text-sm">Password</label>
        <input
  type="text"  // changed from "password" to "text"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-black placeholder:text-stone-400"
  placeholder="••••••••"
  required
  minLength={6}
  disabled={loading}
/>

        <p className="text-xs text-stone-500 mt-1">Minimum 6 characters</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating...
            </span>
          ) : (
            "Create Admin"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2.5 bg-stone-100 text-stone-700 font-semibold rounded-lg hover:bg-stone-200 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
