"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, ShoppingBag, Loader2, LogIn,
  CheckCircle, Clock, AlertCircle, XCircle,
  Package, ChevronDown, ChevronUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface OrderItem {
  product_name: string;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  form_data: Record<string, string>;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string | null;
  created_at: string;
  buyer_name: string;
  buyer_phone: string | null;
  admin_notes: string | null;
  order_items: OrderItem[];
}

const fmtRp   = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(s));

const STATUS_CONFIG: Record<string, { label: string; style: string; icon: React.ElementType }> = {
  pending:    { label: "Menunggu Bayar", style: "bg-amber-100 text-amber-700",  icon: Clock        },
  paid:       { label: "Sudah Dibayar",  style: "bg-blue-100 text-blue-700",    icon: CheckCircle  },
  processing: { label: "Sedang Diproses",style: "bg-violet-100 text-violet-700",icon: Package      },
  completed:  { label: "Selesai",        style: "bg-green-100 text-green-700",  icon: CheckCircle  },
  cancelled:  { label: "Dibatalkan",     style: "bg-red-100 text-red-700",      icon: XCircle      },
  refunded:   { label: "Dikembalikan",   style: "bg-gray-100 text-gray-600",    icon: AlertCircle  },
};

// ── Komponen kartu pesanan ─────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, style: "bg-gray-100 text-gray-600", icon: AlertCircle };
  const Icon = cfg.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
            {order.order_items?.[0]?.product_name ?? "—"}
            {order.order_items?.[0]?.variant_label ? ` — ${order.order_items[0].variant_label}` : ""}
          </p>
          {order.order_items?.length > 1 && (
            <p className="text-xs text-gray-400">+{order.order_items.length - 1} item lainnya</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{fmtDate(order.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${cfg.style}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>
          <p className="text-sm font-bold text-violet-700">{fmtRp(order.total_amount)}</p>
        </div>
      </div>

      {/* Catatan admin jika ada */}
      {order.admin_notes && (
        <div className="mx-4 mb-3 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
          <span className="font-semibold">Catatan admin: </span>{order.admin_notes}
        </div>
      )}

      {/* Tombol expand detail */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-gray-50 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
      >
        {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Sembunyikan detail</> : <><ChevronDown className="w-3.5 h-3.5" />Lihat detail</>}
      </button>

      {/* Detail */}
      {expanded && (
        <div className="border-t border-gray-50 p-4 space-y-3 bg-gray-50/50">
          {order.order_items?.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-gray-900">{item.product_name}</span>
                <span className="font-bold text-violet-700">{fmtRp(item.unit_price * item.quantity)}</span>
              </div>
              {item.variant_label && (
                <p className="text-xs text-gray-500 mb-1.5">Varian: {item.variant_label}</p>
              )}
              {/* Data form (ID pemain, server, dsb) */}
              {Object.keys(item.form_data ?? {}).length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-50 space-y-1">
                  {Object.entries(item.form_data).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-gray-500 capitalize">{k.replace(/_/g, " ")}</span>
                      <span className="font-semibold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-between text-sm pt-1">
            <span className="text-gray-500">Metode bayar</span>
            <span className="font-semibold text-gray-900 capitalize">{order.payment_method ?? "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-bold text-violet-700">{fmtRp(order.total_amount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Halaman Pesanan Saya ───────────────────────────────────────
export default function OrdersPage() {
  const supabase  = createClient();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [searchMode, setSearchMode]   = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setLoggedIn(true);

        // Ambil phone dari profil
        const { data: profile } = await supabase
          .from("users").select("phone").eq("id", user.id).single();
        if (profile?.phone) setUserPhone(profile.phone);

        // Ambil pesanan berdasarkan user_id ATAU email/phone
        const { data: ordersByUser } = await supabase
          .from("orders")
          .select("*, order_items(product_name, variant_label, unit_price, quantity, form_data)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        // Ambil juga pesanan guest berdasarkan email
        const { data: ordersByEmail } = await supabase
          .from("orders")
          .select("*, order_items(product_name, variant_label, unit_price, quantity, form_data)")
          .eq("buyer_email", user.email ?? "")
          .is("user_id", null)
          .order("created_at", { ascending: false });

        // Ambil pesanan berdasarkan phone jika ada
        let ordersByPhone: Order[] = [];
        if (profile?.phone) {
          const { data } = await supabase
            .from("orders")
            .select("*, order_items(product_name, variant_label, unit_price, quantity, form_data)")
            .eq("buyer_phone", profile.phone)
            .is("user_id", null)
            .order("created_at", { ascending: false });
          ordersByPhone = (data ?? []) as Order[];
        }

        // Gabung & hapus duplikat berdasarkan id
        const all = [
          ...(ordersByUser ?? []),
          ...(ordersByEmail ?? []),
          ...ordersByPhone,
        ] as Order[];
        const unique = Array.from(new Map(all.map(o => [o.id, o])).values());
        unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setOrders(unique);
      }

      setLoading(false);
    };
    init();
  }, []);

  // Cari pesanan berdasarkan nomor HP (untuk yang belum login)
  const handleSearchByPhone = async () => {
    if (!filterPhone.trim()) return;
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(product_name, variant_label, unit_price, quantity, form_data)")
      .eq("buyer_phone", filterPhone.trim())
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as Order[]);
    setSearchMode(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-bold">Pesanan Saya</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">

        {/* Jika belum login — tampilkan opsi cari by phone */}
        {!loggedIn && !loading && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <LogIn className="w-4 h-4 text-violet-600" />
                <p className="text-sm font-bold text-gray-900">Lacak pesanan kamu</p>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Login untuk melihat semua riwayat pesanan, atau cari menggunakan nomor HP yang dipakai saat checkout.
              </p>
              <Link href="/auth/login"
                className="block w-full py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl text-center hover:bg-violet-700 mb-2">
                Login untuk Lihat Pesanan
              </Link>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-gray-400">atau cari tanpa login</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="tel"
                  value={filterPhone}
                  onChange={e => setFilterPhone(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearchByPhone()}
                  placeholder="Nomor HP yang dipakai saat checkout"
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={handleSearchByPhone}
                  className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 flex-shrink-0">
                  Cari
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        )}

        {/* Daftar pesanan */}
        {!loading && orders.length > 0 && (
          <>
            {searchMode && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{orders.length} pesanan ditemukan untuk {filterPhone}</p>
                <button onClick={() => { setOrders([]); setSearchMode(false); setFilterPhone(""); }}
                  className="text-xs text-violet-600 hover:underline">Reset</button>
              </div>
            )}
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </>
        )}

        {/* Kosong */}
        {!loading && orders.length === 0 && (loggedIn || searchMode) && (
          <div className="text-center py-20">
            <ShoppingBag className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="font-semibold text-gray-700">
              {searchMode ? `Tidak ada pesanan untuk ${filterPhone}` : "Belum ada pesanan"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {searchMode
                ? "Pastikan nomor HP sesuai dengan yang diisi saat checkout"
                : "Yuk mulai belanja produk digital!"}
            </p>
            <Link href="/"
              className="inline-block mt-4 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl">
              Belanja Sekarang
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
