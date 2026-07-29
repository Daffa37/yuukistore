// ================================================================
//  FILE: src/lib/utils.ts
//  Helper functions & utilities
// ================================================================

// Fungsi cn sederhana (Mengganti import yang hilang dari Shadcn)
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- TIPE DATA ORDER ---
// Mendefinisikan tipe OrderStatus yang hilang agar TypeScript tidak error
export type OrderStatus = "pending" | "paid" | "processing" | "completed" | "cancelled" | "expired";

// Helper untuk mendapatkan warna status order (Untuk UI)
export const getOrderStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    pending:    "bg-yellow-100 text-yellow-800",
    paid:       "bg-blue-100 text-blue-800",
    processing: "bg-indigo-100 text-indigo-800",
    completed:  "bg-green-100 text-green-800",
    cancelled:  "bg-red-100 text-red-800",
    expired:    "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};
