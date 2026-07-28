"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart,
  Users, Tag, Settings, Store, ChevronLeft,
  ChevronRight, LogOut, Bell, Menu, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { label: "Dashboard",  href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Produk",     href: "/admin/products",   icon: Package         },
  { label: "Kategori",   href: "/admin/categories", icon: Tag             },
  { label: "Pesanan",    href: "/admin/orders",      icon: ShoppingCart    },
  { label: "Pengguna",   href: "/admin/users",       icon: Users           },
  { label: "Pengaturan", href: "/admin/settings",    icon: Settings        },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className={`flex flex-col bg-gray-900 text-white transition-all duration-300 ${collapsed ? "w-16" : "w-60"} min-h-screen flex-shrink-0`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Store className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="text-base font-bold">YuukiStore</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon     = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative ${
                isActive ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700 p-2 space-y-1">
        <Link href="/" target="_blank" title={collapsed ? "Lihat Toko" : undefined}
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Store className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Lihat Toko</span>}
        </Link>
        <button onClick={handleLogout} title={collapsed ? "Keluar" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
        <button onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Ciutkan</span></>}
        </button>
      </div>
    </aside>
  );
}

function Header({ onMobileMenu }: { onMobileMenu: () => void }) {
  const supabase = createClient();
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? "");
    });
  }, []);

  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center gap-4 px-4 md:px-6 py-3">
      <button onClick={onMobileMenu} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1" />
      <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
        <Bell className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-sm font-bold text-violet-700">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-gray-900 truncate max-w-32">{email}</p>
          <p className="text-[10px] text-gray-400">Admin</p>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      </div>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 flex">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
