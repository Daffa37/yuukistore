// ════════════════════════════════════════════════════════════════
// FILE 5: src/app/(storefront)/terms/page.tsx
// ════════════════════════════════════════════════════════════════
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-bold">Syarat & Ketentuan</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs text-gray-400">Terakhir diperbarui: 21 Juli 2025</p>
          {[
            { 
              title: "1. Penerimaan Syarat", 
              content: "Dengan menggunakan layanan YuukiStore, kamu menyatakan telah membaca, memahami, dan menyetujui syarat dan ketentuan ini." 
            },
            { 
              title: "2. Layanan Kami", 
              content: "YuukiStore menyediakan layanan penjualan produk digital termasuk top-up game, pulsa, data, akun game, dan gift card. Kami tidak bertanggung jawab atas masalah yang timbul dari penggunaan produk secara tidak sesuai." 
            },
            { 
              title: "3. Pembayaran", 
              content: "Semua transaksi menggunakan mata uang Rupiah (IDR). Pembayaran harus dilakukan sesuai nominal yang tertera. Pesanan akan diproses setelah pembayaran dikonfirmasi oleh tim kami." 
            },
            { 
              title: "4. Kebijakan Refund", 
              content: "Refund dapat dilakukan jika produk tidak terkirim dalam 24 jam setelah pembayaran dikonfirmasi. Refund tidak berlaku jika kesalahan terjadi akibat data yang salah dari pembeli (ID, server, nomor HP)." 
            },
            { 
              title: "5. Larangan", 
              content: "Pengguna dilarang menggunakan layanan kami untuk tujuan ilegal, penipuan, atau melanggar ketentuan game/aplikasi terkait. Pelanggaran dapat mengakibatkan pemblokiran akun." 
            },
            { 
              title: "6. Perubahan Layanan", 
              content: "YuukiStore berhak mengubah, menghentikan, atau memodifikasi layanan sewaktu-waktu tanpa pemberitahuan sebelumnya." 
            },
            { 
              title: "7. Hubungi Kami", 
              content: "Jika ada pertanyaan tentang syarat ini, hubungi kami melalui halaman Kontak atau WhatsApp resmi kami." 
            },
          ].map((s) => (
            <div key={s.title}>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}