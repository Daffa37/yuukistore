"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Shield, Zap, CheckCircle, Loader2,
  ShoppingCart, AlertCircle, Info, ShoppingBag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Variant {
  id: string;
  label: string;
  price: number;
  original_price?: number | null;
  is_active: boolean;
}

interface FormFieldDef {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  base_price: number;
  variants: Variant[];
  form_fields: FormFieldDef[];
  categories?: { name: string; slug: string };
}

type PayMethod =
  | "bank_transfer"
  | "gopay"
  | "ovo"
  | "dana"
  | "shopeepay"
  | "qris"
  | "credit_card"
  | "cstore";

interface PayMethodOption {
  id: PayMethod;
  label: string;
  emoji: string;
  enabledPayments: string[]; // Midtrans enabled_payments value
}

const PAY_METHODS: PayMethodOption[] = [
  { id: "bank_transfer", label: "Transfer Bank", emoji: "🏦", enabledPayments: ["bca_va", "bni_va", "bri_va", "mandiri_bill", "permata_va", "other_va"] },
  { id: "gopay",         label: "GoPay",         emoji: "💚", enabledPayments: ["gopay"] },
  { id: "ovo",           label: "OVO",            emoji: "💜", enabledPayments: ["ovo"] },
  { id: "dana",          label: "DANA",           emoji: "💙", enabledPayments: ["dana"] },
  { id: "shopeepay",     label: "ShopeePay",      emoji: "🧡", enabledPayments: ["shopeepay"] },
  { id: "qris",          label: "QRIS",           emoji: "📱", enabledPayments: ["other_qris"] },
  { id: "credit_card",   label: "Kartu Kredit",   emoji: "💳", enabledPayments: ["credit_card"] },
  { id: "cstore",        label: "Alfamart/Indomaret", emoji: "🏪", enabledPayments: ["cstore"] },
];

const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function ManualInfoBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
      <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="text-xs text-amber-700 leading-relaxed">
        <p className="font-bold mb-0.5">INFO PENTING</p>
        Semua transaksi diproses <strong>MANUAL</strong> oleh admin.
        Jam kerja: <strong>08.00 – 22.00 WIB</strong>.
        Harap bersabar menunggu antrean proses setelah melakukan pembayaran.
        Hubungi CS WhatsApp kami jika pesanan belum masuk lebih dari <strong>30 menit</strong>.
      </div>
    </div>
  );
}

function DynamicField({ field, value, onChange }: {
  field: FormFieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const isServer = field.name.toLowerCase().includes("server");

  if (field.type === "textarea" && !isServer) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || `Masukkan ${field.label}`}
        rows={3}
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
      />
    );
  }

  return (
    <input
      type={isServer ? "text" : field.type === "select" ? "text" : field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={
        isServer
          ? "Contoh: 1234 (lihat di profil game kamu)"
          : field.placeholder || `Masukkan ${field.label}`
      }
      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
    />
  );
}

