"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart, Package, Users, TrendingUp,
  Loader2, ArrowRight, Clock, CheckCircle,
  AlertCircle, XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const fmtRp   = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(s));

const STATUS_STYLE: Record<string, string> = {
  completed:  "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  pending:    "bg-amber-100 text-amber-700",
  paid:       "bg-violet-100 text-violet-700",
  cancelled:  "bg-red-100 text-red-700",
  refunded:   "bg-gray-100 text-gray-600",
};
const STATUS_LABEL: Record<string, string> = {
  completed:  "Selesai",
  processing: "Diproses",
  pending:    "Menunggu",
  paid:       "Dibayar",
  cancelled:  "Dibatalkan",
  refunded:   "Dikembalikan",
};
const STATUS_ICON: Record<string, React.ElementType> = {
  completed:  CheckCircle,
  processing: Clock,
  pending:    AlertCircle,
  paid:       CheckCircle,
  cancelled:  XCircle,
};

interface RecentOrder {
  id: string;
  buyer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: { product_name: string }[];
}

export default function AdminDashboardPage() {
  const supabase = createClient();

  const [stats, setStats] = useState({
    orders: 0, products: 0, users: 0, revenue: 0,
    pending: 0, completed: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [
          { count: ordersCount },
          { count: productsCount },
          { count: usersCount },
          { count: pendingCount },
          { count: completedCount },
          { data: revenueData },
          { data: recent },
        ] = await Promise.all([
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
          supabase.from("orders").select("total_amount").eq("status", "completed"),
          supabase.from("orders")
            .select("id, buyer_name, total_amount, status, created_at, order_items(product_name)")
            .order("created_at", { ascending: false })
            .limit(6),
        ]);

        const revenue = (revenueData ?? []).reduce(
          (s: number, o: { total_amount: number }) => s + (o.total_amount ?? 0), 0
        );

        setStats({
          orders:    ordersCount    ?? 0,
          products:  productsCount  ?? 0,
          users:     usersCount     ?? 0,
          revenue,
          pending:   pendingCount   ?? 0,
          completed: completedCount ?? 0,
        });
        setRecentOrders(recent ?? []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Selamat datang di panel admin YuukiStore</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Pesanan",
            value: stats.orders.toLocaleString("id-ID"),
            icon: ShoppingCart,
            color: "text-violet-600",
            bg:    "bg-violet-50",
            sub:   `${stats.pending} menunggu`,
          },
          {
            label: "Total Produk",
            value: stats.products.toLocaleString("id-ID"),
            icon: Package,
            color: "text-blue-600",
            bg:    "bg-blue-50",
            sub:   "produk aktif",
          },
          {
            label: "Total Pengguna",
            value: stats.users.toLocaleString("id-ID"),
            icon: Users,
            color: "text-green-600",
            bg:    "bg-green-50",
            sub:   "terdaftar",
          },
          {
            label: "Pendapatan",
            value: fmtRp(stats.revenue),
            icon: TrendingUp,
            color: "text-amber-600",
            bg:    "bg-amber-50",
            sub:   `${stats.completed} selesai`,
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{s.value}</p>
            <p className="text-xs font-medium text-gray-600">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tambah Produk",   href: "/admin/products/new",  emoji: "📦" },
          { label: "Tambah Kategori", href: "/admin/categories",    emoji: "🏷️" },
          { label: "Lihat Pesanan",   href: "/admin/orders",        emoji: "🛒" },
          { label: "Kelola User",     href: "/admin/users",         emoji: "👥" },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="flex items-center gap-2.5 p-3 bg-white border border-gray-100 rounded-xl hover:border-violet-200 hover:shadow-sm transition-all text-sm font-medium text-gray-700">
            <span className="text-lg">{a.emoji}</span>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Pesanan terbaru */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Pesanan Terbaru</h2>
          <Link href="/admin/orders"
            className="flex items-center gap-1 text-xs text-violet-600 hover:underline">
            Lihat semua <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Belum ada pesanan</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Pesanan</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Pembeli</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Produk</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((o) => {
                    const StatusIcon = STATUS_ICON[o.status] ?? AlertCircle;
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-xs text-gray-400 font-mono">#{o.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(o.created_at)}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{o.buyer_name}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-gray-600 truncate max-w-40">
                            {o.order_items?.[0]?.product_name ?? "—"}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_STYLE[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                            <StatusIcon className="w-3 h-3" />
                            {STATUS_LABEL[o.status] ?? o.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-violet-700">
                          {fmtRp(o.total_amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y divide-gray-50">
              {recentOrders.map((o) => (
                <div key={o.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{o.buyer_name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {o.order_items?.[0]?.product_name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5">{fmtDate(o.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    <span className="text-sm font-bold text-violet-700">{fmtRp(o.total_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
