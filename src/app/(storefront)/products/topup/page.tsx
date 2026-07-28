"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Star, Shield, Zap, ChevronDown,
  CheckCircle, Loader2, User, Server, CreditCard,
  Smartphone, Building2, ShoppingCart, Info, Copy,
  AlertCircle,
} from "lucide-react";

// ── Tipe data ──────────────────────────────────────────────────
interface Variant { id: string; label: string; price: number; original?: number; bonus?: string }
type PayMethod = "qris" | "seabank" | "checkout";

// ── Data produk contoh (nanti dari Supabase) ──────────────────
const PRODUCT = {
  name: "Mobile Legends Diamond",
  category: "Top-Up Game",
  game: "Mobile Legends",
  rating: 4.9,
  sold: 12000,
  thumbnail: "💎",
  description: "Top-up Diamond Mobile Legends resmi dan aman. Proses otomatis dalam hitungan menit setelah pembayaran dikonfirmasi.",
  variants: [
    { id: "v1",  label: "86 Diamond",   price: 19000,  original: 22000, bonus: "+8 bonus" },
    { id: "v2",  label: "172 Diamond",  price: 37000,  original: 44000, bonus: "+16 bonus" },
    { id: "v3",  label: "257 Diamond",  price: 54000,  original: 66000 },
    { id: "v4",  label: "344 Diamond",  price: 71000,  original: 88000 },
    { id: "v5",  label: "429 Diamond",  price: 87000,  original: 110000 },
    { id: "v6",  label: "514 Diamond",  price: 103000, original: 132000 },
    { id: "v7",  label: "706 Diamond",  price: 140000, original: 176000, bonus: "Promo!" },
    { id: "v8",  label: "878 Diamond",  price: 172000, original: 220000 },
    { id: "v9",  label: "963 Diamond",  price: 187000, original: 242000 },
    { id: "v10", label: "1412 Diamond", price: 272000, original: 352000, bonus: "Best Value" },
    { id: "v11", label: "2195 Diamond", price: 418000, original: 528000 },
    { id: "v12", label: "3688 Diamond", price: 693000, original: 880000, bonus: "Hemat 21%" },
  ] as Variant[],
  servers: ["(1) America", "(2) Asia", "(3) Europe", "(4) S.America"],
};

const PAYMENT_METHODS = [
  { id: "qris",     label: "QRIS",          icon: Smartphone, number: "0012345678901234", desc: "Scan QR — semua e-wallet" },
  { id: "seabank",  label: "SeaBank",        icon: Building2,  number: "901234567890",    desc: "Transfer bank SeaBank" },
  { id: "checkout", label: "Checkout (BCA)", icon: CreditCard, number: "1234567890",      desc: "Transfer BCA a.n. Yuuki Store" },
] as { id: PayMethod; label: string; icon: React.ElementType; number: string; desc: string }[];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

