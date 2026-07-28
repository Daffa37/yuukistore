"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, CheckCircle, Loader2, Copy, Smartphone, Building2, CreditCard } from "lucide-react";

type Operator = "telkomsel" | "indosat" | "xl" | "tri" | "smartfren";
type PulsaType = "pulsa" | "data";
type PayMethod = "qris" | "seabank" | "checkout";

const OPERATORS: { id: Operator; label: string; icon: string }[] = [
  { id: "telkomsel", label: "Telkomsel",  icon: "🔴" },
  { id: "indosat",   label: "Indosat",    icon: "🟡" },
  { id: "xl",        label: "XL Axiata",  icon: "🔵" },
  { id: "tri",       label: "Tri",        icon: "🟣" },
  { id: "smartfren", label: "Smartfren",  icon: "🟢" },
];

const PULSA_VARIANTS = [
  { id: "p1", label: "Rp 5.000",   price: 6000   },
  { id: "p2", label: "Rp 10.000",  price: 11000  },
  { id: "p3", label: "Rp 20.000",  price: 21500  },
  { id: "p4", label: "Rp 25.000",  price: 26500  },
  { id: "p5", label: "Rp 50.000",  price: 52000  },
  { id: "p6", label: "Rp 100.000", price: 102000 },
];

const DATA_VARIANTS = [
  { id: "d1", label: "1 GB / 7 hari",      price: 13000  },
  { id: "d2", label: "2 GB / 30 hari",     price: 22000  },
  { id: "d3", label: "5 GB / 30 hari",     price: 45000  },
  { id: "d4", label: "10 GB / 30 hari",    price: 75000  },
  { id: "d5", label: "20 GB / 30 hari",    price: 120000 },
  { id: "d6", label: "Unlimited / 30 hari",price: 180000 },
];

const PAYMENT_METHODS = [
  { id: "qris"     as PayMethod, label: "QRIS",          icon: Smartphone, number: "0012345678901234" },
  { id: "seabank"  as PayMethod, label: "SeaBank",        icon: Building2,  number: "901234567890"    },
  { id: "checkout" as PayMethod, label: "Checkout (BCA)", icon: CreditCard, number: "1234567890"      },
];

const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function PulsaDataPage() {    // ← HANYA INI YANG BERUBAH
  // ... sisa kode sama persis seperti file yang diunduh
}