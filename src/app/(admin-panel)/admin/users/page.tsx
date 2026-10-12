"use client";

import { useState } from "react";
import { initialAdminUsers } from "@/features/admin/mock-data";
import { AdminUserRecord } from "@/features/admin/types";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Filter,
  UserCheck,
  UserX,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>(initialAdminUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : u.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "active" ? "suspended" : "active";
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-blue-400" />
            Users Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit user profiles, inspect account standing, and manage platform permissions
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          Total Registered: <strong className="text-white">{users.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or @username..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#185CFF] focus:outline-none focus:ring-1 focus:ring-[#185CFF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#185CFF] text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Active ({users.filter((u) => u.status === "active").length})
          </button>
          <button
            onClick={() => setStatusFilter("suspended")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === "suspended"
                ? "bg-red-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Suspended ({users.filter((u) => u.status === "suspended").length})
          </button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Txns</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No users matching criteria &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700 shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {user.email} · @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === "admin"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield className="h-3 w-3" />
                        ) : null}
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {user.status === "active" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <ShieldAlert className="h-3 w-3" />
                        )}
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {user.totalExpensesCount}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {user.joinedAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          user.status === "active"
                            ? "bg-red-950/60 text-red-300 border border-red-800/80 hover:bg-red-900/80"
                            : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/80"
                        }`}
                      >
                        {user.status === "active" ? (
                          <>
                            <UserX className="h-3.5 w-3.5" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
