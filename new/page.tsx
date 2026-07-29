"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Plus, Trash2, Eye, EyeOff,
  Image as ImageIcon, Link as LinkIcon, CheckCircle,
  AlertCircle, GripVertical, X, Loader2, ExternalLink,
  Tag, DollarSign, Package, FileText, ChevronDown,
  ChevronUp, Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────
interface FormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "tel" | "email" | "select" | "textarea";
  placeholder: string;
  required: boolean;
  options: string;
}

interface Variant {
  id: string;
  label: string;
  price: string;
  original_price: string;
  stock: string;
  is_active: boolean;
}

interface ProductForm {
  name: string;
  slug: string;
  category_id: string;
  description: string;
  thumbnail_url: string;
  logo_url: string; // <--- TAMBAHAN LOGO
  base_price: string;
  is_active: boolean;
  stock: string;
  sort_order: string;
  form_fields: FormField[];
  variants: Variant[];
}

// ── Helpers ────────────────────────────────────────────────────
const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

const uid = () => Math.random().toString(36).slice(2, 8);

const convertGDriveUrl = (url: string): string => {
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/uc?export=view&id=${m1[1]}`;
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
  return url;
};

// ── Komponen ImageLinkInput ────────────────────────────────────
function ImageLinkInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [raw, setRaw]         = useState(value);
  const [preview, setPreview] = useState(value ? convertGDriveUrl(value) : "");
  const [status, setStatus]   = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [showTips, setShowTips] = useState(false);

  const handleApply = () => {
    if (!raw.trim()) { setPreview(""); onChange(""); setStatus("idle"); return; }
    const converted = convertGDriveUrl(raw.trim());
    setPreview(converted);
    onChange(converted);
    setStatus("loading");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700">Gambar Produk</label>
        <button type="button" onClick={() => setShowTips(v => !v)}
          className="flex items-center gap-1 text-xs text-violet-600 hover:underline">
          <Info className="w-3 h-3" />
          {showTips ? "Tutup tips" : "Tips link gambar"}
        </button>
      </div>

      {showTips && (
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs space-y-1.5">
          <p className="font-semibold text-violet-700 mb-1">Platform yang didukung:</p>
          {[
            { n: "Google Drive", h: "Share → Siapa saja → Salin link" },
            { n: "Imgbb",        h: "Upload → Salin Direct Link" },
            { n: "Imgur",        h: "Upload → Salin Direct Link" },
            { n: "Cloudinary",   h: "Dashboard → Salin URL" },
          ].map(p => (
            <div key={p.n} className="flex gap-2">
              <span className="font-semibold text-gray-700 w-20 shrink-0">{p.n}</span>
              <span className="text-gray-500">{p.h}</span>
            </div>
          ))}
          <p className="text-violet-600 pt-1 border-t border-violet-100">
            💡 Pastikan gambar dapat diakses publik.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input type="url" value={raw} onChange={e => setRaw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleApply()}
            placeholder="https://drive.google.com/... atau link gambar lainnya"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <button type="button" onClick={handleApply}
          className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 shrink-0">
          Terapkan
        </button>
      </div>

      <div className={`relative rounded-xl border-2 border-dashed overflow-hidden min-h-32 ${
        status === "ok" ? "border-green-300" : status === "error" ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
      }`}>
        {preview ? (
          <>
            <img src={preview} alt="" className="hidden"
              onLoad={() => setStatus("ok")} onError={() => setStatus("error")} />
            {status === "loading" && (
              <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-xs">Memuat gambar...</p>
              </div>
            )}
            {status === "ok" && (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full h-44 object-cover" />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                  <CheckCircle className="w-3 h-3" /> Valid
                </div>
                <button type="button" onClick={() => { setRaw(""); setPreview(""); onChange(""); setStatus("idle"); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
                <a href={preview} target="_blank" rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                  <ExternalLink className="w-3 h-3" /> Buka
                </a>
              </div>
            )}
            {status === "error" && (
              <div className="h-32 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm font-semibold text-red-600">Gambar tidak dapat dimuat</p>
                <p className="text-xs text-red-500 text-center px-4">Pastikan link bersifat publik dan berformat gambar</p>
                <button type="button" onClick={() => { setRaw(""); setPreview(""); setStatus("idle"); onChange(""); }}
                  className="text-xs text-red-600 hover:underline">Hapus & coba lagi</button>
              </div>
            )}
          </>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="w-8 h-8" />
            <p className="text-xs text-center">Masukkan link gambar lalu klik <strong>Terapkan</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Komponen LogoLinkInput (TAMBAHAN UNTUK LOGO) ──────────────
function LogoLinkInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [raw, setRaw]         = useState(value);
  const [preview, setPreview] = useState(value ?? "");

  const handleApply = () => {
    if (!raw.trim()) { setPreview(""); onChange(""); return; }
    const c = raw.trim();
    setPreview(c); onChange(c);
  };

  return (
    <div className="space-y-3 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700">Logo Produk (Icon Pojok Kanan)</label>
        <span className="text-[10px] text-gray-400">Opsional</span>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
          <input type="url" value={raw} onChange={e=>setRaw(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleApply()}
            placeholder="https://upload.wikimedia.org/.../logo.png"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"/>
        </div>
        <button type="button" onClick={handleApply}
          className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 shrink-0">
          Terapkan
        </button>
      </div>
      {preview && (
        <div className="relative inline-block">
          <img src={preview} alt="Logo Preview" className="w-20 h-20 object-contain border border-gray-200 rounded-xl p-2 bg-white" />
          <button type="button" onClick={()=>{setRaw("");setPreview("");onChange("");}}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-white">
            <X className="w-3 h-3"/>
          </button>
        </div>
      )}
      <p className="text-[10px] text-gray-400">Masukkan link gambar logo game (contoh: dari Wikipedia)</p>
    </div>
  );
}

// ── Komponen FormFieldRow ──────────────────────────────────────
function FormFieldRow({ field, onChange, onRemove, index }: {
  field: FormField; onChange: (f: FormField) => void; onRemove: () => void; index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(v => !v)}>
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-700">{field.label || `Field ${index + 1}`}</span>
          <span className="ml-2 text-xs text-gray-400">({field.type})</span>
          {field.required && <span className="ml-1 text-xs text-red-500">*wajib</span>}
        </div>
        <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
          className="p-1 text-gray-400 hover:text-red-500">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>

      {expanded && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label tampilan</label>
            <input value={field.label} onChange={e => onChange({ ...field, label: e.target.value })}
              placeholder="Contoh: ID Pemain"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Key name</label>
            <input value={field.name} onChange={e => onChange({ ...field, name: e.target.value })}
              placeholder="player_id"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipe input</label>
            <select value={field.type} onChange={e => onChange({ ...field, type: e.target.value as FormField["type"] })}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="tel">Nomor HP</option>
              <option value="email">Email</option>
              <option value="select">Pilihan (select)</option>
              <option value="textarea">Textarea</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
            <input value={field.placeholder} onChange={e => onChange({ ...field, placeholder: e.target.value })}
              placeholder="Contoh: Masukkan ID Pemain"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          {field.type === "select" && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Opsi <span className="text-gray-400">(pisah koma)</span></label>
              <input value={field.options} onChange={e => onChange({ ...field, options: e.target.value })}
                placeholder="Asia, Europe, America"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
          )}
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" id={`req-${field.id}`} checked={field.required}
              onChange={e => onChange({ ...field, required: e.target.checked })}
              className="w-4 h-4 rounded accent-violet-600" />
            <label htmlFor={`req-${field.id}`} className="text-xs text-gray-600">Field ini wajib diisi pembeli</label>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Komponen VariantRow ────────────────────────────────────────
function VariantRow({ variant, onChange, onRemove }: {
  variant: Variant; onChange: (v: Variant) => void; onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl bg-white">
      <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <input value={variant.label} onChange={e => onChange({ ...variant, label: e.target.value })}
          placeholder="Label" className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500" />
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
          <input type="number" value={variant.price} onChange={e => onChange({ ...variant, price: e.target.value })}
            placeholder="Harga jual"
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500" />
        </div>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
          <input type="number" value={variant.original_price} onChange={e => onChange({ ...variant, original_price: e.target.value })}
            placeholder="Coret (opt)"
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500" />
        </div>
        <input type="number" value={variant.stock} onChange={e => onChange({ ...variant, stock: e.target.value })}
          placeholder="Stok (∞=kosong)" className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500" />
      </div>
      <button type="button" onClick={() => onChange({ ...variant, is_active: !variant.is_active })}
        className={`p-1.5 rounded-lg shrink-0 ${variant.is_active ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100"}`}>
        {variant.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>
      <button type="button" onClick={onRemove}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Halaman Tambah Produk ──────────────────────────────────────
const INITIAL_FORM: ProductForm = {
  name: "", slug: "", category_id: "", description: "",
  thumbnail_url: "", logo_url: "", // <--- TAMBAHAN LOGO
  base_price: "", is_active: true,
  stock: "", sort_order: "0", form_fields: [], variants: [],
};

export default function AddProductPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [form, setForm]     = useState<ProductForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [saved, setSaved]   = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Ambil kategori dari Supabase
  useState(() => {
    supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  });

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: toSlug(name) }));
  };

  // Varian
  const addVariant = () => setForm(f => ({
    ...f,
    variants: [...f.variants, { id: uid(), label: "", price: "", original_price: "", stock: "", is_active: true }],
  }));
  const updateVariant = (id: string, updated: Variant) =>
    setForm(f => ({ ...f, variants: f.variants.map(v => v.id === id ? updated : v) }));
  const removeVariant = (id: string) =>
    setForm(f => ({ ...f, variants: f.variants.filter(v => v.id !== id) }));

  // Form fields
  const addField = () => setForm(f => ({
    ...f,
    form_fields: [...f.form_fields, { id: uid(), name: "", label: "", type: "text", placeholder: "", required: true, options: "" }],
  }));
  const updateField = (id: string, updated: FormField) =>
    setForm(f => ({ ...f, form_fields: f.form_fields.map(ff => ff.id === id ? updated : ff) }));
  const removeField = (id: string) =>
    setForm(f => ({ ...f, form_fields: f.form_fields.filter(ff => ff.id !== id) }));

  const addTemplate = (tpl: Omit<FormField, "id">) =>
    setForm(f => ({ ...f, form_fields: [...f.form_fields, { id: uid(), ...tpl }] }));

  // Submit ke Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim())    { setError("Nama produk wajib diisi."); return; }
    if (!form.category_id)    { setError("Kategori wajib dipilih."); return; }
    if (!form.base_price)     { setError("Harga dasar wajib diisi."); return; }

    setLoading(true);
    try {
      const payload = {
        name:          form.name.trim(),
        slug:          form.slug || toSlug(form.name),
        category_id:   form.category_id,
        description:   form.description || null,
        thumbnail_url: form.thumbnail_url || null,
        logo_url:      form.logo_url || null, // <--- TAMBAHAN LOGO
        base_price:    parseFloat(form.base_price),
        is_active:     form.is_active,
        stock:         form.stock ? parseInt(form.stock) : null,
        sort_order:    parseInt(form.sort_order) || 0,
        form_fields:   form.form_fields.map(({ id, options, ...rest }) => ({
          ...rest,
          options: rest.type === "select"
            ? options.split(",").map(s => s.trim()).filter(Boolean)
            : undefined,
        })),
        variants: form.variants.map(({ id, ...rest }) => ({
          id: uid(),
          label:          rest.label,
          price:          parseFloat(rest.price) || 0,
          original_price: rest.original_price ? parseFloat(rest.original_price) : null,
          stock:          rest.stock ? parseInt(rest.stock) : null,
          is_active:      rest.is_active,
        })),
      };

      const { error: dbError } = await supabase.from("products").insert([payload]);
      if (dbError) throw dbError;

      setSaved(true);
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products"
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Tambah Produk Baru</h1>
          <p className="text-xs text-gray-500 mt-0.5">Isi semua informasi produk</p>
        </div>
        <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
            form.is_active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-100 border-gray-200 text-gray-600"
          }`}>
          <span className={`w-2 h-2 rounded-full ${form.is_active ? "bg-green-500" : "bg-gray-400"}`} />
          {form.is_active ? "Aktif" : "Nonaktif"}
        </button>
      </div>

      {/* Alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />Produk berhasil disimpan! Mengalihkan...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info dasar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Tag className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-gray-800">Informasi Dasar</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Produk *</label>
              <input value={form.name} onChange={e => handleNameChange(e.target.value)}
                placeholder="Contoh: Mobile Legends Diamond"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug URL</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-gray-600" />
              <p className="text-xs text-gray-400 mt-1">Auto dari nama.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kategori *</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                <option value="">-- Pilih kategori --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Jelaskan produk ini..." rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
            </div>
          </div>
        </div>

        {/* Gambar & Logo */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
            <ImageIcon className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-gray-800">Gambar Produk</h2>
          </div>
          <ImageLinkInput value={form.thumbnail_url}
            onChange={url => setForm(f => ({ ...f, thumbnail_url: url }))} />
          
          {/* --- TAMBAHAN INPUT LOGO DI SINI --- */}
          <LogoLinkInput value={form.logo_url}
            onChange={url => setForm(f => ({ ...f, logo_url: url }))} />
        </div>

        {/* Harga & stok */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <DollarSign className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-gray-800">Harga & Stok</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Harga Dasar (Rp) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                <input type="number" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stok Global</label>
              <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                placeholder="Kosong = ∞"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Urutan Tampil</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>

          {/* Varian */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-gray-700">Varian / Pilihan Harga</p>
                <p className="text-xs text-gray-400">Contoh: 86 Diamond, 172 Diamond</p>
              </div>
              <button type="button" onClick={addVariant}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg font-semibold">
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>
            {form.variants.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
                Klik <strong>Tambah</strong> untuk menambahkan pilihan harga/varian.
              </div>
            ) : (
              <div className="space-y-2">
                {form.variants.map(v => (
                  <VariantRow key={v.id} variant={v}
                    onChange={updated => updateVariant(v.id, updated)}
                    onRemove={() => removeVariant(v.id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form dinamis */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <FileText className="w-4 h-4 text-violet-600" />
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-800">Form Pemesanan Dinamis</h2>
              <p className="text-xs text-gray-400">Data yang harus diisi pembeli saat memesan</p>
            </div>
            <button type="button" onClick={addField}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg font-semibold">
              <Plus className="w-3.5 h-3.5" /> Tambah Field
            </button>
          </div>

          {/* Template cepat */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Template cepat:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "+ ID Pemain", f: { name: "player_id", label: "ID Pemain",  type: "text"   as const, placeholder: "Masukkan ID Pemain",   required: true,  options: "" } },
                { label: "+ Server",   f: { name: "server_id",  label: "Server",     type: "select" as const, placeholder: "",                      required: true,  options: "Asia, Europe, America" } },
                { label: "+ No. HP",   f: { name: "phone",      label: "Nomor HP",   type: "tel"    as const, placeholder: "08xxxxxxxxxx",           required: true,  options: "" } },
                { label: "+ Email",    f: { name: "email",      label: "Email",      type: "email"  as const, placeholder: "email@kamu.com",         required: true,  options: "" } },
                { label: "+ Catatan",  f: { name: "notes",      label: "Catatan",    type: "textarea" as const, placeholder: "Catatan tambahan",    required: false, options: "" } },
              ].map(tpl => (
                <button key={tpl.label} type="button" onClick={() => addTemplate(tpl.f)}
                  className="px-2.5 py-1 text-xs border border-violet-200 text-violet-700 rounded-lg hover:bg-violet-50">
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {form.form_fields.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
              Gunakan template atau klik <strong>Tambah Field</strong>.
            </div>
          ) : (
            <div className="space-y-2">
              {form.form_fields.map((ff, idx) => (
                <FormFieldRow key={ff.id} field={ff} index={idx}
                  onChange={updated => updateField(ff.id, updated)}
                  onRemove={() => removeField(ff.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Tombol simpan */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Link href="/admin/products"
            className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
            Batal
          </Link>
          <button type="submit" disabled={loading || saved}
            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</>
              : saved  ? <><CheckCircle className="w-4 h-4" />Tersimpan!</>
              : <><Save className="w-4 h-4" />Simpan Produk</>}
          </button>
        </div>
      </form>
    </div>
  );
}