// ================================================================
//  FILE 2: src/app/(storefront)/products/page.tsx
//  Halaman "Semua produk" dengan filter kategori & search
// ================================================================
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, ShoppingBag, Filter, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  thumbnail_url: string | null;
  custom_fields: Record<string, unknown>;
  categories?: { id: string; name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AllProductsPage() {
  const supabase = createClient();

  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    // Ambil semua kategori untuk filter
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));

    fetchProducts();
  }, []);

  const fetchProducts = async (categoryId?: string, searchQuery?: string) => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }
    if (searchQuery && searchQuery.trim()) {
      query = query.ilike("name", `%${searchQuery.trim()}%`);
    }

    const { data } = await query;
    setProducts(data ?? []);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(activeCategory, search);
  };

  const handleCategoryFilter = (catId: string) => {
    setActiveCategory(catId);
    fetchProducts(catId, search);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchProducts(activeCategory, "");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-bold text-gray-900">Semua Produk</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-9 pr-10 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Filter kategori */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => handleCategoryFilter("all")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === "all"
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-violet-300"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? "bg-violet-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-violet-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Produk */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada produk"}
            </p>
            {search && (
              <button
                onClick={handleClearSearch}
                className="mt-3 text-sm text-violet-600 hover:underline"
              >
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400">{products.length} produk ditemukan</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-violet-200 hover:shadow-md transition-all"
                >
                  {/* Thumbnail — TANPA HARGA */}
                  <div className="aspect-square bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
                    {p.thumbnail_url ? (
                      <img
                        src={p.thumbnail_url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="w-10 h-10 text-violet-300" />
                    )}
                    {p.custom_fields?.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-violet-600 text-white text-[10px] font-semibold rounded-full">
                        {String(p.custom_fields.badge)}
                      </span>
                    )}
                  </div>
                  {/* Info — TANPA HARGA */}
                  <div className="p-3">
                    <p className="text-[11px] text-violet-600 font-medium mb-0.5">
                      {p.categories?.name}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">Klik untuk lihat harga →</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}