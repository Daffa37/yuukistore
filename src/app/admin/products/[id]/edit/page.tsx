"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Save, Plus, Trash2, Eye, EyeOff,
  Image as ImageIcon, Link as LinkIcon, CheckCircle,
  AlertCircle, GripVertical, X, Loader2, ExternalLink,
  Tag, DollarSign, FileText, ChevronDown, ChevronUp,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FormField {
  id: string; name: string; label: string;
  type: "text" | "number" | "tel" | "email" | "select" | "textarea";
  placeholder: string; required: boolean; options: string;
}
interface Variant {
  id: string; label: string; price: string;
  original_price: string; stock: string; is_active: boolean;
}
interface ProductForm {
  name: string; slug: string; category_id: string;
  description: string; thumbnail_url: string;
  logo_url: string;
  base_price: string; is_active: boolean;
  stock: string; sort_order: string;
  form_fields: FormField[]; variants: Variant[];
}

const toSlug  = (s: string) => s.toLowerCase().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").trim();
const uid     = () => Math.random().toString(36).slice(2,8);

const convertGDriveUrl = (url: string) => {
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/uc?export=view&id=${m1[1]}`;
  return url;
};

function ImageLinkInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [raw, setRaw]         = useState(value);
  const [preview, setPreview] = useState(value ? convertGDriveUrl(value) : "");
  const [status, setStatus]   = useState<"idle"|"loading"|"ok"|"error">(value ? "loading" : "idle");
  const [showTips, setShowTips] = useState(false);

  const apply = () => {
    if (!raw.trim()) { setPreview(""); onChange(""); setStatus("idle"); return; }
    const c = convertGDriveUrl(raw.trim());
    setPreview(c); onChange(c); setStatus("loading");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700">Gambar Produk</label>
        <button type="button" onClick={() => setShowTips(v=>!v)}
          className="text-xs text-violet-600 hover:underline flex items-center gap-1">
          <Info className="w-3 h-3"/>{showTips ? "Tutup tips" : "Tips link"}
        </button>
      </div>
      {showTips && (
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-violet-700">Platform: Google Drive, Imgbb, Imgur, Cloudinary</p>
          <p>Pastikan gambar bisa diakses publik (tidak perlu login).</p>
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
          <input type="url" value={raw} onChange={e=>setRaw(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&apply()}
            placeholder="https://drive.google.com/... atau link gambar lainnya"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"/>
        </div>
        <button type="button" onClick={apply}
          className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 shrink-0">
          Terapkan
        </button>
      </div>
      <div className={`relative rounded-xl border-2 border-dashed overflow-hidden min-h-28 ${
        status==="ok" ? "border-green-300" : status==="error" ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
      }`}>
        {preview ? (
          <>
            <img src={preview} alt="" className="hidden"
              onLoad={()=>setStatus("ok")} onError={()=>setStatus("error")}/>
            {status==="loading" && <div className="h-28 flex items-center justify-center gap-2 text-gray-400"><Loader2 className="w-5 h-5 animate-spin"/><span className="text-xs">Memuat...</span></div>}
            {status==="ok" && (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full h-40 object-cover"/>
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                  <CheckCircle className="w-3 h-3"/> Valid
                </div>
                <button type="button" onClick={()=>{setRaw("");setPreview("");onChange("");setStatus("idle");}}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="w-3.5 h-3.5"/>
                </button>
              </div>
            )}
            {status==="error" && (
              <div className="h-28 flex flex-col items-center justify-center gap-1.5">
                <AlertCircle className="w-7 h-7 text-red-400"/>
                <p className="text-xs text-red-600 font-semibold">Gambar tidak bisa dimuat</p>
                <button type="button" onClick={()=>{setRaw("");setPreview("");setStatus("idle");onChange("");}}
                  className="text-xs text-red-500 underline">Hapus & coba lagi</button>
              </div>
            )}
          </>
        ) : (
          <div className="h-28 flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="w-7 h-7"/>
            <p className="text-xs">Masukkan link → klik Terapkan</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LogoLinkInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [raw, setRaw]         = useState(value);
  const [preview, setPreview] = useState(value ?? "");

  const apply = () => {
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
            onKeyDown={e=>e.key==="Enter"&&apply()}
            placeholder="https://upload.wikimedia.org/.../logo.png"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"/>
        </div>
        <button type="button" onClick={apply}
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

function VariantRow({ variant, onChange, onRemove }: {
  variant: Variant; onChange: (v: Variant) => void; onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl bg-white">
      <GripVertical className="w-4 h-4 text-gray-300 shrink-0"/>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <input value={variant.label} onChange={e=>onChange({...variant,label:e.target.value})}
          placeholder="Label" className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"/>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
          <input type="number" value={variant.price} onChange={e=>onChange({...variant,price:e.target.value})}
            placeholder="Harga" className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"/>
        </div>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
          <input type="number" value={variant.original_price} onChange={e=>onChange({...variant,original_price:e.target.value})}
            placeholder="Coret" className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"/>
        </div>
        <input type="number" value={variant.stock} onChange={e=>onChange({...variant,stock:e.target.value})}
          placeholder="Stok (∞=kosong)" className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"/>
      </div>
      <button type="button" onClick={()=>onChange({...variant,is_active:!variant.is_active})}
        className={`p-1.5 rounded-lg shrink-0 ${variant.is_active?"text-green-600 bg-green-50":"text-gray-400 bg-gray-100"}`}>
        {variant.is_active?<Eye className="w-3.5 h-3.5"/>:<EyeOff className="w-3.5 h-3.5"/>}
      </button>
      <button type="button" onClick={onRemove}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0">
        <Trash2 className="w-3.5 h-3.5"/>
      </button>
    </div>
  );
}

function FormFieldRow({ field, onChange, onRemove, index }: {
  field: FormField; onChange: (f: FormField) => void; onRemove: () => void; index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 cursor-pointer" onClick={()=>setExpanded(v=>!v)}>
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0"/>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-700">{field.label||`Field ${index+1}`}</span>
          <span className="ml-2 text-xs text-gray-400">({field.type})</span>
          {field.required&&<span className="ml-1 text-xs text-red-500">*wajib</span>}
        </div>
        <button type="button" onClick={e=>{e.stopPropagation();onRemove();}} className="p-1 text-gray-400 hover:text-red-500">
          <Trash2 className="w-3.5 h-3.5"/>
        </button>
        {expanded?<ChevronUp className="w-4 h-4 text-gray-400"/>:<ChevronDown className="w-4 h-4 text-gray-400"/>}
      </div>
      {expanded && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
            <input value={field.label} onChange={e=>onChange({...field,label:e.target.value})} placeholder="ID Pemain"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Key name</label>
            <input value={field.name} onChange={e=>onChange({...field,name:e.target.value})} placeholder="player_id"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipe</label>
            <select value={field.type} onChange={e=>onChange({...field,type:e.target.value as FormField["type"]})}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white">
              {["text","number","tel","email","select","textarea"].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
            <input value={field.placeholder} onChange={e=>onChange({...field,placeholder:e.target.value})}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"/>
          </div>
          {field.type==="select" && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Opsi (pisah koma)</label>
              <input value={field.options} onChange={e=>onChange({...field,options:e.target.value})} placeholder="Asia, Europe"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"/>
            </div>
          )}
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" id={`req-${field.id}`} checked={field.required}
              onChange={e=>onChange({...field,required:e.target.checked})} className="w-4 h-4 rounded accent-violet-600"/>
            <label htmlFor={`req-${field.id}`} className="text-xs text-gray-600">Wajib diisi pembeli</label>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditProductPage() {
  const router   = useRouter();
  const params   = useParams();
  const supabase = createClient();
  const productId = params.id as string;

  const [form, setForm]       = useState<ProductForm>({
    name:"", slug:"", category_id:"", description:"", thumbnail_url:"", logo_url:"",
    base_price:"", is_active:true, stock:"", sort_order:"0",
    form_fields:[], variants:[],
  });
  const [categories, setCategories] = useState<{ id:string; name:string }[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: cats } = await supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order");
      setCategories(cats ?? []);

      const { data: prod, error: err } = await supabase
        .from("products").select("*").eq("id", productId).single();

      if (err || !prod) { setError("Produk tidak ditemukan."); setLoading(false); return; }

      const variants: Variant[] = (prod.variants ?? []).map((v: Record<string,unknown>) => ({
        id:             String(v.id ?? uid()),
        label:          String(v.label ?? ""),
        price:          String(v.price ?? ""),
        original_price: String(v.original_price ?? ""),
        stock:          String(v.stock ?? ""),
        is_active:      Boolean(v.is_active ?? true),
      }));

      const form_fields: FormField[] = (prod.form_fields ?? []).map((f: Record<string,unknown>) => ({
        id:          String(f.id ?? uid()),
        name:        String(f.name ?? ""),
        label:       String(f.label ?? ""),
        type:        (f.type as FormField["type"]) ?? "text",
        placeholder: String(f.placeholder ?? ""),
        required:    Boolean(f.required ?? true),
        options:     Array.isArray(f.options) ? f.options.join(", ") : String(f.options ?? ""),
      }));

      setForm({
        name:          prod.name,
        slug:          prod.slug,
        category_id:   prod.category_id,
        description:   prod.description ?? "",
        thumbnail_url: prod.thumbnail_url ?? "",
        logo_url:      prod.logo_url ?? "",
        base_price:    String(prod.base_price),
        is_active:     prod.is_active,
        stock:         prod.stock != null ? String(prod.stock) : "",
        sort_order:    String(prod.sort_order ?? 0),
        form_fields,
        variants,
      });
      setLoading(false);
    };
    init();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim())  { setError("Nama produk wajib diisi."); return; }
    if (!form.category_id)  { setError("Kategori wajib dipilih."); return; }
    if (!form.base_price)   { setError("Harga dasar wajib diisi."); return; }

    setSaving(true);
    try {
      const payload = {
        name:          form.name.trim(),
        slug:          form.slug || toSlug(form.name),
        category_id:   form.category_id,
        description:   form.description || null,
        thumbnail_url: form.thumbnail_url || null,
        logo_url:      form.logo_url || null,
        base_price:    parseFloat(form.base_price),
        is_active:     form.is_active,
        stock:         form.stock ? parseInt(form.stock) : null,
        sort_order:    parseInt(form.sort_order) || 0,
        form_fields:   form.form_fields.map(({ id, options, ...rest }) => ({
          ...rest,
          options: rest.type === "select"
            ? options.split(",").map(s=>s.trim()).filter(Boolean) : undefined,
        })),
        variants: form.variants.map(v => ({
          id:             v.id,
          label:          v.label,
          price:          parseFloat(v.price) || 0,
          original_price: v.original_price ? parseFloat(v.original_price) : null,
          stock:          v.stock ? parseInt(v.stock) : null,
          is_active:      v.is_active,
        })),
      };

      const { error: dbError } = await supabase.from("products").update(payload).eq("id", productId);
      if (dbError) throw dbError;

      setSaved(true);
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-violet-600"/>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      <div className="flex items-center gap-3">
        <Link href="/admin/products"
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600">
          <ArrowLeft className="w-4 h-4"/>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Edit Produk</h1>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{form.name}</p>
        </div>
        <button type="button" onClick={()=>setForm(f=>({...f,is_active:!f.is_active}))}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
            form.is_active?"bg-green-50 border-green-200 text-green-700":"bg-gray-100 border-gray-200 text-gray-600"
          }`}>
          <span className={`w-2 h-2 rounded-full ${form.is_active?"bg-green-500":"bg-gray-400"}`}/>
          {form.is_active?"Aktif":"Nonaktif"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0"/>{error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0"/>Perubahan disimpan! Mengalihkan...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Tag className="w-4 h-4 text-violet-600"/>
            <h2 className="text-sm font-bold text-gray-800">Informasi Dasar</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Produk *</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value,slug:toSlug(e.target.value)}))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug</label>
              <input value={form.slug} onChange={e=>setForm(f=>({...f,slug:toSlug(e.target.value)}))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-gray-600"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kategori *</label>
              <select value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                <option value="">-- Pilih --</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi</label>
              <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                rows={3} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"/>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
            <ImageIcon className="w-4 h-4 text-violet-600"/>
            <h2 className="text-sm font-bold text-gray-800">Gambar Produk</h2>
          </div>
          <ImageLinkInput value={form.thumbnail_url}
            onChange={url=>setForm(f=>({...f,thumbnail_url:url}))}/>
          <LogoLinkInput value={form.logo_url}
            onChange={url=>setForm(f=>({...f,logo_url:url}))}/>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <DollarSign className="w-4 h-4 text-violet-600"/>
            <h2 className="text-sm font-bold text-gray-800">Harga & Stok</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Harga Dasar *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                <input type="number" value={form.base_price} onChange={e=>setForm(f=>({...f,base_price:e.target.value}))}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stok Global</label>
              <input type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))}
                placeholder="Kosong = ∞"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Urutan</label>
              <input type="number" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:e.target.value}))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"/>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700">Varian Harga</p>
              <button type="button" onClick={()=>setForm(f=>({...f,variants:[...f.variants,{id:uid(),label:"",price:"",original_price:"",stock:"",is_active:true}]}))}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg font-semibold">
                <Plus className="w-3.5 h-3.5"/> Tambah
              </button>
            </div>
            {form.variants.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">Belum ada varian.</div>
            ) : (
              <div className="space-y-2">
                {form.variants.map(v=>(
                  <VariantRow key={v.id} variant={v}
                    onChange={upd=>setForm(f=>({...f,variants:f.variants.map(x=>x.id===v.id?upd:x)}))}
                    onRemove={()=>setForm(f=>({...f,variants:f.variants.filter(x=>x.id!==v.id)}))}/>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <FileText className="w-4 h-4 text-violet-600"/>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-800">Form Pemesanan Dinamis</h2>
            </div>
            <button type="button" onClick={()=>setForm(f=>({...f,form_fields:[...f.form_fields,{id:uid(),name:"",label:"",type:"text",placeholder:"",required:true,options:""}]}))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg font-semibold">
              <Plus className="w-3.5 h-3.5"/> Field
            </button>
          </div>
          {form.form_fields.length===0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">Belum ada field.</div>
          ) : (
            <div className="space-y-2">
              {form.form_fields.map((ff,idx)=>(
                <FormFieldRow key={ff.id} field={ff} index={idx}
                  onChange={upd=>setForm(f=>({...f,form_fields:f.form_fields.map(x=>x.id===ff.id?upd:x)}))}
                  onRemove={()=>setForm(f=>({...f,form_fields:f.form_fields.filter(x=>x.id!==ff.id)}))}/>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Link href="/admin/products"
            className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
            Batal
          </Link>
          <button type="submit" disabled={saving||saved}
            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin"/>Menyimpan...</>
              : saved ? <><CheckCircle className="w-4 h-4"/>Tersimpan!</>
              : <><Save className="w-4 h-4"/>Simpan Perubahan</>}
          </button>
        </div>
      </form>
    </div>
  );
}
