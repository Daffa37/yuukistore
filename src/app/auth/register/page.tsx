// ================================================================
//  FILE 5: src/app/auth/register/page.tsx  — FINAL, tidak akan error
// ================================================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, CheckCircle, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)          s++;
    if (/[A-Z]/.test(password))        s++;
    if (/[0-9]/.test(password))        s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-400"][strength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim())      { setError("Nama lengkap wajib diisi."); return; }
    if (!email)                { setError("Email wajib diisi."); return; }
    if (password.length < 8)   { setError("Password minimal 8 karakter."); return; }
    if (password !== confirm)  { setError("Konfirmasi password tidak cocok."); return; }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim(), phone: phone.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pendaftaran gagal";
      if (msg.includes("already registered") || msg.includes("User already registered")) {
        setError("Email ini sudah terdaftar. Coba masuk atau gunakan email lain.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Daftar berhasil!</h2>
          <p className="text-sm text-gray-600 mb-6">
            Link konfirmasi dikirim ke <strong>{email}</strong>. Cek inbox atau folder spam kamu.
          </p>
          <Link href="/auth/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700">
            Masuk sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-100 rounded-2xl mb-3">
            <UserPlus className="w-6 h-6 text-violet-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Buat akun baru</h1>
          <p className="text-sm text-gray-500 mt-1">Gratis selamanya</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}

          {[
            { label: "Nama Lengkap", id: "name",  type: "text",  icon: User,  val: fullName, set: setFullName, ph: "Nama kamu",        req: true  },
            { label: "Email",        id: "email", type: "email", icon: Mail,  val: email,    set: setEmail,    ph: "kamu@email.com",    req: true  },
            { label: "Nomor HP (opsional)", id: "phone", type: "tel", icon: Phone, val: phone, set: setPhone, ph: "08xxxxxxxxxx", req: false },
          ].map((f) => (
            <div key={f.id} className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">{f.label}</label>
              <div className="relative">
                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type={f.type} value={f.val} onChange={(e) => f.set(e.target.value)}
                  placeholder={f.ph} required={f.req}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400" />
              </div>
            </div>
          ))}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 karakter"
                className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400" />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : "bg-gray-100"}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Kekuatan: <span className="font-medium">{strengthLabel}</span></p>
              </div>
            )}
          </div>

          {/* Konfirmasi */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type={showCf ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi password"
                className={`w-full pl-10 pr-10 py-3 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400 ${confirm && confirm !== password ? "border-red-300" : "border-gray-200"}`} />
              <button type="button" onClick={() => setShowCf(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm && confirm !== password && (
              <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Password tidak cocok</p>
            )}
          </div>

          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            Dengan mendaftar, kamu menyetujui{" "}
            <Link href="/terms" className="text-violet-600 hover:underline">Syarat & Ketentuan</Link> kami.
          </p>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Mendaftar...</> : "Daftar Sekarang"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">atau</span></div>
        </div>
        <p className="text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-violet-600 font-semibold hover:underline">Masuk di sini</Link>
        </p>
      </div>
      <div className="text-center mt-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}