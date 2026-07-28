// ================================================================
//  FILE 2: src/app/admin/categories/page.tsx
//  Manajemen kategori — Supabase CRUD
// ================================================================
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit, Trash2, Loader2, CheckCircle, X, Tag } from "lucide-react";

interface Category {
  id: string; name: string; slug: string;
  description: string | null; icon_url: string | null;
  sort_order: number; is_active: boolean;
}

const toSlug = (s: string) => s.toLowerCase().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").trim();

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [cats, setCats]           = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Category | null>(null);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState("");

  const [form, setForm] = useState({ name: "", slug: "", description: "", icon_url: "", sort_order: "0", is_active: true });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchCats = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCats(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCats(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", icon_url: "", sort_order: "0", is_active: true });
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "", icon_url: cat.icon_url ?? "", sort_order: String(cat.sort_order), is_active: cat.is_active });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { name: form.name.trim(), slug: form.slug || toSlug(form.name), description: form.description || null, icon_url: form.icon_url || null, sort_order: parseInt(form.sort_order) || 0, is_active: form.is_active };

    if (editing) {
      await supabase.from("categories").update(payload).eq("id", editing.id);
      showToast("Kategori diperbarui!");
    } else {
      await supabase.from("categories").insert([payload]);
      showToast("Kategori ditambahkan!");
    }
    setSaving(false);
    setShowForm(false);
    fetchCats();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    await supabase.from("categories").delete().eq("id", id);
    showToast("Kategori dihapus!");
    fetchCats();
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />{toast}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{editing ? "Edit Kategori" : "Tambah Kategori"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama *</label>
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))}
                  placeholder="Nama kategori"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">URL Ikon (link gambar)</label>
                <input value={form.icon_url} onChange={(e) => setForm(f => ({ ...f, icon_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Urutan</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 accent-violet-600" />
                    <span className="text-sm text-gray-700">Aktif</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Batal</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kategori</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola kategori produk</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-violet-600" /></div>
        ) : cats.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Belum ada kategori</p>
            <button onClick={openAdd} className="mt-3 text-sm text-violet-600 hover:underline">+ Tambah kategori pertama</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Nama</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 hidden sm:table-cell">Slug</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Urutan</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {cats.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cat.icon_url && <img src={cat.icon_url} alt="" className="w-7 h-7 rounded-lg object-cover" />}
                      <span className="font-semibold text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{cat.sort_order}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${cat.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {cat.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}