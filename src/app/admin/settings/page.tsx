// ================================================================
//  FILE 3: src/app/admin/settings/page.tsx
//  Pengaturan toko
// ================================================================
"use client";

import { CheckCircle, Globe, Loader2, Mail, Phone, Save, Store } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [storeName, setStoreName]   = useState("YuukiStore");
  const [storeEmail, setStoreEmail] = useState("youxiyuuki531@gmail.com");
  const [storeWa, setStoreWa]       = useState("+62 812-3456-7890");
  const [storeUrl, setStoreUrl]     = useState("https://yuukistore.pages.dev");
  const [saved, setSaved]           = useState(false);
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-xl shadow-lg">
          <CheckCircle className="w-4 h-4" /> Pengaturan disimpan!
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Konfigurasi toko YuukiStore</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Store className="w-5 h-5 text-violet-600" />
          <p className="text-sm font-bold text-gray-900">Informasi Toko</p>
        </div>

        {[
          { label: "Nama Toko",  icon: Store,  val: storeName,   set: setStoreName,   ph: "Nama toko",    type: "text"  },
          { label: "Email Toko", icon: Mail,   val: storeEmail,  set: setStoreEmail,  ph: "Email",        type: "email" },
          { label: "WhatsApp",   icon: Phone,  val: storeWa,     set: setStoreWa,     ph: "+62...",       type: "tel"   },
          { label: "URL Website",icon: Globe,  val: storeUrl,    set: setStoreUrl,    ph: "https://...",  type: "url"   },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
            <div className="relative">
              <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                placeholder={f.ph}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
        ))}

        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan Pengaturan</>}
        </button>
      </div>
    </div>
  );
}
