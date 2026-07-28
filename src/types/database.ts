// ────────────────────────────────────────────────────────────────
// FILE 4: src/types/database.ts
// TypeScript types untuk database Supabase (generate otomatis)
// Jalankan: npx supabase gen types typescript --project-id <id> > src/types/database.ts
// Atau definisikan manual seperti di bawah:
// ────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "user";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";

export type FulfillmentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

// ── Form field definition (disimpan di products.form_fields) ──
export interface FormFieldDefinition {
  name: string;       // key unik, contoh: "player_id"
  label: string;      // label ditampilkan ke user, contoh: "ID Pemain"
  type: "text" | "number" | "tel" | "email" | "select" | "textarea";
  placeholder?: string;
  required: boolean;
  options?: string[]; // untuk type "select"
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// ── Varian produk (disimpan di products.variants) ──
export interface ProductVariant {
  id: string;          // uuid lokal
  label: string;       // contoh: "86 Diamond"
  price: number;       // harga dalam Rupiah
  original_price?: number; // harga coret (opsional)
  stock?: number;
  is_active: boolean;
}

// ── Tabel: users ──────────────────────────────────────────────
export interface User {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Tabel: categories ─────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  cover_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Tabel: products ───────────────────────────────────────────
export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  base_price: number;
  is_active: boolean;
  stock: number | null;
  sort_order: number;
  form_fields: FormFieldDefinition[];
  variants: ProductVariant[];
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Join fields (opsional)
  categories?: Pick<Category, "id" | "name" | "slug">;
}

// ── Tabel: orders ─────────────────────────────────────────────
export interface Order {
  id: string;
  user_id: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  status: OrderStatus;
  payment_method: string | null;
  payment_ref: string | null;
  paid_at: string | null;
  total_amount: number;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // Join fields
  order_items?: OrderItem[];
  users?: Pick<User, "id" | "full_name" | "email">;
}

// ── Tabel: order_items ────────────────────────────────────────
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  form_data: Record<string, string | number>;
  fulfillment_status: FulfillmentStatus;
  fulfilled_at: string | null;
  fulfillment_notes: string | null;
  created_at: string;
  // Join
  products?: Pick<Product, "id" | "name" | "thumbnail_url">;
}


