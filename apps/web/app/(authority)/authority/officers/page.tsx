"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Search, Shield, User, Activity, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  badgeNumber?: string;
  createdAt: string;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  CITIZEN: <User className="w-4 h-4 text-success" />,
  OFFICER: <Shield className="w-4 h-4 text-primary" />,
  CONTROL_ROOM: <Activity className="w-4 h-4 text-accent" />,
  AUTHORITY: <Database className="w-4 h-4 text-danger" />,
};

const ROLE_COLORS: Record<string, string> = {
  CITIZEN: "bg-success/10 text-success border-success/20",
  OFFICER: "bg-primary/10 text-primary border-primary/20",
  CONTROL_ROOM: "bg-accent/10 text-accent border-accent/20",
  AUTHORITY: "bg-danger/10 text-danger border-danger/20",
};

export default function ManageOperatives() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi("/users");
      setUsers(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingId(userId);
      setError(null);
      
      const res = await fetchApi(`/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      // Update user in state
      setUsers(users.map(u => u._id === userId ? { ...u, role: res.data.role, badgeNumber: res.data.badgeNumber } : u));
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(query) ||
      u.lastName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.phone.includes(query)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading font-black text-3xl tracking-tighter text-white uppercase flex items-center gap-3">
          <Shield className="w-8 h-8 text-danger" /> MANAGE OPERATIVES
        </h1>
        <p className="text-xs font-mono text-muted uppercase tracking-widest mt-1">
          Authority Network / Personnel Management
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded bg-danger/10 border border-danger/30 text-danger text-sm font-heading tracking-wider uppercase">
          <AlertCircle className="w-5 h-5" /> [ERROR] {error}
        </div>
      )}

      <div className="glass-card p-6 border-danger/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger/0 via-danger/50 to-danger/0 opacity-50" />
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-10 bg-black/40 border-surface-border w-full focus:border-danger focus:ring-danger/20 transition-all"
            />
          </div>
          
          <div className="text-[10px] font-mono text-muted uppercase tracking-widest px-3 py-1.5 rounded bg-surface border border-surface-border">
            Total Operatives: <span className="text-white">{filteredUsers.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-surface border border-surface-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded border border-surface-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/60 border-b border-surface-border">
                  <th className="p-4 text-[10px] font-heading font-bold text-muted uppercase tracking-widest">Personnel</th>
                  <th className="p-4 text-[10px] font-heading font-bold text-muted uppercase tracking-widest">Contact Data</th>
                  <th className="p-4 text-[10px] font-heading font-bold text-muted uppercase tracking-widest">Current Status</th>
                  <th className="p-4 text-[10px] font-heading font-bold text-muted uppercase tracking-widest text-right">Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted font-mono text-sm uppercase">
                      No operatives found matching "{search}"
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="bg-black/20 hover:bg-black/40 transition-colors group">
                      <td className="p-4">
                        <div className="font-heading font-bold text-white uppercase tracking-wider text-sm">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-[10px] font-mono text-muted uppercase mt-0.5">
                          ID: {user._id.slice(-8)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-slate-300 font-mono">{user.email}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{user.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-heading font-bold uppercase tracking-widest border ${ROLE_COLORS[user.role] || ROLE_COLORS.CITIZEN}`}>
                          {ROLE_ICONS[user.role] || ROLE_ICONS.CITIZEN}
                          {user.role}
                        </div>
                        {user.badgeNumber && (
                          <div className="text-[10px] font-mono text-primary uppercase mt-1.5">
                            Badge: {user.badgeNumber}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <select
                          className="bg-black/50 border border-surface-border rounded text-xs font-heading font-bold uppercase tracking-wider text-white px-3 py-2 outline-none focus:border-danger transition-colors cursor-pointer appearance-none disabled:opacity-50"
                          value={user.role}
                          disabled={updatingId === user._id}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        >
                          <option value="CITIZEN">Citizen</option>
                          <option value="OFFICER">Officer</option>
                          <option value="CONTROL_ROOM">Control Room</option>
                          <option value="AUTHORITY">Authority</option>
                        </select>
                        {updatingId === user._id && (
                          <span className="block mt-1 text-[10px] font-mono text-accent animate-pulse uppercase">Updating...</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
