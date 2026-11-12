import React, { useEffect, useMemo, useState } from "react";
import { Search, Users, ChevronDown, ChevronUp } from "lucide-react";
import { orderService } from "../../services/orderService";
import type { CustomerOrder, OrderStatus } from "../../types";
import { formatFCFA } from "../../utils/formatters";

interface CustomerSummary {
  key: string; phone: string; name: string; city: string; address: string;
  orders: number; paidTotal: number; firstOrder: string; lastOrder: string;
}
const statusLabels: Record<OrderStatus, string> = {
  pending_confirmation: "À confirmer", confirmed: "Confirmée", preparing: "En préparation",
  out_for_delivery: "En livraison", delivered: "Livrée", cancelled: "Annulée",
};

export const CustomersPanel: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  useEffect(() => {
    orderService.list().then(setOrders)
      .catch(e => setError(e instanceof Error ? e.message : "Chargement impossible."))
      .finally(() => setLoading(false));
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    for (const order of orders) {
      const key = order.customerPhone.replace(/\D/g, "");
      if (!key) continue;
      const current = map.get(key);
      const paid = order.status === "delivered" && order.paymentStatus === "paid_on_delivery" ? (order.total ?? 0) : 0;
      if (!current) {
        map.set(key, { key, phone: order.customerPhone, name: order.customerName, city: order.city, address: order.address, orders: 1, paidTotal: paid, firstOrder: order.createdAt, lastOrder: order.createdAt });
      } else {
        current.orders += 1;
        current.paidTotal += paid;
        if (order.createdAt < current.firstOrder) current.firstOrder = order.createdAt;
        if (order.createdAt > current.lastOrder) {
          current.lastOrder = order.createdAt; current.phone = order.customerPhone;
          current.name = order.customerName; current.city = order.city; current.address = order.address;
        }
      }
    }
    return [...map.values()].sort((a, b) => b.lastOrder.localeCompare(a.lastOrder));
  }, [orders]);

  const filtered = customers.filter(c => [c.name, c.phone, c.city, c.address].join(" ").toLowerCase().includes(search.toLowerCase()));
  const selectedCustomer = customers.find(c => c.key === selectedPhone) ?? null;
  const customerOrders = useMemo(() => selectedPhone
    ? orders.filter(order => order.customerPhone.replace(/\D/g, "") === selectedPhone).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [], [orders, selectedPhone]);

  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-[#1769FF]">Relation client</p><h2 className="text-2xl font-bold text-slate-900">Clients</h2><p className="text-sm text-slate-500">Coordonnées, achats réglés et historique privé des commandes.</p></header>
    {error && <div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Clients identifiés</p><p className="mt-1 text-2xl font-bold text-slate-900">{customers.length}</p></div>
      <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Commandes enregistrées</p><p className="mt-1 text-2xl font-bold text-slate-900">{orders.length}</p></div>
      <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Clients avec achat réglé</p><p className="mt-1 text-2xl font-bold text-emerald-700">{customers.filter(c => c.paidTotal > 0).length}</p></div>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un nom, téléphone ou quartier…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm"/></div>
      {loading ? <p className="p-8 text-center text-sm text-slate-500">Chargement des clients…</p> : filtered.length ? <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">Client</th><th className="p-3">Localisation</th><th className="p-3">Commandes</th><th className="p-3">Achats réglés</th><th className="p-3">Dernière commande</th><th className="p-3">Historique</th></tr></thead>
          <tbody>{filtered.map(c => <tr key={c.key} className={`border-t border-slate-100 ${selectedPhone === c.key ? "bg-blue-50/60" : ""}`}>
            <td className="p-3"><p className="font-semibold text-slate-800">{c.name}</p><p className="text-xs text-slate-500">{c.phone}</p></td>
            <td className="p-3 text-slate-600">{[c.city, c.address].filter(Boolean).join(" · ") || "Non renseignée"}</td>
            <td className="p-3 font-medium text-slate-700">{c.orders}</td>
            <td className="p-3 font-semibold text-slate-800">{formatFCFA(c.paidTotal)}</td>
            <td className="p-3 text-slate-500">{new Date(c.lastOrder).toLocaleDateString("fr-FR")}</td>
            <td className="p-3"><button onClick={() => setSelectedPhone(selectedPhone === c.key ? null : c.key)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-[#1769FF]">{selectedPhone === c.key ? "Fermer" : "Voir"}{selectedPhone === c.key ? <ChevronUp className="h-3.5 w-3.5"/> : <ChevronDown className="h-3.5 w-3.5"/>}</button></td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="p-10 text-center"><Users className="mx-auto mb-2 h-8 w-8 text-slate-300"/><p className="text-sm text-slate-500">Aucun client correspondant. Les fiches apparaîtront après les premières commandes.</p></div>}
    </div>

    {selectedCustomer && <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-wider text-[#1769FF]">Dossier client privé</p><h3 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h3><p className="text-sm text-slate-500">{selectedCustomer.phone} · {[selectedCustomer.city, selectedCustomer.address].filter(Boolean).join(" · ")}</p></div><div className="text-sm sm:text-right"><p className="text-slate-500">Total des achats réglés</p><strong className="text-emerald-700">{formatFCFA(selectedCustomer.paidTotal)}</strong></div></div>
      <div className="space-y-3">
        {customerOrders.map(order => <article key={order.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><strong className="text-sm text-slate-900">{order.orderNumber}</strong><span className="ml-2 rounded-full bg-white px-2 py-1 text-xs text-slate-600">{statusLabels[order.status]}</span></div><time className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</time></div>
          <div className="mt-3 space-y-1">{order.items.map((item, index) => <div key={index} className="flex justify-between gap-3 text-xs"><span className="text-slate-600">{item.quantity} × {item.productName}</span><strong className="text-slate-800">{formatFCFA(item.unitPrice * item.quantity)}</strong></div>)}</div>
          <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-2 text-xs"><span className="text-slate-500">Livraison : {order.deliveryFee === null ? "À définir" : formatFCFA(order.deliveryFee)} · Paiement : {order.paymentStatus === "paid_on_delivery" ? "Réglé" : "Non réglé"}</span><strong className="text-slate-900">{order.total === null ? "Total en attente" : formatFCFA(order.total)}</strong></div>
        </article>)}
      </div>
    </section>}
  </section>;
};
