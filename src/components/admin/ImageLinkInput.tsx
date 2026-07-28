// ================================================================
//  YuukiStore — Admin Panel: Form Produk + Upload Gambar via Link
//
//  FILE 1: src/app/admin/products/new/page.tsx    ← Tambah produk
//  FILE 2: src/app/admin/products/[id]/edit/page.tsx ← Edit produk
//  FILE 3: src/components/admin/ImageLinkInput.tsx  ← Komponen gambar
// ================================================================

"use client";

import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    ChevronDown, ChevronUp,
    DollarSign,
    ExternalLink,
    Eye, EyeOff,
    FileText,
    GripVertical,
    Image as ImageIcon,
    Info,
    Link as LinkIcon,
    Loader2,
    Plus,
    Save,
    Tag,
    Trash2,
    X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

// ────────────────────────────────────────────────────────────────
// FILE 3: src/components/admin/ImageLinkInput.tsx
// Input gambar via URL (Google Drive, Imgbb, Imgur, dsb.)
// ────────────────────────────────────────────────────────────────

// Konversi link Google Drive share → link gambar langsung
function convertGDriveUrl(url: string): string {
  // Format: https://drive.google.com/file/d/FILE_ID/view?...
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  // Format: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) {
    return `https://drive.google.com/uc?export=view&id=${match2[1]}`;
  }
  return url;
}

// Daftar provider yang didukung
const PROVIDERS = [
  { name: "Google Drive", hint: "Share → Siapa saja yang punya link → Salin link", icon: "🔗" },
  { name: "Imgbb",        hint: "Upload → Salin Direct Link (.jpg/.png)", icon: "🖼️" },
  { name: "Imgur",        hint: "Upload → Salin Direct Link", icon: "📷" },
  { name: "Cloudinary",   hint: "Dashboard → Media Library → Salin URL", icon: "☁️" },
  { name: "GitHub",       hint: "Upload ke repo → Salin raw URL", icon: "🐙" },
];

