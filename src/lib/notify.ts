// ================================================================
//  FILE 2: src/lib/notify.ts
//  Helper function untuk kirim notifikasi dari mana saja
// ================================================================

export interface NotifyOrderParams {
  orderId:       string;
  productName:   string;
  variantLabel?: string;
  buyerName:     string;
  buyerPhone:    string;
  buyerEmail?:   string;
  totalAmount:   number;
  formData?:     Record<string, string>;
  notifEmail?:   boolean;
  notifWa?:      boolean;
}

export async function sendOrderNotification(params: NotifyOrderParams) {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch (err) {
    // Jangan sampai error notifikasi menggagalkan flow order
    console.error("Notifikasi gagal:", err);
  }
}