export default function ProductDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = params.slug as string;
  const supabase = createClient();

  const [product, setProduct]     = useState<Product | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [formData, setFormData]         = useState<Record<string, string>>({});
  const [buyerName, setBuyerName]       = useState("");
  const [buyerPhone, setBuyerPhone]     = useState("");
  const [selectedPay, setSelectedPay]   = useState<PayMethod | null>(null);
  const [ordering, setOrdering]         = useState(false);
  const [formError, setFormError]       = useState("");
  const [orderDone, setOrderDone]       = useState(false);
  const [savedOrderId, setSavedOrderId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending" | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase
          .from("users").select("full_name, phone").eq("id", user.id).single();
        if (profile?.full_name) setBuyerName(profile.full_name);
        if (profile?.phone)     setBuyerPhone(profile.phone);
      }

      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug).eq("is_active", true).single();

      if (error || !data) setNotFound(true);
      else setProduct(data);
      setLoading(false);
    };
    init();
  }, [slug]);

  // Load Midtrans Snap.js
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) return;
    if (document.getElementById("midtrans-snap")) { setSnapReady(true); return; }
    const script  = document.createElement("script");
    script.id     = "midtrans-snap";
    script.src    = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => setSnapReady(true);
    document.head.appendChild(script);
  }, []);

  const totalAmount = selectedVariant?.price ?? product?.base_price ?? 0;

  const validate = (): boolean => {
    if (!buyerName.trim())  { setFormError("Nama wajib diisi."); return false; }
    if (!buyerPhone.trim()) { setFormError("Nomor HP wajib diisi."); return false; }
    const activeVars = product?.variants?.filter((v) => v.is_active) ?? [];
    if (activeVars.length > 0 && !selectedVariant) {
      setFormError("Pilih nominal/varian terlebih dahulu."); return false;
    }
    for (const field of product?.form_fields ?? []) {
      if (field.required && !formData[field.name]?.trim()) {
        setFormError(`${field.label} wajib diisi.`); return false;
      }
    }
    if (!selectedPay) { setFormError("Pilih metode pembayaran terlebih dahulu."); return false; }
    return true;
  };

  // Klik metode bayar → langsung proses & buka Midtrans
  const handlePayMethodClick = async (method: PayMethodOption) => {
    setSelectedPay(method.id);
    setFormError("");

    // Validasi form dulu (kecuali metode bayar)
    if (!buyerName.trim())  { setFormError("Nama wajib diisi."); return; }
    if (!buyerPhone.trim()) { setFormError("Nomor HP wajib diisi."); return; }
    const activeVars = product?.variants?.filter((v) => v.is_active) ?? [];
    if (activeVars.length > 0 && !selectedVariant) {
      setFormError("Pilih nominal/varian terlebih dahulu."); return;
    }
    for (const field of product?.form_fields ?? []) {
      if (field.required && !formData[field.name]?.trim()) {
        setFormError(`${field.label} wajib diisi.`); return;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).snap) {
      setFormError("Sistem pembayaran belum siap. Tunggu beberapa detik."); return;
    }

    setOrdering(true);

    try {
      const orderId = "YK" + Date.now().toString().slice(-8);

      // 1. Simpan order ke Supabase
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert([{
          user_id:        currentUserId,
          buyer_name:     buyerName.trim(),
          buyer_email:    buyerPhone.trim() + "@noemail.yuukistore.id",
          buyer_phone:    buyerPhone.trim(),
          status:         "pending",
          payment_method: method.id,
          payment_ref:    orderId,
          total_amount:   totalAmount,
        }])
        .select().single();

      if (orderErr) throw orderErr;

      // 2. Simpan order items
      await supabase.from("order_items").insert([{
        order_id:      order.id,
        product_id:    product?.id,
        product_name:  product?.name,
        variant_label: selectedVariant?.label ?? null,
        unit_price:    totalAmount,
        quantity:      1,
        subtotal:      totalAmount,
        form_data:     formData,
      }]);

      setSavedOrderId(order.id);

      // 3. Buat Midtrans token dengan enabled_payments spesifik
      const tokenRes = await fetch("/api/midtrans/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount:          totalAmount,
          buyerName:       buyerName.trim(),
          buyerPhone:      buyerPhone.trim(),
          productName:     `${product?.name}${selectedVariant ? " - " + selectedVariant.label : ""}`,
          enabledPayments: method.enabledPayments, // filter metode di Midtrans
        }),
      });

      if (!tokenRes.ok) {
        const errData = await tokenRes.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal mendapatkan token pembayaran");
      }

      const { token: snapToken } = await tokenRes.json();
      setOrdering(false);

      // 4. Buka Midtrans Snap langsung
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).snap.pay(snapToken, {
        onSuccess: async (result: Record<string, string>) => {
          await supabase.from("orders").update({
            status:      "paid",
            payment_ref: result.transaction_id ?? orderId,
            paid_at:     new Date().toISOString(),
          }).eq("id", order.id);

          // Notifikasi ntfy.sh
          fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId:      order.id,
              productName:  product?.name,
              variantLabel: selectedVariant?.label,
              buyerName:    buyerName.trim(),
              buyerPhone:   buyerPhone.trim(),
              totalAmount,
              formData,
              notifEmail:   true,
              notifWa:      true,
            }),
          }).catch(() => {});

          setPaymentStatus("paid");
          setOrderDone(true);
        },
        onPending: async (result: Record<string, string>) => {
          await supabase.from("orders").update({
            status:      "pending",
            payment_ref: result.transaction_id ?? orderId,
          }).eq("id", order.id);
          setPaymentStatus("pending");
          setOrderDone(true);
        },
        onError: (err: Record<string, string>) => {
          setFormError("Pembayaran gagal: " + (err.status_message || "Silakan coba lagi."));
        },
        onClose: () => {
          setPaymentStatus("pending");
          setOrderDone(true);
        },
      });

    } catch (err: unknown) {
      setOrdering(false);
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  };

  // Tombol "Bayar Sekarang" — untuk yang sudah pilih metode
  const handleOrder = async () => {
    setFormError("");
    if (!validate()) return;
    const method = PAY_METHODS.find((m) => m.id === selectedPay)!;
    await handlePayMethodClick(method);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Produk tidak ditemukan</h1>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );

  if (orderDone) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            paymentStatus === "paid" ? "bg-green-100" : "bg-amber-100"
          }`}>
            {paymentStatus === "paid"
              ? <CheckCircle className="w-8 h-8 text-green-600" />
              : <Info className="w-8 h-8 text-amber-500" />}
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {paymentStatus === "paid" ? "Pembayaran Berhasil! 🎉" : "Pesanan Menunggu Pembayaran"}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            ID: <strong className="font-mono text-gray-900">#{savedOrderId.slice(0, 8).toUpperCase()}</strong>
          </p>
          <div className="bg-violet-50 rounded-xl p-4 mb-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Produk</span>
              <span className="font-semibold text-gray-900 text-right max-w-44">{product.name}</span>
            </div>
            {selectedVariant && (
              <div className="flex justify-between">
                <span className="text-gray-500">Varian</span>
                <span className="font-semibold">{selectedVariant.label}</span>
              </div>
            )}
            {Object.entries(formData).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-500 capitalize">{k.replace(/_/g, " ")}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-violet-100 pt-2">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-violet-700 text-base">{fmtRp(totalAmount)}</span>
            </div>
          </div>
          {paymentStatus === "pending" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left">
              <p className="text-xs text-amber-700 font-bold mb-1">⏳ Pembayaran Belum Selesai</p>
              <p className="text-xs text-amber-600">
                Selesaikan pembayaran melalui halaman Pesanan Saya atau ulangi order.
              </p>
            </div>
          )}
          <ManualInfoBanner />
          <div className="flex gap-2 mt-4">
            <Link href="/orders"
              className="flex-1 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 text-center">
              Lihat Pesanan Saya
            </Link>
            <Link href="/"
              className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 text-center">
              Kembali
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const activeVariants = product.variants?.filter((v) => v.is_active) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">{product.name}</h1>
            <p className="text-xs text-gray-500">{product.categories?.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <ManualInfoBanner />

        {/* Info produk */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-violet-50 flex items-center justify-center flex-shrink-0">
              {product.thumbnail_url
                ? <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                : <ShoppingBag className="w-8 h-8 text-violet-300" />}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{product.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Zap className="w-3 h-3 text-violet-500" /> Manual
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Shield className="w-3 h-3 text-green-500" /> Aman
                </span>
              </div>
            </div>
          </div>
          {product.description && (
            <p className="text-xs text-gray-500 leading-relaxed">{product.description}</p>
          )}
        </div>

        {/* Pilih varian */}
        {activeVariants.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Pilih Nominal / Varian</h3>
            <div className="grid grid-cols-2 gap-2">
              {activeVariants.map((v) => (
                <button key={v.id} onClick={() => setSelectedVariant(v)}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                    selectedVariant?.id === v.id
                      ? "border-violet-500 bg-violet-50"
                      : "border-gray-100 hover:border-violet-200"
                  }`}>
                  <p className="text-xs font-semibold text-gray-900 mb-0.5 pr-5">{v.label}</p>
                  <p className="text-sm font-bold text-violet-700">{fmtRp(v.price)}</p>
                  {v.original_price != null &&
                    Number(v.original_price) > 0 &&
                    Number(v.original_price) > v.price && (
                      <p className="text-[10px] text-gray-400 line-through">
                        {fmtRp(Number(v.original_price))}
                      </p>
                    )}
                  {selectedVariant?.id === v.id && (
                    <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-violet-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Harga tunggal */}
        {activeVariants.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-semibold">Harga</span>
              <span className="text-xl font-bold text-violet-700">{fmtRp(product.base_price)}</span>
            </div>
          </div>
        )}

        {/* Form dinamis */}
        {product.form_fields && product.form_fields.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Data Pemesanan</h3>
            {product.form_fields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  {field.name.toLowerCase().includes("server") && (
                    <span className="ml-1 text-gray-400 font-normal">(angka/nama dari profil game)</span>
                  )}
                </label>
                <DynamicField
                  field={field}
                  value={formData[field.name] ?? ""}
                  onChange={(v) => setFormData((prev) => ({ ...prev, [field.name]: v }))}
                />
              </div>
            ))}
          </div>
        )}

        {/* Data pembeli */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Data Pembeli</h3>
            {currentUserId && (
              <span className="text-xs text-green-600 font-medium">✓ Auto-isi dari akun</span>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap *</label>
            <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Nama kamu"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nomor HP / WhatsApp *</label>
            <input type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        {/* ── Metode Pembayaran — klik langsung bayar ────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Pilih Metode Pembayaran</h3>
            <span className="text-xs text-gray-400">Klik untuk langsung bayar</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PAY_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => handlePayMethodClick(method)}
                disabled={ordering}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedPay === method.id
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-100 hover:border-violet-300 hover:bg-violet-50/50 active:scale-95"
                }`}
              >
                <span className="text-xl">{method.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{method.label}</p>
                  {selectedPay === method.id && ordering && (
                    <p className="text-[10px] text-violet-600">Memproses...</p>
                  )}
                </div>
                {selectedPay === method.id && !ordering && (
                  <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0" />
                )}
                {selectedPay === method.id && ordering && (
                  <Loader2 className="w-4 h-4 text-violet-600 animate-spin flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">
            Pilihan lengkap tersedia di halaman Midtrans setelah klik
          </p>
        </div>

        {/* Error */}
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formError}
          </div>
        )}

        {/* Total & tombol bayar (alternatif jika sudah pilih metode) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-gray-700">Total Pembayaran</span>
            <span className="text-xl font-bold text-violet-700">{fmtRp(totalAmount)}</span>
          </div>
          <button
            onClick={handleOrder}
            disabled={ordering || !snapReady || !selectedPay || (activeVariants.length > 0 && !selectedVariant)}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {ordering ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Menyiapkan Pembayaran...</>
            ) : !snapReady ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Memuat sistem bayar...</>
            ) : selectedPay ? (
              <><ShoppingCart className="w-4 h-4" />Bayar via {PAY_METHODS.find(m => m.id === selectedPay)?.label}</>
            ) : (
              <><ShoppingCart className="w-4 h-4" />Pilih metode pembayaran di atas</>
            )}
          </button>
          {!selectedPay && (
            <p className="text-xs text-center text-gray-400 mt-2">
              Atau klik langsung metode pembayaran di atas
            </p>
          )}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
