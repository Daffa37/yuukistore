// ================================================================
//  FILE 1: src/app/admin/users/page.tsx
//  Data user dari Supabase — tanpa dummy data
// ================================================================
"use client";

import { useState, useEffect } from "react";
import {
  Users, Search, RefreshCw, Shield, ShieldOff,
  UserCheck, UserX, Eye, CheckCircle, Loader2,
  AlertCircle, Crown, User, Plus, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserRow {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
}

const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(s));

const COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-green-100 text-green-700",
  "bg-pink-100 text-pink-700",
];
const avatarColor = (id: string) => COLORS[id.charCodeAt(0) % COLORS.length];
const initials = (name: string | null, email: string) =>
  (name ? name.slice(0, 2) : email.slice(0, 2)).toUpperCase();

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
      type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }`}>
      {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </div>
  );
}

// ── Modal detail user ──────────────────────────────────────────
function UserDetailModal({
  user, onClose, onUpdate,
}: {
  user: UserRow;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRole = async () => {
    setLoading("role");
    const newRole = user.role === "admin" ? "user" : "admin";
    await supabase.from("users").update({ role: newRole }).eq("id", user.id);
    setLoading(null);
    onUpdate();
    onClose();
  };

  const handleStatus = async () => {
    setLoading("status");
    await supabase.from("users").update({ is_active: !user.is_active }).eq("id", user.id);
    setLoading(null);
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4">
      <div className="w-full sm:max-w-md bg-white rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Detail Pengguna</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${avatarColor(user.id)}`}>
            {initials(user.full_name, user.email)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{user.full_name || "(Belum diisi)"}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <div className="flex gap-1.5 mt-1">
              {user.role === "admin" ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full font-semibold">👑 Admin</span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-semibold">User</span>
              )}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {user.is_active ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          {[
            { label: "Email",       value: user.email },
            { label: "No. HP / WA", value: user.phone || "—" },
            { label: "Bergabung",   value: fmtDate(user.created_at) },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">{r.label}</span>
              <span className="font-medium text-gray-900 truncate max-w-48">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button onClick={handleRole} disabled={loading === "role"}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
              user.role === "admin"
                ? "border-gray-200 text-gray-700 hover:bg-gray-50"
                : "border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100"
            }`}>
            {loading === "role" ? <Loader2 className="w-4 h-4 animate-spin" /> :
              user.role === "admin"
                ? <><ShieldOff className="w-4 h-4" /> Cabut hak admin</>
                : <><Shield className="w-4 h-4" /> Jadikan Admin</>}
          </button>

          <button onClick={handleStatus} disabled={loading === "status"}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
              user.is_active
                ? "border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
            }`}>
            {loading === "status" ? <Loader2 className="w-4 h-4 animate-spin" /> :
              user.is_active
                ? <><UserX className="w-4 h-4" /> Nonaktifkan akun</>
                : <><UserCheck className="w-4 h-4" /> Aktifkan akun</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [selected, setSelected]     = useState<UserRow | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from("users").select("*").order("created_at", { ascending: false });
    if (filterRole !== "all")           query = query.eq("role", filterRole);
    if (filterStatus === "active")      query = query.eq("is_active", true);
    if (filterStatus === "inactive")    query = query.eq("is_active", false);
    if (search.trim())
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);

    const { data, error } = await query;
    if (!error) setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [filterRole, filterStatus]);

  const stats = {
    total:  users.length,
    admin:  users.filter(u => u.role === "admin").length,
    active: users.filter(u => u.is_active).length,
    new:    users.filter(u => {
      const d = new Date(u.created_at);
      return Date.now() - d.getTime() < 30 * 24 * 60 * 60 * 1000;
    }).length,
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => { fetchUsers(); showToast("Data pengguna diperbarui!"); }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pengguna</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola akun pembeli dan admin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total User",     value: stats.total,  color: "text-gray-900"   },
          { label: "Admin",          value: stats.admin,  color: "text-violet-700" },
          { label: "Akun Aktif",     value: stats.active, color: "text-green-700"  },
          { label: "Baru (30 hari)", value: stats.new,    color: "text-blue-700"   },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 p-3 border-b border-gray-50">
          <form onSubmit={e => { e.preventDefault(); fetchUsers(); }} className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, email, no. HP..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50" />
          </form>
          <div className="flex gap-2">
            <select value={filterRole} onChange={e => setFilterRole(e.target.value as typeof filterRole)}
              className="px-2 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-2 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <button onClick={fetchUsers}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Belum ada pengguna terdaftar</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Pengguna</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Kontak</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Role</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Bergabung</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(u.id)}`}>
                            {initials(u.full_name, u.email)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.full_name || "(Belum diisi)"}</p>
                            <p className="text-xs text-gray-400 font-mono">#{u.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 truncate max-w-48">{u.email}</p>
                        <p className="text-xs text-gray-400">{u.phone || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.role === "admin"
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full"><Crown className="w-3 h-3" /> Admin</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full"><User className="w-3 h-3" /> User</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {u.is_active ? "● Aktif" : "○ Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setSelected(u)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={async () => {
                            const newRole = u.role === "admin" ? "user" : "admin";
                            await supabase.from("users").update({ role: newRole }).eq("id", u.id);
                            showToast(`Role diubah ke ${newRole}`);
                            fetchUsers();
                          }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                            {u.role === "admin" ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </button>
                          <button onClick={async () => {
                            await supabase.from("users").update({ is_active: !u.is_active }).eq("id", u.id);
                            showToast(u.is_active ? "Akun dinonaktifkan" : "Akun diaktifkan");
                            fetchUsers();
                          }} className={`p-1.5 rounded-lg transition-colors ${u.is_active ? "text-gray-400 hover:text-red-600 hover:bg-red-50" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}`}>
                            {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(u.id)}`}>
                    {initials(u.full_name, u.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{u.full_name || "(Belum diisi)"}</p>
                      {u.role === "admin" && <span className="text-[9px] px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full font-bold">👑 Admin</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    <span className={`text-[10px] font-semibold ${u.is_active ? "text-green-600" : "text-red-500"}`}>
                      {u.is_active ? "● Aktif" : "○ Nonaktif"}
                    </span>
                  </div>
                  <button onClick={() => setSelected(u)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-500">
          {users.length} pengguna ditampilkan
        </div>
      </div>
    </div>
  );
}