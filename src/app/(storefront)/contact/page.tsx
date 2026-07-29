"use client";

import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ================================================================
//  ACCESS KEY WEB3FORMS SUDAH DIISI!
//  Email tujuan diarahkan ke daffafirzatullah03@gmail.com
// ================================================================
const WEB3FORMS_KEY = "8780b098-12b5-4952-af58-60758137bcfb"; 

export default function ContactPage() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim())    { setError("Nama wajib diisi."); return; }
    if (!email.trim())   { setError("Email wajib diisi."); return; }
    if (!message.trim()) { setError("Pesan wajib diisi."); return; }

    setLoading(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || `[YuukiStore] Pesan dari ${name.trim()}`,
          message: message.trim(),
          // Opsi tambahan Web3Forms:
          from_name: "YuukiStore Contact Form",
          redirect: false, // jangan redirect, kita handle sendiri
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        setName(""); setEmail(""); setSubject(""); setMessage("");
      } else {
        throw new Error(data.message ?? "Pengiriman gagal");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim pesan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-bold">Hubungi Kami</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Info kontak */}
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: "💬", label: "WhatsApp",       value: "+62 851-7234-7189",       href: "https://wa.me/6285172347189" },
            { icon: "📧", label: "Email",           value: "daffafirzatullah03@gmail.com", href: "mailto:daffafirzatullah03@gmail.com" },
            { icon: "🕐", label: "Jam Operasional", value: "08.00 – 21.00 WIB",       href: null },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="text-sm font-semibold text-violet-700 hover:underline truncate block">
                    {c.value}
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{c.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Kirim Pesan</h3>
          <p className="text-xs text-gray-400 mb-4">
            Pesan akan langsung dikirim ke inbox Gmail admin.
          </p>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">Pesan berhasil terkirim!</p>
              <p className="text-sm text-gray-500 mb-4">
                Admin akan membalasmu dalam 1×24 jam via email atau WhatsApp.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-violet-600 hover:underline"
              >
                Kirim pesan lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-3">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@kamu.com"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Subjek <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Topik pesan"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pesan *</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tulis pesanmu di sini..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                ) : (
                  "📨 Kirim ke Admin"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
