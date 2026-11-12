import React, { useEffect, useMemo, useState } from "react";
import { Download, TrendingUp } from "lucide-react";
import { orderService } from "../../services/orderService";
import type { CustomerOrder, Product } from "../../types";
import { formatFCFA } from "../../utils/formatters";

type Period = "7" | "30" | "90" | "all";
export const AnalyticsPanel: React.FC<{products: Product[]}> = ({products}) => {
  const [orders,setOrders]=useState<CustomerOrder[]>([]);
  const [period,setPeriod]=useState<Period>("30");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{orderService.list().then(setOrders).catch(e=>setError(e instanceof Error?e.message:"Statistiques indisponibles.")).finally(()=>setLoading(false));},[]);
  const scoped=useMemo(()=>{
    if(period==="all") return orders;
    const cutoff=Date.now()-Number(period)*86400000;
    return orders.filter(o=>new Date(o.createdAt).getTime()>=cutoff);
  },[orders,period]);
  const paid=scoped.filter(o=>o.status==="delivered"&&o.paymentStatus==="paid_on_delivery");
  const revenue=paid.reduce((sum,o)=>sum+(o.total??0),0);
  const topProducts=useMemo(()=>{
    const map=new Map<string,{name:string;quantity:number;revenue:number}>();
    for(const order of paid) for(const item of order.items){
      const row=map.get(item.productId)??{name:item.productName,quantity:0,revenue:0};
      row.quantity+=item.quantity;row.revenue+=item.unitPrice*item.quantity;map.set(item.productId,row);
    }
    return [...map.values()].sort((a,b)=>b.quantity-a.quantity).slice(0,5);
  },[paid]);
  const sourceCounts=["website","whatsapp","admin"].map(source=>({source,count:scoped.filter(o=>o.source===source).length}));
  const lowStock=products.filter(p=>(p.stockCount??0)<=(p.lowStockThreshold??0));
  const exportCsv=()=>{
    const rows=[["Commande","Date","Client","Téléphone","Source","Statut","Paiement","Sous-total","Livraison","Total"],...scoped.map(o=>[o.orderNumber,o.createdAt,o.customerName,o.customerPhone,o.source,o.status,o.paymentStatus,String(o.subtotal),o.deliveryFee===null?"":String(o.deliveryFee),o.total===null?"":String(o.total)])];
    const csv=rows.map(row=>row.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(";")).join("\n");
    const url=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download="nantors-rapport-commandes.csv";link.click();URL.revokeObjectURL(url);
  };
  return <section className="space-y-5">
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#1769FF]">Pilotage commercial</p><h2 className="text-2xl font-bold text-slate-900">Statistiques & rapports</h2><p className="text-sm text-slate-500">Le chiffre d'affaires ne compte que les commandes livrées et payées.</p></div><div className="flex gap-2"><select value={period} onChange={e=>setPeriod(e.target.value as Period)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="7">7 derniers jours</option><option value="30">30 derniers jours</option><option value="90">90 derniers jours</option><option value="all">Toute la période</option></select><button onClick={exportCsv} disabled={!scoped.length} className="inline-flex items-center gap-2 rounded-xl bg-[#1769FF] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"><Download className="h-4 w-4"/>CSV</button></div></header>
    {error&&<div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</div>}
    {loading?<p className="p-10 text-center text-sm text-slate-500">Calcul des indicateurs…</p>:<>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Chiffre d'affaires encaissé</p><p className="mt-1 text-xl font-bold text-slate-900">{formatFCFA(revenue)}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Commandes livrées et payées</p><p className="mt-1 text-2xl font-bold text-slate-900">{paid.length}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Panier moyen encaissé</p><p className="mt-1 text-xl font-bold text-slate-900">{formatFCFA(paid.length?Math.round(revenue/paid.length):0)}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Commandes à traiter</p><p className="mt-1 text-2xl font-bold text-amber-600">{scoped.filter(o=>!["delivered","cancelled"].includes(o.status)).length}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Alertes de stock</p><p className="mt-1 text-2xl font-bold text-amber-600">{lowStock.length}</p></div></div>
      <div className="grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border bg-white p-5"><h3 className="mb-4 font-bold text-slate-900">Meilleures ventes</h3>{topProducts.length?<div className="space-y-3">{topProducts.map((p,i)=><div key={p.name} className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">{i+1}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{p.name}</p><p className="text-xs text-slate-500">{p.quantity} vendu(s)</p></div></div><strong className="shrink-0 text-sm text-slate-800">{formatFCFA(p.revenue)}</strong></div>)}</div>:<p className="text-sm text-slate-500">Pas encore de ventes encaissées sur cette période.</p>}</div>
      <div className="rounded-2xl border bg-white p-5"><h3 className="mb-4 font-bold text-slate-900">Origine des commandes</h3><div className="space-y-3">{sourceCounts.map(item=><div key={item.source}><div className="mb-1 flex justify-between text-sm"><span className="capitalize text-slate-600">{item.source==="website"?"Site web":item.source==="whatsapp"?"WhatsApp":"Saisie admin"}</span><strong className="text-slate-800">{item.count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#1769FF]" style={{width:`${scoped.length?item.count/scoped.length*100:0}%`}}/></div></div>)}</div><div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500"><TrendingUp className="h-4 w-4 text-[#1769FF]"/>Les chiffres sont calculés à partir des commandes présentes dans Firestore.</div></div></div>
    </>}
  </section>;
};
