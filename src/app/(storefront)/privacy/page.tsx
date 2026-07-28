// ════════════════════════════════════════════════════════════════
// FILE 4: src/app/(storefront)/privacy/page.tsx
// ════════════════════════════════════════════════════════════════
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-bold">Kebijakan Privasi</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-4">Terakhir diperbarui: 21 Juli 2025</p>
          {[
            { 
              title: "1. Informasi yang Kami Kumpulkan", 
              content: "Kami mengumpulkan informasi yang kamu berikan saat mendaftar akun, melakukan pemesanan, atau menghubungi kami. Informasi ini meliputi nama, email, nomor HP, dan data transaksi." 
            },
            { 
              title: "2. Penggunaan Informasi", 
              content: "Informasi yang kami kumpulkan digunakan untuk memproses pesanan, mengirimkan konfirmasi transaksi, meningkatkan layanan kami, dan menghubungi kamu terkait pesanan atau akun." 
            },
            { 
              title: "3. Keamanan Data", 
              content: "Kami menggunakan enkripsi SSL/TLS untuk melindungi data yang dikirimkan. Data kamu disimpan di server yang aman dan hanya dapat diakses oleh personel yang berwenang." 
            },
            { 
              title: "4. Berbagi Data", 
              content: "Kami tidak menjual, menukar, atau memindahkan informasi pribadi kamu kepada pihak ketiga tanpa persetujuan kamu, kecuali diperlukan untuk memproses pesanan atau diwajibkan oleh hukum." 
            },
            { 
              title: "5. Cookie", 
              content: "Website kami menggunakan cookie untuk meningkatkan pengalaman pengguna. Kamu dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi dengan baik." 
            },
            { 
              title: "6. Perubahan Kebijakan", 
              content: "Kami berhak mengubah kebijakan privasi ini sewaktu-waktu. Perubahan akan diberitahukan melalui website dan/atau email terdaftar." 
            },
          ].map((s) => (
            <div key={s.title} className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}