// ── Step indicator ────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ["Pilih Nominal", "Data Akun", "Pembayaran"];
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              i < current ? "bg-violet-600 border-violet-600 text-white" :
              i === current ? "border-violet-600 text-violet-600 bg-white" :
              "border-gray-200 text-gray-400 bg-white"
            }`}>
              {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${i === current ? "text-violet-600" : "text-gray-400"}`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mb-4 ${i < current ? "bg-violet-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function TopUpGamePage() {
  const [step, setStep]             = useState(0);
  const [selected, setSelected]     = useState<Variant | null>(null);
  const [playerId, setPlayerId]     = useState("");
  const [serverId, setServerId]     = useState("");
  const [nickname, setNickname]     = useState("");
  const [checkingNick, setCheckingNick] = useState(false);
  const [nickError, setNickError]   = useState("");
  const [payMethod, setPayMethod]   = useState<PayMethod | null>(null);
  const [buyerName, setBuyerName]   = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [copied, setCopied]         = useState(false);
  const [orderDone, setOrderDone]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [orderId]                   = useState("YK" + Date.now().toString().slice(-8));

  // Cek nickname dari ID + Server
  const checkNickname = async () => {
    if (!playerId || !serverId) {
      setNickError("Masukkan ID Pemain dan Server terlebih dahulu.");
      return;
    }
    setCheckingNick(true);
    setNickError("");
    setNickname("");
    // Simulasi API cek nickname (ganti dengan API ML sungguhan)
    await new Promise((r) => setTimeout(r, 1200));
    if (playerId.length >= 6) {
      setNickname("Yuuki" + playerId.slice(-3)); // simulasi
    } else {
      setNickError("ID Pemain tidak ditemukan. Periksa kembali.");
    }
    setCheckingNick(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOrder = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setOrderDone(true);
  };

  const selectedPayment = PAYMENT_METHODS.find((p) => p.id === payMethod);

  // ── Selesai ──────────────────────────────────────────────────
  if (orderDone && selectedPayment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Pesanan Berhasil Dibuat!</h2>
            <p className="text-sm text-gray-500 mb-4">ID Pesanan: <strong className="text-gray-900">{orderId}</strong></p>

            <div className="bg-violet-50 rounded-xl p-4 mb-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Produk</span>
                <span className="font-semibold text-gray-900">{selected?.label} {PRODUCT.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ID Pemain</span>
                <span className="font-semibold">{playerId} ({nickname})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Bayar</span>
                <span className="font-bold text-violet-700 text-base">{formatRp(selected?.price ?? 0)}</span>
              </div>
            </div>

            {/* Nomor pembayaran */}
            <div className="bg-gray-50 rounded-xl p-4 text-left mb-4">
              <p className="text-xs text-gray-500 mb-1">Bayar via <strong>{selectedPayment.label}</strong> ke:</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900 tracking-wide">{selectedPayment.number}</span>
                <button
                  onClick={() => handleCopy(selectedPayment.number)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "Disalin!" : "Salin"}
                </button>
              </div>
              {payMethod === "seabank" && (
                <p className="text-xs text-gray-400 mt-1">a.n. Yuuki Store</p>
              )}
              {payMethod === "checkout" && (
                <p className="text-xs text-gray-400 mt-1">a.n. Yuuki Store (BCA)</p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left mb-5">
              <p className="text-xs text-amber-700 font-semibold mb-1">⚠️ Penting!</p>
              <p className="text-xs text-amber-600">Bayar tepat sesuai nominal. Konfirmasi ke admin setelah transfer. Diamond akan masuk dalam 5–15 menit.</p>
            </div>

            <Link href="/orders" className="block w-full py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 text-center">
              Lihat Pesanan Saya
            </Link>
          </div>
          <Link href="/" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-violet-600">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-gray-900">{PRODUCT.name}</h1>
            <p className="text-xs text-gray-500">{PRODUCT.category}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Steps current={step} />

        {/* ── STEP 0: Pilih nominal ────────────────────────── */}
        {step === 0 && (
          <>
            {/* Info produk */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-3xl">{PRODUCT.thumbnail}</div>
                <div>
                  <h2 className="font-bold text-gray-900">{PRODUCT.name}</h2>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {PRODUCT.rating} · {PRODUCT.sold.toLocaleString()} terjual
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-violet-500" /> Proses instan</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-500" /> 100% aman</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{PRODUCT.description}</p>
            </div>

            {/* Grid pilih nominal */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Pilih Nominal Diamond</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRODUCT.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelected(v)}
                    className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                      selected?.id === v.id
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-100 hover:border-violet-200 bg-white"
                    }`}
                  >
                    {v.bonus && (
                      <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        {v.bonus}
                      </span>
                    )}
                    <p className="text-xs font-semibold text-gray-900 mb-0.5">💎 {v.label}</p>
                    <p className="text-sm font-bold text-violet-700">{formatRp(v.price)}</p>
                    {v.original && (
                      <p className="text-[10px] text-gray-400 line-through">{formatRp(v.original)}</p>
                    )}
                    {selected?.id === v.id && (
                      <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-violet-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!selected}
              onClick={() => setStep(1)}
              className="w-full py-3.5 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {selected ? `Lanjut — ${formatRp(selected.price)}` : "Pilih nominal dahulu"}
            </button>
          </>
        )}

        {/* ── STEP 1: Data akun ──────────────────────────────── */}
        {step === 1 && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Data Akun Game</h3>

              {/* ID Pemain */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <User className="w-3 h-3 inline mr-1" /> ID Pemain *
                </label>
                <input
                  type="number"
                  value={playerId}
                  onChange={(e) => { setPlayerId(e.target.value); setNickname(""); setNickError(""); }}
                  placeholder="Contoh: 123456789"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Server */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <Server className="w-3 h-3 inline mr-1" /> Server *
                </label>
                <div className="relative">
                  <select
                    value={serverId}
                    onChange={(e) => { setServerId(e.target.value); setNickname(""); setNickError(""); }}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white appearance-none"
                  >
                    <option value="">-- Pilih Server --</option>
                    {PRODUCT.servers.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Cek nickname */}
              <button
                onClick={checkNickname}
                disabled={checkingNick || !playerId || !serverId}
                className="w-full py-2.5 border-2 border-violet-200 text-violet-700 text-sm font-semibold rounded-xl hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkingNick ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengecek...</> : "🔍 Cek Nickname"}
              </button>

              {/* Hasil nickname */}
              {nickname && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Nickname ditemukan:</p>
                    <p className="text-sm font-bold text-gray-900">{nickname}</p>
                  </div>
                </div>
              )}
              {nickError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600">{nickError}</p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Pastikan ID dan server sudah benar. Diamond akan dikirim ke akun ini dan tidak bisa dibatalkan.</p>
              </div>
            </div>

            {/* Summary pilihan */}
            <div className="bg-violet-50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-600 font-semibold">Nominal dipilih</p>
                <p className="text-sm font-bold text-gray-900">💎 {selected?.label}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-base font-bold text-violet-700">{formatRp(selected?.price ?? 0)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 text-sm">
                Kembali
              </button>
              <button
                disabled={!nickname}
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Lanjut Bayar
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Pembayaran ─────────────────────────────── */}
        {step === 2 && (
          <>
            {/* Ringkasan pesanan */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Ringkasan Pesanan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Produk</span>
                  <span className="font-semibold">💎 {selected?.label} {PRODUCT.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Pemain</span>
                  <span className="font-semibold">{playerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nickname</span>
                  <span className="font-semibold text-green-700">{nickname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Server</span>
                  <span className="font-semibold">{serverId}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total Bayar</span>
                  <span className="font-bold text-violet-700 text-base">{formatRp(selected?.price ?? 0)}</span>
                </div>
              </div>
            </div>

            {/* Data pembeli */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Data Pembeli</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap *</label>
                <input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nomor HP *</label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Metode pembayaran */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Metode Pembayaran</h3>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPayMethod(pm.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                      payMethod === pm.id
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-100 hover:border-violet-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      payMethod === pm.id ? "bg-violet-100" : "bg-gray-100"
                    }`}>
                      <pm.icon className={`w-5 h-5 ${payMethod === pm.id ? "text-violet-600" : "text-gray-500"}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-gray-900">{pm.label}</p>
                      <p className="text-xs text-gray-500">{pm.desc}</p>
                    </div>
                    {payMethod === pm.id && <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Preview nomor pembayaran */}
              {selectedPayment && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Nomor {selectedPayment.label}:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900 tracking-wide">{selectedPayment.number}</span>
                    <button
                      onClick={() => handleCopy(selectedPayment.number)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 text-white text-xs rounded-lg"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? "✓" : "Salin"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 text-sm">
                Kembali
              </button>
              <button
                disabled={!payMethod || !buyerName || !buyerPhone || loading}
                onClick={handleOrder}
                className="flex-1 py-3 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <><ShoppingCart className="w-4 h-4" /> Pesan Sekarang</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
