"use client";

import { createClient } from "@/lib/supabase/client";
import {
    ArrowRight, CheckCircle,
    ChevronDown,
    CreditCard,
    Gamepad2,
    Gift,
    Headphones,
    LayoutDashboard,
    LogIn,
    LogOut,
    Search,
    Settings,
    Shield,
    ShoppingBag,
    Smartphone,
    Store,
    User,
    UserPlus,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Category {
  id: string; name: string; slug: string;
  icon_url: string | null; is_active: boolean; sort_order: number;
}
interface Product {
  id: string; name: string; slug: string; base_price: number;
  thumbnail_url: string | null; custom_fields: Record<string, unknown>;
  categories?: { name: string; slug: string };
}

// Tidak ada harga di card — harga hanya tampil di halaman detail produk
const getCatIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("game") || n.includes("top")) return Gamepad2;
  if (n.includes("pulsa") || n.includes("data")) return Smartphone;
  if (n.includes("akun")) return CreditCard;
  if (n.includes("gift") || n.includes("item")) return Gift;
  return ShoppingBag;
};

// ── Navbar ─────────────────────────────────────────────────────
function Navbar() {
  const supabase = createClient();
  const [user, setUser]     = useState<{ email: string; id: string } | null>(null);
  const [role, setRole]     = useState("user");
  const [open, setOpen]     = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ email: user.email ?? "", id: user.id });
        const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
        if (data) setRole(data.role);
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser({ email: session.user.email ?? "", id: session.user.id });
        const { data } = await supabase.from("users").select("role").eq("id", session.user.id).single();
        if (data) setRole(data.role);
      } else { setUser(null); setRole("user"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("#profile-btn")) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = "/";
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">YuukiStore</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/search" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <Search className="w-5 h-5" />
          </Link>

          <div id="profile-btn" className="relative">
            <button onClick={() => setOpen(v => !v)}
              className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              suppressHydrationWarning>
              <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center">
                {mounted && user ? initials : <User className="w-4 h-4 text-gray-500" />}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform hidden sm:block ${open ? "rotate-180" : ""}`} />
            </button>

            {open && mounted && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user.email}</p>
                      {role === "admin" && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full font-semibold mt-1">
                          👑 Admin
                        </span>
                      )}
                    </div>
                    <div className="py-1">
                      {role === "admin" && (
                        <Link href="/admin/dashboard" onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-violet-700 hover:bg-violet-50">
                          <LayoutDashboard className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <Link href="/orders" onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <ShoppingBag className="w-4 h-4" /> Pesanan Saya
                      </Link>
                      <Link href="/profile" onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4" /> Pengaturan
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Keluar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500">Belum masuk ke akun</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link href="/auth/login" onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">
                        <LogIn className="w-4 h-4 text-violet-600" /> Masuk
                      </Link>
                      <Link href="/auth/register" onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white bg-violet-600 rounded-xl hover:bg-violet-700">
                        <UserPlus className="w-4 h-4" /> Daftar sekarang
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── Footer ─────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">YuukiStore</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Platform jual-beli produk digital terpercaya. Top-up game, pulsa, akun, dan gift card.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-gray-800 mb-2 text-xs uppercase tracking-wide">Produk</p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                <li><Link href="/categories/top-up-game" className="hover:text-violet-600">Top-Up Game</Link></li>
                <li><Link href="/categories/pulsa-data"  className="hover:text-violet-600">Pulsa & Data</Link></li>
                <li><Link href="/categories/akun-game"   className="hover:text-violet-600">Akun Game</Link></li>
                <li><Link href="/categories/gift-card"   className="hover:text-violet-600">Gift Card</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2 text-xs uppercase tracking-wide">Bantuan</p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                <li><Link href="/contact" className="hover:text-violet-600">Hubungi Kami</Link></li>
                <li><Link href="/terms"   className="hover:text-violet-600">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="hover:text-violet-600">Kebijakan Privasi</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} YuukiStore. Hak cipta dilindungi undang-undang.</p>
          <p className="text-xs text-gray-300">Dibuat dengan ❤️ untuk komunitas gamer Indonesia</p>
        </div>
      </div>
    </footer>
  );
}

// ── Info Banner Transaksi Manual ───────────────────────────────
function ManualTransactionBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-start gap-2">
        <span className="text-amber-500 text-sm mt-0.5 flex-shrink-0">⚠️</span>
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-bold">INFO:</span> Semua transaksi diproses <span className="font-bold">MANUAL</span>.
          Jam kerja admin: <span className="font-bold">08.00 – 21.00 WIB</span>.
          Harap bersabar menunggu antrean proses setelah melakukan pembayaran.
          Hubungi CS WhatsApp kami jika pesanan belum masuk lebih dari <span className="font-bold">30 menit</span>.
        </p>
      </div>
    </div>
  );
}

// ── Homepage utama ─────────────────────────────────────────────
export default function HomePage() {
  const supabase = createClient();
  const [categories, setCategories]   = useState<Category[]>([]);
  const [products, setProducts]       = useState<Product[]>([]);
  const [searchQ, setSearchQ]         = useState("");
  const [loadingCat, setLoadingCat]   = useState(true);
  const [loadingProd, setLoadingProd] = useState(true);

  useEffect(() => {
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => { setCategories(data ?? []); setLoadingCat(false); });
    supabase.from("products").select("*, categories(name, slug)")
      .eq("is_active", true).order("sort_order").limit(8)
      .then(({ data }) => { setProducts(data ?? []); setLoadingProd(false); });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) window.location.href = `/search?q=${encodeURIComponent(searchQ.trim())}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ManualTransactionBanner />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 text-white">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-medium mb-4">
            <Zap className="w-3 h-3" /> Top-up cepat & aman
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">
            Toko Digital <span className="text-violet-200">Terpercaya</span>
          </h1>
          <p className="text-base md:text-lg text-violet-100 max-w-md mx-auto mb-8">
            Diamond game, pulsa, akun, dan ribuan produk digital lainnya — proses instan, harga terjangkau.
          </p>
          <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Cari produk, game, pulsa..."
              className="w-full pl-11 pr-24 py-3.5 rounded-xl text-gray-900 text-sm bg-white focus:outline-none placeholder:text-gray-400" />
            <button type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700">
              Cari
            </button>
          </form>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs">
            {[
              { label: "10.000+ Transaksi", icon: CheckCircle },
              { label: "Proses Instan", icon: Zap },
              { label: "24/7 Support", icon: Headphones },
            ].map(b => (
              <span key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
                <b.icon className="w-3 h-3 text-violet-200" /> {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Kategori */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Kategori</h2>
          <Link href="/categories" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
            Lihat semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loadingCat ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Belum ada kategori.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map(cat => {
              const Icon = getCatIcon(cat.name);
              return (
                <Link key={cat.id} href={`/categories/${cat.slug}`}
                  className="flex flex-col items-center gap-2.5 p-4 bg-white border border-gray-100 rounded-xl hover:border-violet-200 hover:shadow-sm transition-all text-center group">
                  {cat.icon_url ? (
                    <img src={cat.icon_url} alt={cat.name} className="w-12 h-12 object-cover rounded-xl" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-violet-100 group-hover:bg-violet-200 transition-colors flex items-center justify-center">
                      <Icon className="w-6 h-6 text-violet-600" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Produk Unggulan — TANPA HARGA di card */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Produk Unggulan</h2>
          <Link href="/products" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
            Semua produk <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loadingProd ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Belum ada produk</p>
            <p className="text-xs mt-1">Admin bisa menambahkan produk di panel admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {products.map(p => (
              <Link key={p.id} href={`/products/${p.slug}`}
                className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-violet-200 hover:shadow-md transition-all">
                {/* Thumbnail */}
                <div className="aspect-square bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
                  {p.thumbnail_url
                    ? <img src={p.thumbnail_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <ShoppingBag className="w-10 h-10 text-violet-300" />}
                  {p.custom_fields?.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-violet-600 text-white text-[10px] font-semibold rounded-full">
                      {String(p.custom_fields.badge)}
                    </span>
                  )}
                </div>
                {/* Info — TANPA HARGA */}
                <div className="p-3">
                  <p className="text-[11px] text-violet-600 font-medium mb-0.5">{p.categories?.name}</p>
                  <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-1.5">Klik untuk lihat harga →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Keunggulan */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-lg font-bold text-gray-900 text-center mb-6">Kenapa YuukiStore?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap,         title: "Proses Manual",   desc: "Admin memproses setiap pesanan dengan teliti dan cermat." },
              { icon: Shield,      title: "100% Aman",       desc: "Transaksi terenkripsi & data pembeli terlindungi." },
              { icon: Headphones,  title: "CS 08–21 WIB",   desc: "Tim kami siap membantu setiap hari jam 08.00–21.00 WIB." },
              { icon: ShoppingBag, title: "Harga Terbaik",   desc: "Harga kompetitif, promo rutin setiap hari." },
            ].map(f => (
              <div key={f.title} className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-violet-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900 mb-1">{f.title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-violet-600 rounded-2xl px-6 py-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Mulai belanja sekarang</h2>
          <p className="text-sm text-violet-100 mb-5">Daftar gratis dan nikmati kemudahan top-up produk digital favorit kamu.</p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-violet-700 text-sm font-semibold rounded-xl hover:bg-violet-50">
            Daftar Gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
