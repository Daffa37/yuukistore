// ================================================================
//  FILE: src/app/api/midtrans/create-token/route.ts
//
//  API Route untuk membuat Midtrans Snap Token (server-side)
//
//  PRODUCTION SETUP:
//  1. Daftar di https://midtrans.com
//  2. Dashboard → Settings → Access Keys
//  3. Tambahkan ke .env.local:
//     NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-V51AyIGAPlUdBH9B
//     MIDTRANS_SERVER_KEY=Mid-server-Kz2-4kUSFJ6l4swABTQqLFu2
//  4. Production endpoints:
//     https://app.midtrans.com/snap/snap.js
//     https://app.midtrans.com/snap/v1/transactions
// ================================================================

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, buyerName, buyerEmail, buyerPhone, productName, productDescription } = body;

    // Validasi input
    if (!orderId || !amount || !buyerName || !buyerEmail || !buyerPhone || !productName) {
      return NextResponse.json(
        { 
          success: false,
          message: "Data tidak lengkap. Mohon isi semua field yang diperlukan." 
        },
        { status: 400 }
      );
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerEmail)) {
      return NextResponse.json(
        { 
          success: false,
          message: "Format email tidak valid." 
        },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json(
        { 
          success: false,
          message: "MIDTRANS_SERVER_KEY belum dikonfigurasi di environment variables." 
        },
        { status: 500 }
      );
    }

    // Encode server key ke Base64 untuk Basic Auth
    const encodedKey = Buffer.from(serverKey + ":").toString("base64");

    // Pastikan amount adalah integer dan minimal 1
    const grossAmount = Math.max(1, Math.round(amount));

    // Payload ke Midtrans Snap API (Production)
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: buyerName.slice(0, 50),
        email: buyerEmail.slice(0, 50),
        phone: buyerPhone.slice(0, 20),
      },
      item_details: [
        {
          id: "PROD-001",
          price: grossAmount,
          quantity: 1,
          name: productName.slice(0, 50),
          ...(productDescription && { 
            description: productDescription.slice(0, 100) 
          }),
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/orders`,
        error: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/orders`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/orders`,
      },
      // Enable untuk production features
      credit_card: {
        secure: true,
        save_card: false,
        bank: "bca",
        installment: {
          required: false,
          terms: {
            bni: [3, 6, 12],
            mandiri: [3, 6, 12],
            bca: [3, 6, 12],
            bri: [3, 6, 12],
          },
        },
      },
      // Custom field untuk tracking
      custom_field1: "production",
      custom_field2: new Date().toISOString(),
    };

    // Request ke Midtrans Snap API (Production)
    const midtransRes = await fetch(
      "https://app.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${encodedKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const midtransData = await midtransRes.json();

    // Log untuk debugging (hapus di production jika tidak diperlukan)
    if (process.env.NODE_ENV === "development") {
      console.log("Midtrans Request:", {
        url: "https://app.midtrans.com/snap/v1/transactions",
        orderId,
        amount: grossAmount,
        status: midtransRes.status,
      });
    }

    if (!midtransRes.ok) {
      console.error("Midtrans error:", midtransData);
      
      // Handle error messages dari Midtrans
      let errorMessage = "Gagal membuat token pembayaran.";
      if (midtransData?.error_messages) {
        errorMessage = midtransData.error_messages.join(", ");
      } else if (midtransData?.message) {
        errorMessage = midtransData.message;
      }

      return NextResponse.json(
        { 
          success: false,
          message: errorMessage,
          details: midtransData 
        },
        { status: midtransRes.status }
      );
    }

    // Kembalikan token ke client
    return NextResponse.json({
      success: true,
      token: midtransData.token,
      redirect_url: midtransData.redirect_url,
      transaction_id: midtransData.transaction_id || orderId,
    });

  } catch (error: unknown) {
    console.error("Midtrans API error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
    
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}