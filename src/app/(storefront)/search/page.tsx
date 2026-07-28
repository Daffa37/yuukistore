// ================================================================
//  FILE 1: src/app/(storefront)/search/page.tsx
//  Halaman pencarian — terhubung Supabase
// ================================================================
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, ShoppingBag, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  thumbnail_url: string | null;
  categories?: { name: string; slug: string };
}

const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function SearchContent() {
  const searchParams  = useSearchParams();
  const q             = searchParams.get("q") ?? "";
  const supabase      = createClient();
  const [query, setQuery]       = useState(q);
  const [results, setResults]   = useState<Product[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q) return;
    setQuery(q);
    doSearch(q);
  }, [q]);

  const doSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("is_active", true)
      .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
      .order("sort_order", { ascending: true })
      .limit(20);
    setResults(data ?? []);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(query)}`);
      doSearch(query);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk..." autoFocus
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50" />
            {query && (
              <button type="button" onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
          <button type="submit" onClick={handleSubmit}
            className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 flex-shrink-0">
            Cari
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : searched && results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold text-gray-700">Tidak ada hasil untuk &quot;{q}&quot;</p>
            <p className="text-sm text-gray-400 mt-1">Coba kata kunci lain</p>
            <Link href="/" className="inline-block mt-4 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl">
              Kembali ke Beranda
            </Link>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-xs text-gray-500 mb-3">Ditemukan <strong>{results.length}</strong> hasil untuk &quot;{q}&quot;</p>
            <div className="grid grid-cols-2 gap-3">
              {results.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-violet-200 hover:shadow-sm transition-all">
                  <div className="aspect-square bg-violet-50 flex items-center justify-center">
                    {p.thumbnail_url
                      ? <img src={p.thumbnail_url} alt={p.name} className="w-full h-full object-cover" />
                      : <ShoppingBag className="w-10 h-10 text-violet-200" />}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-violet-600 font-medium">{p.categories?.name}</p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 mt-0.5">{p.name}</p>
                    <p className="text-sm font-bold text-violet-700 mt-1">{fmtRp(p.base_price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ketik sesuatu untuk mulai mencari</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">Memuat...</div></div>}>
      <SearchContent />
    </Suspense>
  );
}