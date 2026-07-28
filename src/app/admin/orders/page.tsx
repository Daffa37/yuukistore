// ================================================================
//  FILE 2: src/app/admin/orders/page.tsx
//  Manajemen pesanan dari Supabase
// ================================================================
"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart, Search, RefreshCw, Eye,
  CheckCircle, Loader2, AlertCircle, X,
  Clock, XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Order {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  status: string;
  payment_method: string | null;
  total_amount: number;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  order_items?: { product_name: string; variant_label: string | null; unit_price: number; quantity: number; form_data: Record<string, string> }[];
}

const fmtRp   = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(s));

const STATUS_OPTIONS = ["pending","paid","processing","completed","cancelled","refunded"];
const STATUS_STYLE: Record<string,string> = {
  completed: "bg-green-100 text-green-700", processing: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",   paid: "bg-violet-100 text-violet-700",
  cancelled: "bg-red-100 text-red-700",     refunded: "bg-gray-100 text-gray-600",
};
const STATUS_LABEL: Record<string,string> = {
  completed: "Selesai", processing: "Diproses", pending: "Menunggu",
  paid: "Dibayar", cancelled: "Dibatalkan", refunded: "Dikembalikan",
};

function OrderDetailModal({ order, onClose, onUpdate }: {
  order: Order; onClose: () => void; onUpdate: () => void;
}) {
  const supabase = createClient();
  const [status, setStatus]         = useState(order.status);
  const [adminNotes, setAdminNotes] = useState(order.admin_notes ?? "");
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("orders").update({ status, admin_notes: adminNotes }).eq("id", order.id);
    setSaving(false);
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4">
      <div className="w-full sm:max-w-lg bg-white rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Detail Pesanan</h3>
            <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0,8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        {/* Info pembeli */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5 text-sm">
          <p className="font-semibold text-gray-900">{order.buyer_name}</p>
          <p className="text-gray-500">{order.buyer_email}</p>
          {order.buyer_phone && <p className="text-gray-500">{order.buyer_phone}</p>}
          <p className="text-xs text-gray-400">{fmtDate(order.created_at)}</p>
        </div>

        {/* Item pesanan */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Item Pesanan:</p>
            <div className="space-y-2">
              {order.order_items.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-900">{item.product_name}</span>
                    <span className="font-bold text-violet-700">{fmtRp(item.unit_price * item.quantity)}</span>
                  </div>
                  {item.variant_label && <p className="text-xs text-gray-500 mt-0.5">{item.variant_label}</p>}
                  {Object.keys(item.form_data ?? {}).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-50 space-y-0.5">
                      {Object.entries(item.form_data).map(([k, v]) => (
                        <p key={k} className="text-xs text-gray-500">
                          <span className="font-medium">{k}:</span> {v}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center py-2 border-t border-gray-100 mb-4">
          <span className="text-sm font-semibold text-gray-700">Total</span>
          <span className="text-base font-bold text-violet-700">{fmtRp(order.total_amount)}</span>
        </div>

        {/* Update status */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Update Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catatan Admin</label>
            <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
              placeholder="Catatan internal untuk pesanan ini..."
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected]     = useState<Order | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*, order_items(product_name, variant_label, unit_price, quantity, form_data)")
      .order("created_at", { ascending: false });
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    if (search.trim())
      query = query.or(`buyer_name.ilike.%${search}%,buyer_email.ilike.%${search}%`);
    const { data } = await query;
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  return (
    <div className="space-y-5 max-w-6xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          <CheckCircle className="w-4 h-4" />{toast.msg}
        </div>
      )}
      {selected && (
        <OrderDetailModal order={selected} onClose={() => setSelected(null)}
          onUpdate={() => { fetchOrders(); showToast("Pesanan diperbarui!"); }} />
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Pesanan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola semua transaksi YuukiStore</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-2 p-3 border-b border-gray-50">
          <form onSubmit={e => { e.preventDefault(); fetchOrders(); }} className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, email pembeli..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50" />
          </form>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none">
              <option value="all">Semua Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <button onClick={fetchOrders} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(o => (
              <div key={o.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{o.buyer_name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{o.order_items?.[0]?.product_name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{fmtDate(o.created_at)} · {o.payment_method ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-bold text-violet-700">{fmtRp(o.total_amount)}</p>
                  <button onClick={() => setSelected(o)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-500">
          {orders.length} pesanan ditampilkan
        </div>
      </div>
    </div>
  );
}