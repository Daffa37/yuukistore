"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Copy,
  Smartphone,
  Building2,
  CreditCard,
} from "lucide-react";

type PayMethod = "qris" | "seabank" | "checkout";

const PAYMENT_METHODS = [
  { id: "qris"     as PayMethod, label: "QRIS",          icon: Smartphone, number: "0012345678901234" },
  { id: "seabank"  as PayMethod, label: "SeaBank",        icon: Building2,  number: "901234567890"    },
  { id: "checkout" as PayMethod, label: "Checkout (BCA)", icon: CreditCard, number: "1234567890"      },
];

const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function AkunGamePage() {
  const [payMethod, setPayMethod]   = useState<PayMethod | null>(null);
  const [buyerName, setBuyerName]   = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [copied, setCopied]         = useState(false);
  const [orderId]                   = useState("YK" + Date.now().toString().slice(-8));

  const AKUN = {
    name: "Akun MLBB Sultan",
    price: 350000,
    desc: "Akun Mobile Legends Bangbang level tinggi dengan rank Mythic Glory. Sudah banyak hero dan skin langka. Akun aman, tidak pernah kena banned.",
    details: [
      { label: "Rank",       value: "Mythic Glory ⭐⭐⭐"          },
      { label: "Total Hero", value: "85+ Hero"                     },
      { label: "Total Skin", value: "120+ Skin Langka"             },
      { label: "Diamond",    value: "15.000 Diamond"               },
      { label: "Server",     value: "Asia"                         },
      { label: "Level Akun", value: "Level 30"                     },
      { label: "Status",     value: "✅ Aman, tidak pernah banned" },
      { label: "Garansi",    value: "✅ Garansi ganti jika bermasalah" },
    ],
  };

  const selectedPay = PAYMENT_METHODS.find((p) => p.id === payMethod);

  const handleCopy = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOrder = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
  };

  // ── Tampilan setelah berhasil ──────────────────────────────
  if (done && selectedPay) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-bold mb-1">Pesanan Berhasil!</h2>
            <p className="text-sm text-gray-500 mb-4">
              ID: <strong>{orderId}</strong>
            </p>

            <div className="bg-violet-50 rounded-xl p-4 mb-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Produk</span>
                <span className="font-semibold">{AKUN.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-violet-700">{fmtRp(AKUN.price)}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-xs text-gray-500 mb-1">
                Bayar via <strong>{selectedPay.label}</strong>:
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{selectedPay.number}</span>
                <button
                  onClick={() => handleCopy(selectedPay.number)}
                  className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "✓" : "Salin"}
                </button>
              </div>
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              Detail akun (email & password) akan dikirim ke WhatsApp/email kamu
              setelah pembayaran dikonfirmasi.
            </p>

            <Link
              href="/orders"
              className="block w-full py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl text-center"
            >
              Lihat Pesanan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Tampilan utama ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-bold">Akun Game</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Info akun */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-3xl">
              👑
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{AKUN.name}</h2>
              <p className="text-xl font-bold text-violet-700 mt-0.5">
                {fmtRp(AKUN.price)}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed mb-4">{AKUN.desc}</p>

          {/* Detail akun */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <p className="text-xs font-bold text-gray-700 mb-2">Detail Akun:</p>
            {AKUN.details.map((d) => (
              <div key={d.label} className="flex justify-between text-xs">
                <span className="text-gray-500">{d.label}</span>
                <span className="font-semibold text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data pembeli & pembayaran */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Data Pembeli</h3>

          <input
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="Nama lengkap *"
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <input
            type="tel"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            placeholder="Nomor HP / WhatsApp *"
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <h3 className="text-sm font-bold text-gray-900 pt-1">Metode Pembayaran</h3>

          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setPayMethod(pm.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                payMethod === pm.id
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-100"
              }`}
            >
              <pm.icon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900 flex-1 text-left">
                {pm.label}
              </span>
              {payMethod === pm.id && (
                <CheckCircle className="w-4 h-4 text-violet-600" />
              )}
            </button>
          ))}

          {/* Preview nomor bayar */}
          {selectedPay && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">
                Nomor {selectedPay.label}:
              </p>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">
                  {selectedPay.number}
                </span>
                <button
                  onClick={() => handleCopy(selectedPay.number)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 text-white text-xs rounded-lg"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "✓" : "Salin"}
                </button>
              </div>
            </div>
          )}

          <button
            disabled={!payMethod || !buyerName || !buyerPhone || loading}
            onClick={handleOrder}
            className="w-full py-3 bg-violet-600 text-white font-bold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              `Beli Akun — ${fmtRp(AKUN.price)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}