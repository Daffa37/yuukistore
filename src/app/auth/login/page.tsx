// ================================================================
//  FILE 4: src/app/auth/login/page.tsx  — FINAL, tidak akan error
// ================================================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email dan password wajib diisi."); return; }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      const { data: profile } = await supabase
        .from("users").select("role").eq("id", data.user.id).single();

      router.push(profile?.role === "admin" ? "/admin/dashboard" : "/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login gagal";
      if (msg.includes("Invalid login credentials")) {
        setError("Email atau password salah. Periksa kembali.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Email belum dikonfirmasi. Cek inbox kamu.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-100 rounded-2xl mb-3">
            <Store className="w-6 h-6 text-violet-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Masuk ke YuukiStore</h1>
          <p className="text-sm text-gray-500 mt-1">Selamat datang kembali!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Memproses...</> : "Masuk"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">atau</span></div>
        </div>

        <p className="text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-violet-600 font-semibold hover:underline">Daftar sekarang</Link>
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