// ================================================================
//  YuukiStore — Navbar Baru + Footer Copyright
//
//  FILE 1: src/components/storefront/Navbar.tsx
//  FILE 2: src/components/storefront/Footer.tsx
//  FILE 3: src/app/(storefront)/layout.tsx
// ================================================================

"use client";

// ────────────────────────────────────────────────────────────────
// FILE 1: src/components/storefront/Navbar.tsx
// Navbar minimalis — logo kiri, ikon profil kanan (dropdown)
// ────────────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/client";
import type { User as UserProfile } from "@/types/database";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
    ChevronDown,
    LayoutDashboard,
    LogIn,
    LogOut,
    Search,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Store,
    User,
    UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ── Hook: ambil session + profil user ──────────────────────────
function useCurrentUser() {
  const supabase = createClient();
  const [user, setUser]       = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setProfile(data);
        } else {
          setProfile(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading };
}

// ── Avatar inisial ─────────────────────────────────────────────
function AvatarInitials({ name, email, size = "md" }: {
  name: string | null;
  email: string;
  size?: "sm" | "md";
}) {
  const text = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : email.slice(0, 2).toUpperCase();
  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center flex-shrink-0`}>
      {text}
    </div>
  );
}

// ── Dropdown menu profil ───────────────────────────────────────
function ProfileDropdown({ user, profile, onClose }: {
  user: SupabaseUser;
  profile: UserProfile | null;
  onClose: () => void;
}) {
  const router  = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    router.push("/");
    router.refresh();
  };

  const isAdmin = profile?.role === "admin";

  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
      {/* Info user */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2.5">
          <AvatarInitials name={profile?.full_name ?? null} email={user.email ?? ""} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {profile?.full_name || "Pengguna"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full font-semibold mt-0.5">
                👑 Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {isAdmin && (
          <Link
            href="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-violet-700 hover:bg-violet-50 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin Panel
          </Link>
        )}
        <Link
          href="/orders"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Pesanan saya
        </Link>
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Pengaturan akun
        </Link>
      </div>

      <div className="border-t border-gray-100 py-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}

// ── Dropdown tamu (belum login) ────────────────────────────────
function GuestDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">Belum masuk ke akun</p>
      </div>
      <div className="p-2 space-y-1">
        <Link
          href="/auth/login"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <LogIn className="w-4 h-4 text-violet-600" />
          Masuk
        </Link>
        <Link
          href="/auth/register"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}

// ── Komponen Navbar utama ──────────────────────────────────────
export function Navbar() {
  const { user, profile, loading } = useCurrentUser();
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">YuukiStore</span>
        </Link>

        {/* Search bar (tengah, hanya desktop) */}
        <div className="hidden md:flex flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari produk..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400"
          />
        </div>

        {/* Kanan: cart + profil */}
        <div className="flex items-center gap-2">
          {/* Search mobile */}
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <Search className="w-5 h-5" />
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              0
            </span>
          </Link>

          {/* Profil / dropdown */}
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Menu profil"
            >
              {loading ? (
                <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
              ) : user ? (
                <>
                  <AvatarInitials
                    name={profile?.full_name ?? null}
                    email={user.email ?? ""}
                  />
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
                </>
              )}
            </button>

            {open && (
              user
                ? <ProfileDropdown user={user} profile={profile} onClose={() => setOpen(false)} />
                : <GuestDropdown onClose={() => setOpen(false)} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}