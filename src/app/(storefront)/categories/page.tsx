// ================================================================
//  FILE 1: src/app/(storefront)/categories/[slug]/page.tsx
//  Halaman kategori — tampilkan produk berdasarkan slug kategori
// ================================================================
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string; name: string; slug: string;
  thumbnail_url: string | null; custom_fields: Record<string, unknown>;
}
interface Category {
  id: string; name: string; slug: string; description: string | null; icon_url: string | null;
}

export default function CategoryPage() {
  const params   = useParams();
  const slug     = params.slug as string;
  const supabase = createClient();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Ambil kategori berdasarkan slug
      const { data: cat, error } = await supabase
        .from("categories").select("*").eq("slug", slug).eq("is_active", true).single();

      if (error || !cat) { setNotFound(true); setLoading(false); return; }
      setCategory(cat);

      // Ambil produk dalam kategori ini
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, slug, thumbnail_url, custom_fields")
        .eq("category_id", cat.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      setProducts(prods ?? []);
      setLoading(false);
    };
    init();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Kategori tidak ditemukan</h1>
        <p className="text-sm text-gray-500 mb-5">Kategori &quot;{slug}&quot; tidak ada atau sudah dihapus.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            {category?.icon_url && (
              <img src={category.icon_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
            )}
            <h1 className="text-sm font-bold text-gray-900">{category?.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        {category?.description && (
          <p className="text-sm text-gray-500 mb-5">{category.description}</p>
        )}

        {products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Belum ada produk di kategori ini</p>
            <p className="text-xs text-gray-400 mt-1">Admin sedang menyiapkan produk terbaik untuk kamu</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">{products.length} produk tersedia</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map(p => (
                <Link key={p.id} href={`/products/${p.slug}`}
                  className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-violet-200 hover:shadow-md transition-all">
                  <div className="aspect-square bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center relative">
    {p.thumbnail_url ? (
        <img src={p.thumbnail_url} alt={p.name} className="w-full h-full object-cover" />
    ) : (
        <ShoppingBag className="w-10 h-10 text-violet-300" />
    )}
    
    {String(p.custom_fields?.badge ?? '') && (
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-violet-600 text-white text-xs rounded-lg">
            {String(p.custom_fields?.badge)}
        </span>
    )}
</div>

                  {/* SETELAH ITU, BARU TAMPILKAN BADGE NYA */}
                    {String(p.custom_fields?.badge ?? '') && (
                   <span className="absolute top-2 left-2 px-2 py-0.5 bg-violet-600 text-white text-xs rounded-lg">
                    {String(p.custom_fields?.badge)}
                 </span>
                                 </div>
                
                {/* Bagian Info Produk */}
                <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                        {p.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">
                        Klik untuk lihat harga
                    </p>
                </div>
            </Link>
        ))}
    </div>
);
