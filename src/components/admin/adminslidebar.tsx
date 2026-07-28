// ────────────────────────────────────────────────────────────────
// src/components/admin/AdminSidebar.tsx
// Sidebar navigasi admin panel
// ────────────────────────────────────────────────────────────────

import {
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingCart,
    Store,
    Tag,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

// ── Tipe navigasi sidebar ──────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",  href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Produk",     href: "/admin/products",   icon: Package },
  { label: "Kategori",   href: "/admin/categories", icon: Tag },
  { label: "Pesanan",    href: "/admin/orders",      icon: ShoppingCart, badge: 5 },
  { label: "Pengguna",   href: "/admin/users",       icon: Users },
  { label: "Pengaturan", href: "/admin/settings",    icon: Settings },
];

// ── Komponen AdminSidebar ──────────────────────────────────────
export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        relative flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-64"}
        min-h-screen shrink-0
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <div className="flex items-center justify-center w-8 h-8 bg-violet-500 rounded-lg shrink-0">
          <Store className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-white">
            YuukiStore
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150 group relative
                ${isActive
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
              {/* Tooltip saat collapsed */}
              {collapsed && (
                <span className="
                  absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs
                  rounded whitespace-nowrap opacity-0 group-hover:opacity-100
                  pointer-events-none transition-opacity z-50
                ">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: lihat toko & toggle */}
      <div className="border-t border-gray-700 p-3 space-y-2">
        <Link
          href="/"
          target="_blank"
          title={collapsed ? "Lihat Toko" : undefined}
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Store className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Lihat Toko</span>}
        </Link>

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Ciutkan</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

