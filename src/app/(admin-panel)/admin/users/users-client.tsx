"use client";

import { useState } from "react";
import { initialAdminUsers } from "@/features/admin/mock-data";
import { AdminUserRecord } from "@/features/admin/types";
import { toggleUserStatusAction } from "@/features/admin/actions";
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

interface Props {
  initialUsers?: AdminUserRecord[];
}

export function AdminUsersClient({ initialUsers = initialAdminUsers }: Props) {
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
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

  const handleToggleStatus = async (userId: string, currentStatus: "active" | "suspended") => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, status: newStatus };
        }
        return u;
      })
    );

    const res = await toggleUserStatusAction(userId, currentStatus);
    if (!res.success) {
      // Revert if action failed
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            return { ...u, status: currentStatus };
          }
          return u;
        })
      );
      alert(res.error || "Failed to update user status");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header (Notion Workspace Title) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e3df]">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#dcecfa] text-[#005bab] flex items-center justify-center shrink-0 border border-[#b8dcfa]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] tracking-tight">
              Users Management
            </h1>
            <p className="text-xs sm:text-sm text-[#787671] mt-0.5">
              Inspect user directories, review verification status, and manage moderation permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#f7f6f3] text-[#37352f] border border-[#e5e3df]">
            <span className="h-2 w-2 rounded-full bg-[#185CFF]" />
            <span>{users.length} registered accounts</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar (Notion Database Controls) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-xl border border-[#e5e3df] shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#a4a097]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, email, or @username..."
            className="w-full rounded-lg border-0 bg-transparent pl-9 pr-3 py-1.5 text-xs sm:text-sm text-[#37352f] placeholder:text-[#a4a097] focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ede9e4]">
          <Filter className="h-3.5 w-3.5 text-[#a4a097] ml-2 shrink-0 hidden sm:block" />
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${statusFilter === "all"
              ? "bg-[#1a1a1a] text-white"
              : "bg-transparent text-[#787671] hover:bg-[#f7f6f3] hover:text-[#1a1a1a]"
              }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${statusFilter === "active"
              ? "bg-[#d9f3e1] text-[#0f5132] border border-[#b8e8c6]"
              : "bg-transparent text-[#787671] hover:bg-[#f7f6f3] hover:text-[#1a1a1a]"
              }`}
          >
            Active ({users.filter((u) => u.status === "active").length})
          </button>
          <button
            onClick={() => setStatusFilter("suspended")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${statusFilter === "suspended"
              ? "bg-[#fde0ec] text-[#a02e6d] border border-[#f8b4d0]"
              : "bg-transparent text-[#787671] hover:bg-[#f7f6f3] hover:text-[#1a1a1a]"
              }`}
          >
            Suspended ({users.filter((u) => u.status === "suspended").length})
          </button>
        </div>
      </div>

      {/* Users Data Table (Notion Database Table) */}
      <div className="rounded-xl border border-[#e5e3df] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafaf9] border-b border-[#e5e3df] text-[11px] font-medium uppercase tracking-wider text-[#787671]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Txns</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede9e4] text-[#37352f]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#787671]">
                    No users matching search criteria &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#f7f6f3]/60 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#f0eeec] flex items-center justify-center text-xs font-semibold text-[#37352f] border border-[#e5e3df] shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1a1a1a] text-xs">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-[#787671] font-mono">
                            {user.email} · @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${user.role === "admin"
                          ? "bg-[#e6e0f5] text-[#391c57] border border-[#d6b6f6]"
                          : "bg-[#f0eeec] text-[#37352f] border border-[#e5e3df]"
                          }`}
                      >
                        {user.role === "admin" && (
                          <Shield className="h-3 w-3" />
                        )}
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${user.status === "active"
                          ? "bg-[#d9f3e1] text-[#0f5132] border border-[#b8e8c6]"
                          : "bg-[#fde0ec] text-[#a02e6d] border border-[#f8b4d0]"
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

                    <td className="py-3.5 px-4 font-mono text-[#37352f]">
                      {user.totalExpensesCount}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#787671]">
                      {user.joinedAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status === "active" ? "active" : "suspended")}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${user.status === "active"
                          ? "bg-[#fde0ec]/50 text-[#a02e6d] border border-[#f8b4d0] hover:bg-[#fde0ec]"
                          : "bg-[#d9f3e1]/50 text-[#0f5132] border border-[#b8e8c6] hover:bg-[#d9f3e1]"
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
