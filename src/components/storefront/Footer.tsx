// ───────────────────────────────────────────────────────────────
// FILE 2: src/components/storefront/Footer.tsx
// Footer dengan copyright YuukiStore
// ────────────────────────────────────────────────────────────────

import { Store as StoreIcon } from "lucide-react";
import Link from "next/link"; // <--- PERBAIKAN PENTING DI SINI!

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Atas: logo + deskripsi + link */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-6">
          {/* Brand */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                <StoreIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">YuukiStore</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Platform jual-beli produk digital terpercaya. Top-up game, pulsa, akun, dan gift card — proses cepat dan aman.
            </p>
          </div>

          {/* Link kolom */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold text-gray-800 mb-2 text-xs uppercase tracking-wide">Produk</p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                <li><Link href="/categories/top-up-game"  className="hover:text-violet-600 transition-colors">Top-Up Game</Link></li>
                <li><Link href="/categories/pulsa-data"   className="hover:text-violet-600 transition-colors">Pulsa & Data</Link></li>
                <li><Link href="/categories/akun-game"    className="hover:text-violet-600 transition-colors">Akun Game</Link></li>
                <li><Link href="/categories/gift-card"    className="hover:text-violet-600 transition-colors">Gift Card</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2 text-xs uppercase tracking-wide">Bantuan</p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                <li><Link href="/faq"     className="hover:text-violet-600 transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-violet-600 transition-colors">Hubungi kami</Link></li>
                <li><Link href="/terms"   className="hover:text-violet-600 transition-colors">Syarat & ketentuan</Link></li>
                <li><Link href="/privacy" className="hover:text-violet-600 transition-colors">Kebijakan privasi</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            {/* Copyright */}
            <p className="text-xs text-gray-400 text-center sm:text-left">
              © {year} YuukiStore. Hak cipta dilindungi undang-undang.
            </p>
            {/* Admin akses tersembunyi */}
            <p className="text-xs text-gray-300 text-center">
              Dibuat dengan ❤️ untuk komunitas gamer Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
