// ================================================================
//  FILE 1: src/app/(storefront)/categories/page.tsx
//  Halaman "Lihat semua" kategori
// ================================================================
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Gamepad2, Smartphone, CreditCard, Gift, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const getCatIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("game") || n.includes("top")) return Gamepad2;
  if (n.includes("pulsa") || n.includes("data")) return Smartphone;
  if (n.includes("akun")) return CreditCard;
  if (n.includes("gift") || n.includes("voucher") || n.includes("item")) return Gift;
  return ShoppingBag;
};

export default function AllCategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setCategories(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-bold text-gray-900">Semua Kategori</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Belum ada kategori</p>
            <p className="text-xs text-gray-400 mt-1">Admin sedang menyiapkan kategori produk</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">{categories.length} kategori tersedia</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = getCatIcon(cat.name);
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-100 rounded-xl hover:border-violet-200 hover:shadow-sm transition-all text-center group"
                  >
                    {cat.icon_url ? (
                      <img
                        src={cat.icon_url}
                        alt={cat.name}
                        className="w-14 h-14 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-violet-100 group-hover:bg-violet-200 transition-colors flex items-center justify-center">
                        <Icon className="w-7 h-7 text-violet-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{cat.description}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}