"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package, Search, Plus, Edit, Trash2,
  RefreshCw, Eye, Download, CheckCircle,
  Loader2, ImageIcon, Filter,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  thumbnail_url: string | null;
  is_active: boolean;
  stock: number | null;
  sort_order: number;
  created_at: string;
  categories?: { name: string };
  variants?: unknown[];
}

const fmtRp   = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(s));

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
      type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }`}>
      <CheckCircle className="w-4 h-4 shrink-0" />
      {msg}
    </div>
  );
}

export default function AdminProductsPage() {
  const supabase = createClient();

  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select("*, categories(name)")
      .order("sort_order", { ascending: true });

    if (filterStatus === "active")   query = query.eq("is_active", true);
    if (filterStatus === "inactive") query = query.eq("is_active", false);
    if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);

    const { data, error } = await query;
    if (!error) setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { showToast("Gagal menghapus produk.", "error"); return; }
    showToast("Produk berhasil dihapus!");
    fetchProducts();
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: !current }).eq("id", id);
    if (error) { showToast("Gagal mengubah status.", "error"); return; }
    showToast(`Produk ${!current ? "diaktifkan" : "dinonaktifkan"}!`);
    fetchProducts();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.size} produk yang dipilih?`)) return;
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) { showToast("Gagal menghapus.", "error"); return; }
    showToast(`${ids.length} produk dihapus!`);
    setSelectedIds(new Set());
    fetchProducts();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = products.length > 0 && products.every(p => selectedIds.has(p.id));
  const toggleAll   = () => {
    setSelectedIds(allSelected ? new Set() : new Set(products.map(p => p.id)));
  };

  const stats = {
    total:    products.length,
    active:   products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    limited:  products.filter(p => p.stock !== null && p.stock < 20).length,
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Produk</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola semua produk digital YuukiStore</p>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shrink-0">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Produk",  value: stats.total,    color: "text-gray-900"    },
          { label: "Aktif",         value: stats.active,   color: "text-green-600"   },
          { label: "Nonaktif",      value: stats.inactive, color: "text-red-500"     },
          { label: "Stok Terbatas", value: stats.limited,  color: "text-amber-600"   },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 p-3 border-b border-gray-50">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50" />
          </form>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <button onClick={fetchProducts}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-lg ml-auto">
              <span className="text-xs text-violet-700 font-medium">{selectedIds.size} dipilih</span>
              <button onClick={handleBulkDelete} className="text-xs text-red-600 font-semibold hover:underline">Hapus</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Belum ada produk</p>
            <Link href="/admin/products/new"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl">
              <Plus className="w-4 h-4" /> Tambah Produk Pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      className="rounded border-gray-300 accent-violet-600" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Produk</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 hidden sm:table-cell">Kategori</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Harga</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 hidden md:table-cell">Stok</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 hidden lg:table-cell">Dibuat</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(p.id) ? "bg-violet-50/50" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)}
                        className="rounded border-gray-300 accent-violet-600" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {p.thumbnail_url
                            ? <img src={p.thumbnail_url} alt={p.name} className="w-full h-full object-cover" />
                            : <ImageIcon className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400 font-mono">#{p.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {p.categories?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {fmtRp(p.base_price)}
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      {p.stock === null
                        ? <span className="text-xs text-gray-400">∞</span>
                        : <span className={`text-sm font-semibold ${p.stock < 20 ? "text-red-600" : "text-gray-700"}`}>{p.stock}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleActive(p.id, p.is_active)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                          p.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}>
                        {p.is_active ? "● Aktif" : "○ Nonaktif"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                      {fmtDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/products/${p.slug}`} target="_blank" title="Lihat di toko"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/admin/products/${p.id}/edit`} title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.name)} title="Hapus"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {products.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 text-xs text-gray-500">
            <span>{products.length} produk ditampilkan</span>
          </div>
        )}
      </div>
    </div>
  );
}
