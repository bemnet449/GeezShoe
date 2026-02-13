"use client";

import { useState } from "react";

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface EditAdminFormProps {
  admin: AdminRecord;
  requesterId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditAdminForm({
  admin,
  requesterId,
  onSuccess,
  onCancel,
}: EditAdminFormProps) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: admin.id,
          name: name.trim(),
          email: email.trim(),
          requesterId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update admin");
        return;
      }

      onSuccess();
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess(false);
    if (!newPassword || newPassword.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }
    setResetLoading(true);

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: admin.id,
          newPassword,
          requesterId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || "Failed to reset password");
        return;
      }

      setResetSuccess(true);
      setNewPassword("");
      setTimeout(() => {
        setShowResetPassword(false);
        setResetSuccess(false);
      }, 2000);
    } catch (err) {
      setResetError("Network error. Please try again.");
      console.error(err);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="font-bold text-stone-800 text-lg">Edit Admin</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1.5 font-semibold text-stone-700 text-sm">Password</label>
          <div className="flex items-center gap-3">
            <input
              type="text" // now shows actual password text
              value="********"
              readOnly
              disabled
              className="w-full max-w-xs px-4 py-2.5 border border-stone-200 rounded-lg bg-stone-50 text-black"
            />
            <button
              type="button"
              onClick={() => setShowResetPassword(!showResetPassword)}
              className="px-4 py-2.5 bg-amber-100 text-amber-800 font-semibold rounded-lg hover:bg-amber-200 transition-colors"
            >
              Reset Password
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
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

      {showResetPassword && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
          <p className="font-semibold text-amber-900 text-sm">Set New Password</p>
          {resetSuccess && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium">
              Password updated successfully.
            </div>
          )}
          {resetError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {resetError}
            </div>
          )}
          <form onSubmit={handleResetPassword} className="flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text" // show password as plain text
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-black placeholder:text-stone-400"
                minLength={6}
                disabled={resetLoading}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={resetLoading || !newPassword}
                className="px-4 py-2.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {resetLoading ? "Resetting..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(false);
                  setNewPassword("");
                  setResetError("");
                }}
                className="px-4 py-2.5 bg-stone-200 text-stone-700 font-semibold rounded-lg hover:bg-stone-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