interface ImageLinkInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageLinkInput({
  value,
  onChange,
  label = "Gambar Produk",
}: ImageLinkInputProps) {
  const [raw, setRaw]         = useState(value);
  const [preview, setPreview] = useState(value ? convertGDriveUrl(value) : "");
  const [status, setStatus]   = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [showTips, setShowTips] = useState(false);

  const handleApply = useCallback(() => {
    if (!raw.trim()) {
      setPreview("");
      onChange("");
      setStatus("idle");
      return;
    }
    const converted = convertGDriveUrl(raw.trim());
    setPreview(converted);
    onChange(converted);
    setStatus("loading");
  }, [raw, onChange]);

  const handleImgLoad  = () => setStatus("ok");
  const handleImgError = () => setStatus("error");

  const handleClear = () => {
    setRaw("");
    setPreview("");
    onChange("");
    setStatus("idle");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => setShowTips((v) => !v)}
          className="flex items-center gap-1 text-xs text-violet-600 hover:underline"
        >
          <Info className="w-3 h-3" />
          {showTips ? "Sembunyikan tips" : "Tips mendapatkan link"}
        </button>
      </div>

      {/* Tips box */}
      {showTips && (
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 space-y-2">
          <p className="text-xs font-semibold text-violet-700 mb-2">Platform yang didukung:</p>
          {PROVIDERS.map((p) => (
            <div key={p.name} className="flex items-start gap-2">
              <span className="text-sm">{p.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">{p.name}</p>
                <p className="text-xs text-gray-500">{p.hint}</p>
              </div>
            </div>
          ))}
          <div className="pt-1 border-t border-violet-100">
            <p className="text-xs text-violet-600">
              💡 Pastikan gambar bisa diakses publik (tidak memerlukan login).
            </p>
          </div>
        </div>
      )}

      {/* Input URL */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="url"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="https://drive.google.com/... atau link gambar lainnya"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors flex-shrink-0"
        >
          Terapkan
        </button>
      </div>

      {/* Preview box */}
      <div className={`relative rounded-xl border-2 border-dashed overflow-hidden transition-all ${
        status === "ok"    ? "border-green-300 bg-green-50" :
        status === "error" ? "border-red-300 bg-red-50" :
        "border-gray-200 bg-gray-50"
      }`}>
        {preview ? (
          <div className="relative">
            {/* Hidden img untuk validasi */}
            <img
              src={preview}
              onLoad={handleImgLoad}
              onError={handleImgError}
              alt=""
              className="hidden"
            />

            {status === "loading" && (
              <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-xs">Memuat gambar...</p>
              </div>
            )}

            {status === "ok" && (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview produk"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                  <CheckCircle className="w-3 h-3" /> Gambar valid
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <a
                  href={preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-xs rounded-full hover:bg-black/80"
                >
                  <ExternalLink className="w-3 h-3" /> Buka
                </a>
              </div>
            )}

            {status === "error" && (
              <div className="h-40 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm font-semibold text-red-600">Gambar tidak dapat dimuat</p>
                <p className="text-xs text-red-500 text-center px-4">
                  Pastikan link bersifat publik dan berakhiran .jpg / .png / .webp,
                  atau gunakan link konversi Google Drive.
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-red-600 hover:underline"
                >
                  Hapus & coba lagi
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="w-8 h-8" />
            <p className="text-xs text-center">
              Masukkan link gambar di atas<br />lalu klik <strong>Terapkan</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


// ────────────────────────────────────────────────────────────────
// Tipe data form
// ────────────────────────────────────────────────────────────────

interface FormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "tel" | "email" | "select" | "textarea";
  placeholder: string;
  required: boolean;
  options: string; // comma-separated untuk type select
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
  base_price: string;
  is_active: boolean;
  stock: string;
  sort_order: string;
  form_fields: FormField[];
  variants: Variant[];
}

// ── Auto-generate slug ─────────────────────────────────────────
function toSlug(str: string) {
  return str.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}
function uid() { return Math.random().toString(36).slice(2, 8); }

// ── Komponen: satu baris form field dinamis ───────────────────
function FormFieldRow({
  field,
  onChange,
  onRemove,
  index,
}: {
  field: FormField;
  onChange: (f: FormField) => void;
  onRemove: () => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <GripVertical className="w-4 h-4 text-gray-300" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-700 truncate">
            {field.label || `Field ${index + 1}`}
          </span>
          <span className="ml-2 text-xs text-gray-400">({field.type})</span>
          {field.required && (
            <span className="ml-1 text-xs text-red-500">*wajib</span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>

      {expanded && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label tampilan</label>
            <input
              value={field.label}
              onChange={(e) => onChange({ ...field, label: e.target.value })}
              placeholder="Contoh: ID Pemain"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nama key (unik)</label>
            <input
              value={field.name}
              onChange={(e) => onChange({ ...field, name: e.target.value })}
              placeholder="Contoh: player_id"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipe input</label>
            <select
              value={field.type}
              onChange={(e) => onChange({ ...field, type: e.target.value as FormField["type"] })}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white"
            >
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
            <input
              value={field.placeholder}
              onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
              placeholder="Contoh: Masukkan ID Pemain"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          {field.type === "select" && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Opsi pilihan <span className="text-gray-400">(pisahkan dengan koma)</span>
              </label>
              <input
                value={field.options}
                onChange={(e) => onChange({ ...field, options: e.target.value })}
                placeholder="Asia, Europe, America, ..."
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          )}
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id={`req-${field.id}`}
              checked={field.required}
              onChange={(e) => onChange({ ...field, required: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-violet-600 accent-violet-600"
            />
            <label htmlFor={`req-${field.id}`} className="text-xs text-gray-600">
              Field ini wajib diisi pembeli
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Komponen: satu baris varian harga ─────────────────────────
function VariantRow({
  variant,
  onChange,
  onRemove,
}: {
  variant: Variant;
  onChange: (v: Variant) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl bg-white">
      <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <input
          value={variant.label}
          onChange={(e) => onChange({ ...variant, label: e.target.value })}
          placeholder="Label, mis: 86 Diamond"
          className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
          <input
            type="number"
            value={variant.price}
            onChange={(e) => onChange({ ...variant, price: e.target.value })}
            placeholder="Harga jual"
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
          <input
            type="number"
            value={variant.original_price}
            onChange={(e) => onChange({ ...variant, original_price: e.target.value })}
            placeholder="Harga coret (opt.)"
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <input
          type="number"
          value={variant.stock}
          onChange={(e) => onChange({ ...variant, stock: e.target.value })}
          placeholder="Stok (kosong=∞)"
          className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange({ ...variant, is_active: !variant.is_active })}
        title={variant.is_active ? "Nonaktifkan" : "Aktifkan"}
        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
          variant.is_active
            ? "text-green-600 bg-green-50 hover:bg-green-100"
            : "text-gray-400 bg-gray-100 hover:bg-gray-200"
        }`}
      >
        {variant.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

