"use client";

import { createClient } from "@/lib/supabase/client";
import {
    AlertCircle,
    ArrowLeft,
    Bell,
    CheckCircle,
    Eye, EyeOff,
    Loader2,
    Lock,
    Mail,
    Phone,
    Save, Shield,
    User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Tab = "profile" | "security" | "notification";

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
      type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }`}>
      {type === "success"
        ? <CheckCircle className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg}
    </div>
  );
}

// ── Toggle komponen yang rapi ──────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 focus:outline-none ${
        value ? "bg-violet-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function ProfilePage() {
  const supabase = createClient();
  const [tab, setTab]           = useState<Tab>("profile");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  // Profile
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [userId, setUserId]     = useState("");

  // Password
  const [newPw, setNewPw]       = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);

  // Notifikasi
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWa, setNotifWa]       = useState(true);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setNotLoggedIn(true); setLoading(false); return; }

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("users").select("full_name, phone").eq("id", user.id).single();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) { showToast("Nama tidak boleh kosong.", "error"); return; }
    setSaving(true);
    const { error } = await supabase
      .from("users").update({ full_name: fullName.trim(), phone: phone.trim() }).eq("id", userId);
    showToast(error ? "Gagal menyimpan profil." : "Profil berhasil disimpan!", error ? "error" : "success");
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!newPw || !confirmPw) { showToast("Semua field wajib diisi.", "error"); return; }
    if (newPw.length < 8)     { showToast("Password minimal 8 karakter.", "error"); return; }
    if (newPw !== confirmPw)  { showToast("Konfirmasi password tidak cocok.", "error"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { showToast("Gagal: " + error.message, "error"); }
    else { showToast("Password berhasil diganti!"); setNewPw(""); setConfirmPw(""); }
    setSaving(false);
  };

  const handleSaveNotif = async () => {
    setSaving(true);
    const { error } = await supabase.from("users")
      .update({ custom_fields: { notif_email: notifEmail, notif_wa: notifWa } } as Record<string,unknown>)
      .eq("id", userId);
    showToast(error ? "Gagal menyimpan." : "Notifikasi disimpan!", error ? "error" : "success");
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
    </div>
  );

  if (notLoggedIn) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
      <div className="text-5xl">🔒</div>
      <p className="font-semibold text-gray-700">Kamu belum masuk</p>
      <Link href="/auth/login" className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl">
        Masuk Sekarang
      </Link>
    </div>
  );

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile",      label: "Profil",     icon: User   },
    { id: "security",     label: "Keamanan",   icon: Shield },
    { id: "notification", label: "Notifikasi", icon: Bell   },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-bold">Pengaturan Akun</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Tab bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === t.id ? "bg-violet-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
              }`}>
              <t.icon className="w-3.5 h-3.5 shrink-0" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Profil ── */}
        {tab === "profile" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-700 shrink-0">
                {(fullName || email).slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{fullName || "(Belum diisi)"}</p>
                <p className="text-xs text-gray-500 truncate">{email}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Nama lengkap kamu"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input value={email} disabled
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email tidak bisa diubah.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Nomor WhatsApp
                <span className="ml-1 text-violet-600 font-normal">(untuk notifikasi)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Detail akun game & struk dikirim ke nomor ini.</p>
            </div>

            <button onClick={handleSaveProfile} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan Profil</>}
            </button>
          </div>
        )}

        {/* ── TAB: Keamanan ── */}
        {tab === "security" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Shield className="w-5 h-5 text-violet-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">Ganti Password</p>
                <p className="text-xs text-gray-500">Minimal 8 karakter</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="Min. 8 karakter"
                  className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type={showConf ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Ulangi password baru"
                  className={`w-full pl-10 pr-10 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    confirmPw && confirmPw !== newPw ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`} />
                <button type="button" onClick={() => setShowConf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPw && confirmPw !== newPw && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />Password tidak cocok
                </p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
              ⚠️ Setelah mengganti password, kamu perlu login ulang di semua perangkat.
            </div>

            <button onClick={handleChangePassword} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : <><Lock className="w-4 h-4" />Ganti Password</>}
            </button>
          </div>
        )}

        {/* ── TAB: Notifikasi ── */}
        {tab === "notification" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Bell className="w-5 h-5 text-violet-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">Pengaturan Notifikasi</p>
                <p className="text-xs text-gray-500">Pilih cara menerima notifikasi</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Email toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Notifikasi Email</p>
                  <p className="text-xs text-gray-500">Struk & konfirmasi pesanan via email</p>
                </div>
                <Toggle value={notifEmail} onChange={setNotifEmail} />
              </div>

              {/* WA toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Notifikasi WhatsApp</p>
                  <p className="text-xs text-gray-500">Detail akun game & struk via WA</p>
                </div>
                <Toggle value={notifWa} onChange={setNotifWa} />
              </div>
            </div>

            {!phone && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                ⚠️ Nomor WhatsApp belum diisi.{" "}
                <button onClick={() => setTab("profile")} className="font-semibold underline">
                  Isi sekarang
                </button>
              </div>
            )}

            <button onClick={handleSaveNotif} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan Pengaturan</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}