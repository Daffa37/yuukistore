import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      amount,
      buyerName,
      buyerPhone,
      productName,
      enabledPayments,
    } = body;

    if (!orderId || !amount || !buyerName || !buyerPhone || !productName) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json(
        { message: "MIDTRANS_SERVER_KEY belum dikonfigurasi di .env.local" },
        { status: 500 }
      );
    }

    const encodedKey = Buffer.from(serverKey + ":").toString("base64");

    const payload: Record<string, unknown> = {
      transaction_details: {
        order_id:     orderId,
        gross_amount: Math.round(amount),
      },
      customer_details: {
        first_name: buyerName,
        phone:      buyerPhone,
      },
      item_details: [
        {
          id:       "PROD-001",
          price:    Math.round(amount),
          quantity: 1,
          name:     productName.slice(0, 50),
        },
      ],
      callbacks: {
        finish:  `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/orders`,
        error:   `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/orders`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/orders`,
      },
    };

    // Jika ada enabledPayments, tambahkan ke payload
    // Ini yang membuat Midtrans hanya tampilkan metode yang dipilih user
    if (enabledPayments && Array.isArray(enabledPayments) && enabledPayments.length > 0) {
      payload.enabled_payments = enabledPayments;
    }

    const midtransRes = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Basic ${encodedKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok) {
      console.error("Midtrans error:", midtransData);
      return NextResponse.json(
        { message: midtransData?.error_messages?.[0] ?? "Gagal membuat token Midtrans" },
        { status: midtransRes.status }
      );
    }

    return NextResponse.json({
      token:        midtransData.token,
      redirect_url: midtransData.redirect_url,
    });

  } catch (error: unknown) {
    console.error("Midtrans API error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
