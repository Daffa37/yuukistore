import Link from "next/link";
import { Store } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Navbar minimal */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">YuukiStore</span>
          </Link>
        </div>
      </nav>

      {/* Konten halaman login/register */}
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4 py-10">
        {children}
      </div>
    </div>
  );
}
