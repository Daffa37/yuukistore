// ────────────────────────────────────────────────────────────────
// FILE 5: src/utils/format.ts
// Helper functions umum
// ────────────────────────────────────────────────────────────────

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(dateString));
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    pending:    "bg-yellow-100 text-yellow-800",
    paid:       "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    completed:  "bg-green-100 text-green-800",
    cancelled:  "bg-red-100 text-red-800",
    refunded:   "bg-gray-100 text-gray-800",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800";
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    pending:    "Menunggu Bayar",
    paid:       "Sudah Dibayar",
    processing: "Diproses",
    completed:  "Selesai",
    cancelled:  "Dibatalkan",
    refunded:   "Dikembalikan",
  };
  return labels[status] ?? status;
};
