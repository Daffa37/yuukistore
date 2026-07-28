// ================================================================
//  FILE 1: src/app/api/notify/route.ts
//  API Route untuk kirim notifikasi via ntfy.sh
//  ntfy.sh topic: yuukistore-order
//
//  CARA KERJA:
//  - Dipanggil setiap kali ada pesanan baru
//  - Kirim notifikasi ke https://ntfy.sh/yuukistore-order
//  - User subscribe ke topic itu via app ntfy di HP
//  - Jika user aktifkan Email → kirim juga via email ntfy
// ================================================================

import { NextRequest, NextResponse } from "next/server";

const NTFY_TOPIC = "yuukistore-order";
const NTFY_URL   = `https://ntfy.sh/${NTFY_TOPIC}`;

interface NotifyPayload {
  orderId:       string;
  productName:   string;
  variantLabel?: string;
  buyerName:     string;
  buyerPhone:    string;
  totalAmount:   number;
  formData?:     Record<string, string>;
  notifEmail?:   boolean;
  notifWa?:      boolean;
  buyerEmail?:   string;
}

export async function POST(req: NextRequest) {
  try {
    const body: NotifyPayload = await req.json();
    const {
      orderId, productName, variantLabel, buyerName,
      buyerPhone, totalAmount, formData = {},
      notifEmail = false, notifWa = false, buyerEmail = "",
    } = body;

    const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

    // ── Susun isi pesan ──────────────────────────────────────
    const formLines = Object.entries(formData)
      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
      .join("\n");

    const message = [
      `🛒 PESANAN BARU - YuukiStore`,
      ``,
      `📦 Produk: ${productName}${variantLabel ? ` (${variantLabel})` : ""}`,
      `💰 Total: ${fmtRp(totalAmount)}`,
      ``,
      `👤 Pembeli: ${buyerName}`,
      `📱 No. HP: ${buyerPhone}`,
      formLines ? `\n📋 Data Pemesanan:\n${formLines}` : "",
      ``,
      `🔖 ID Pesanan: #${orderId.slice(0, 8).toUpperCase()}`,
      `⏰ Status: Menunggu konfirmasi admin`,
    ].filter(Boolean).join("\n");

    const results: string[] = [];

    // ── 1. Kirim notifikasi push ke ntfy.sh ──────────────────
    // User bisa subscribe di: https://ntfy.sh/yuukistore-order
    // atau install app ntfy di HP
    const ntfyRes = await fetch(NTFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Title":        `Pesanan Baru: ${productName}`,
        "Priority":     "high",
        "Tags":         "shopping,bell",
        "Icon":         "https://ntfy.sh/static/img/favicon.png",
      },
      body: message,
    });

    if (ntfyRes.ok) {
      results.push("push_ok");
    } else {
      results.push("push_failed");
    }

    // ── 2. Kirim via Email (jika user aktifkan notif email) ──
    // ntfy.sh mendukung email subscriber via topic
    // User bisa subscribe email di: https://ntfy.sh/yuukistore-order
    // Atau kita bisa kirim langsung jika ada email
    if (notifEmail && buyerEmail && !buyerEmail.includes("@noemail")) {
      const emailMessage = [
        `Halo ${buyerName}!`,
        ``,
        `Pesanan kamu di YuukiStore telah berhasil dibuat.`,
        ``,
        `Detail Pesanan:`,
        `- Produk: ${productName}${variantLabel ? ` (${variantLabel})` : ""}`,
        `- Total: ${fmtRp(totalAmount)}`,
        formLines ? `- Data:\n${formLines}` : "",
        ``,
        `ID Pesanan: #${orderId.slice(0, 8).toUpperCase()}`,
        ``,
        `Pesanan kamu sedang menunggu konfirmasi admin.`,
        `Jam kerja: 08.00 - 22.00 WIB`,
        ``,
        `Jika ada pertanyaan, hubungi CS WhatsApp kami.`,
        ``,
        `Terima kasih sudah berbelanja di YuukiStore! 🎮`,
      ].filter(Boolean).join("\n");

      // Kirim notif email via ntfy.sh dengan email tag
      await fetch(NTFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Title":        `[YuukiStore] Pesanan #${orderId.slice(0, 8).toUpperCase()} Berhasil`,
          "Email":        buyerEmail, // ntfy.sh akan forward ke email ini
          "Tags":         "email,shopping",
        },
        body: emailMessage,
      });

      results.push("email_sent");
    }

    // ── 3. Notif WhatsApp (jika user aktifkan) ───────────────
    // ntfy.sh tidak support WhatsApp langsung
    // Untuk WA bisa pakai Fonnte/WhatsApp Business API
    // Sementara kirim notif push saja dengan tag WA
    if (notifWa && buyerPhone) {
      const waMessage = [
        `📱 *YuukiStore - Konfirmasi Pesanan*`,
        ``,
        `Halo *${buyerName}*!`,
        `Pesananmu telah diterima.`,
        ``,
        `*${productName}${variantLabel ? ` - ${variantLabel}` : ""}*`,
        `Total: *${fmtRp(totalAmount)}*`,
        formLines ? `\nData:\n${formLines}` : "",
        ``,
        `ID: *#${orderId.slice(0, 8).toUpperCase()}*`,
        `Status: Menunggu konfirmasi admin`,
        `Jam kerja: 08.00 - 22.00 WIB`,
      ].filter(Boolean).join("\n");

      // Push notif dengan tag WA untuk menandai
      await fetch(NTFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Title":        `[WA] Pesanan dari ${buyerName} - ${buyerPhone}`,
          "Tags":         "whatsapp,phone",
          "Priority":     "high",
        },
        body: waMessage,
      });

      results.push("wa_notif_sent");
    }

    return NextResponse.json({ success: true, results });

  } catch (error: unknown) {
    console.error("Notify error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}



