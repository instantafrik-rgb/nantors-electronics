import React, { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { orderService } from "../../services/orderService";
import type { CustomerOrder } from "../../types";
import { formatFCFA } from "../../utils/formatters";

interface CustomerSummary {
  phone: string; name: string; city: string; address: string;
  orders: number; paidTotal: number; firstOrder: string; lastOrder: string;
}
export const CustomersPanel: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    orderService.list().then(setOrders).catch(e => setError(e instanceof Error ? e.message : "Chargement impossible.")).finally(() => setLoading(false));
  }, []);
  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    for (const order of orders) {
      const key = order.customerPhone.trim();
      if (!key) continue;
      const current = map.get(key);
      const paid = order.status === "delivered" && order.paymentStatus === "paid_on_delivery" ? (order.total ?? 0) : 0;
      if (!current) map.set(key, { phone:key, name:order.customerName, city:order.city, address:order.address, orders:1, paidTotal:paid, firstOrder:order.createdAt, lastOrder:order.createdAt });
      else {
        current.orders += 1; current.paidTotal += paid;
        if (order.createdAt < current.firstOrder) current.firstOrder = order.createdAt;
        if (order.createdAt > current.lastOrder) { current.lastOrder = order.createdAt; current.name = order.customerName; current.city = order.city; current.address = order.address; }
      }
    }
    return [...map.values()].sort((a,b) => b.lastOrder.localeCompare(a.lastOrder));
  }, [orders]);
  const filtered = customers.filter(c => [c.name,c.phone,c.city,c.address].join(" ").toLowerCase().includes(search.toLowerCase()));
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-[#1769FF]">Relation client</p><h2 className="text-2xl font-bold text-slate-900">Clients</h2><p className="text-sm text-slate-500">Fiche client construite à partir de l'historique des commandes.</p></header>
    {error && <div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Clients identifiés</p><p className="mt-1 text-2xl font-bold text-slate-900">{customers.length}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Commandes enregistrées</p><p className="mt-1 text-2xl font-bold text-slate-900">{orders.length}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Clients avec achat réglé</p><p className="mt-1 text-2xl font-bold text-emerald-700">{customers.filter(c => c.paidTotal > 0).length}</p></div></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un nom, téléphone ou quartier…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm"/></div>
      {loading ? <p className="p-8 text-center text-sm text-slate-500">Chargement des clients…</p> : filtered.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">Client</th><th className="p-3">Localisation</th><th className="p-3">Commandes</th><th className="p-3">Achats réglés</th><th className="p-3">Dernière commande</th></tr></thead><tbody>{filtered.map(c=><tr key={c.phone} className="border-t border-slate-100"><td className="p-3"><p className="font-semibold text-slate-800">{c.name}</p><p className="text-xs text-slate-500">{c.phone}</p></td><td className="p-3 text-slate-600">{[c.city,c.address].filter(Boolean).join(" · ") || "Non renseignée"}</td><td className="p-3 font-medium text-slate-700">{c.orders}</td><td className="p-3 font-semibold text-slate-800">{formatFCFA(c.paidTotal)}</td><td className="p-3 text-slate-500">{new Date(c.lastOrder).toLocaleDateString("fr-FR")}</td></tr>)}</tbody></table></div> : <div className="p-10 text-center"><Users className="mx-auto mb-2 h-8 w-8 text-slate-300"/><p className="text-sm text-slate-500">Aucun client correspondant. Les fiches apparaîtront après les premières commandes.</p></div>}
    </div>
  </section>;
};
