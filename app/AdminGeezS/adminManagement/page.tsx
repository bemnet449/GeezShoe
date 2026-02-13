"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CreateAdminForm from "./createpage";
import EditAdminForm, { type AdminRecord } from "./editpage";

export default function AdminManagementPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isMainAdmin, setIsMainAdmin] = useState<boolean | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/admin/list?requesterId=${encodeURIComponent(userId)}`);
      const data = await res.json();

      if (res.status === 403) {
        setError("You do not have permission to access admin management.");
        setAdmins([]);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to load admins. Please try again.");

      setAdmins(data.admins || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admins. Please try again later.");
      setAdmins([]);
    }
  }, [userId]);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          // If we can't read the session for any reason, send to login
          router.replace("/AdminGeezS/Login");
          return;
        }

        if (!user) {
          router.replace("/AdminGeezS/Login");
          return;
        }

        const role = (user.user_metadata as { role?: string } | null)?.role;

        // Only main admins are allowed to even touch Admin management
        if (role !== "main") {
          router.replace("/AdminGeezS/dashboard");
          return;
        }

        setUserId(user.id);
        setIsMainAdmin(true);
      } catch {
        // Any unexpected error: fail closed and redirect safely
        router.replace("/AdminGeezS/dashboard");
      }
    };

    checkAuthAndRole();
  }, [router]);

  useEffect(() => {
    if (userId && isMainAdmin) {
      setLoading(true);
      fetchAdmins().finally(() => setLoading(false));
    }
  }, [userId, isMainAdmin, fetchAdmins]);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchAdmins();
  };

  const handleEditSuccess = () => {
    setEditingAdmin(null);
    fetchAdmins();
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `/api/admin/delete?id=${encodeURIComponent(id)}&requesterId=${encodeURIComponent(userId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete. Please try again.");
      setDeleteConfirm(null);
      fetchAdmins();
      if (editingAdmin?.id === id) setEditingAdmin(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete admin");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isMainAdmin === false || (userId === null && !loading)) {
    return null;
  }

  if (loading && admins.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-stone-500 font-medium">Loading admin management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <div className="h-1 w-12 bg-amber-600 rounded-full" />
          <span className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-400">
            Admin Management
          </span>
        </div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Manage Admins
        </h1>
        <p className="text-stone-500 font-medium mt-1">
          Add, edit, or remove admin accounts with &quot;normal&quot; role.
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {admins.length === 0 && !showCreateForm ? (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-12 text-center text-stone-500">
            <p className="font-medium mb-2">No normal admins yet.</p>
            <p className="text-sm">Create one using the button below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setEditingAdmin(editingAdmin?.id === admin.id ? null : admin)
                        }
                        className="p-2 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                        aria-label="Edit admin"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {deleteConfirm === admin.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-stone-500">Delete?</span>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            disabled={deleteLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                            title="Confirm delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deleteLoading}
                            className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(admin.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          aria-label="Delete admin"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-stone-900 truncate">{admin.name}</h3>
                  <p className="text-sm text-stone-500 truncate">{admin.email}</p>
                </div>
                {editingAdmin?.id === admin.id && userId && (
                  <div className="px-5 pb-5 border-t border-stone-100 pt-5">
                    <EditAdminForm
                      admin={admin}
                      requesterId={userId}
                      onSuccess={handleEditSuccess}
                      onCancel={() => setEditingAdmin(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 md:p-6">
          {showCreateForm && userId ? (
            <div className="mb-4">
              <CreateAdminForm
                requesterId={userId}
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Admin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
