import React, { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Package, ShoppingBag, Wallet } from "lucide-react";
import type { CustomerOrder, Product } from "../../types";
import { orderService } from "../../services/orderService";
import { formatFCFA } from "../../utils/formatters";
import { config } from "../../config/environment";

const statusNames: Record<string,string> = {
  pending_confirmation:"À confirmer", confirmed:"Confirmée", preparing:"En préparation",
  out_for_delivery:"En livraison", delivered:"Livrée", cancelled:"Annulée"
};
export const OverviewPanel: React.FC<{products:Product[]}> = ({products}) => {
  const [orders,setOrders]=useState<CustomerOrder[]>([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{orderService.list().then(setOrders).catch(e=>setError(e instanceof Error?e.message:"Les commandes sont indisponibles.")).finally(()=>setLoading(false));},[]);
  const revenue=useMemo(()=>orders.filter(o=>o.status==="delivered"&&o.paymentStatus==="paid_on_delivery").reduce((sum,o)=>sum+(o.total??0),0),[orders]);
  const pending=orders.filter(o=>!["delivered","cancelled"].includes(o.status)).length;
  const lowStock=products.filter(p=>(p.stockCount??0)<=(p.lowStockThreshold??config.shop.stockAlertThreshold));
  const recent=[...orders].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,6);
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-[#1769FF]">Vue d'ensemble</p><h2 className="text-2xl font-bold text-slate-900">Bonjour, bienvenue dans votre boutique.</h2><p className="text-sm text-slate-500">Les indicateurs se mettent à jour à partir des commandes et du catalogue.</p></header>
    {error&&<div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Commandes totales</p><ShoppingBag className="h-4 w-4 text-[#1769FF]"/></div><p className="mt-2 text-2xl font-bold text-slate-900">{loading?"—":orders.length}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">À traiter</p><Activity className="h-4 w-4 text-amber-600"/></div><p className="mt-2 text-2xl font-bold text-amber-700">{loading?"—":pending}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Chiffre d'affaires encaissé</p><Wallet className="h-4 w-4 text-emerald-600"/></div><p className="mt-2 text-xl font-bold text-slate-900">{loading?"—":formatFCFA(revenue)}</p><p className="mt-1 text-[11px] text-slate-400">Livrées et payées uniquement</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Stock bas</p><AlertTriangle className="h-4 w-4 text-amber-600"/></div><p className="mt-2 text-2xl font-bold text-amber-700">{lowStock.length}</p></div>
    </div>
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-slate-900">Commandes récentes</h3><span className="text-xs text-slate-400">6 dernières</span></div>{loading?<p className="text-sm text-slate-500">Chargement…</p>:recent.length?<div className="space-y-3">{recent.map(order=><div key={order.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><div><p className="text-sm font-semibold text-slate-800">{order.orderNumber} · {order.customerName}</p><p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("fr-FR")} · {order.source==="website"?"Site web":order.source==="whatsapp"?"WhatsApp":"Admin"}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{statusNames[order.status]??order.status}</span></div>)}</div>:<p className="py-8 text-center text-sm text-slate-500">Les nouvelles commandes apparaîtront ici.</p>}</div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-slate-900">État du catalogue</h3><Package className="h-4 w-4 text-[#1769FF]"/></div><div className="space-y-3"><div className="flex justify-between text-sm"><span className="text-slate-500">Références</span><strong className="text-slate-900">{products.length}</strong></div><div className="flex justify-between text-sm"><span className="text-slate-500">Disponibles</span><strong className="text-slate-900">{products.filter(p=>p.isAvailable).length}</strong></div><div className="flex justify-between text-sm"><span className="text-slate-500">En rupture / masqués</span><strong className="text-slate-900">{products.filter(p=>!p.isAvailable).length}</strong></div><div className="border-t border-slate-100 pt-3"><p className="mb-2 text-xs font-semibold text-slate-600">À réapprovisionner</p>{lowStock.length?lowStock.slice(0,5).map(p=><div key={p.id} className="flex justify-between gap-2 py-1 text-xs"><span className="truncate text-slate-600">{p.name}</span><strong className="text-amber-700">{p.stockCount??0}</strong></div>):<p className="text-xs text-slate-500">Aucune alerte calculée.</p>}</div></div></div>
    </div>
  </section>;
};
