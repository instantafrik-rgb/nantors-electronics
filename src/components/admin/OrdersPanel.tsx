import React, { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, ShoppingBag, MessageCircle, CheckCircle2, Clock3, Truck, X } from "lucide-react";
import type { CustomerOrder, OrderStatus, OrderItem, Product } from "../../types";
import { orderService } from "../../services/orderService";
import { formatFCFA } from "../../utils/formatters";

const labels: Record<OrderStatus,string> = {
  pending_confirmation: "À confirmer", confirmed: "Confirmée", preparing: "En préparation",
  out_for_delivery: "En livraison", delivered: "Livrée", cancelled: "Annulée"
};
const nextStatuses: OrderStatus[] = ["confirmed","preparing","out_for_delivery","delivered","cancelled"];

export const OrdersPanel: React.FC<{ products: Product[]; onRefreshProducts: () => void }> = ({ products, onRefreshProducts }) => {
  const [orders,setOrders] = useState<CustomerOrder[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("all");
  const [creating,setCreating] = useState(false);
  const [saving,setSaving] = useState(false);
  const [form,setForm] = useState({ source: "whatsapp" as "whatsapp"|"admin", customerName:"", customerPhone:"", city:"", address:"", notes:"", productId:"", quantity:1 });
  const [deliveryFees,setDeliveryFees] = useState<Record<string,string>>({});
  const [feeOrder,setFeeOrder] = useState<string|null>(null);

  const load = async () => { setLoading(true); setError(""); try { setOrders(await orderService.list()); } catch(e:any) { setError(e?.message || "Impossible de charger les commandes."); } finally { setLoading(false); } };
  useEffect(()=>{ void load(); },[]);
  const filtered = useMemo(()=>orders.filter(o=>(filter==="all"||o.status===filter) && [o.orderNumber,o.customerName,o.customerPhone].join(" ").toLowerCase().includes(search.toLowerCase())),[orders,filter,search]);

  const create = async () => {
    const product = products.find(p=>p.id===form.productId);
    if (!product) { setError("Sélectionnez un produit."); return; }
    setSaving(true); setError("");
    try {
      const item: OrderItem = { productId:product.id, productName:product.name, unitPrice:product.price, quantity:Math.max(1,Math.floor(form.quantity)) };
      await orderService.createManual({ source:form.source, customerName:form.customerName, customerPhone:form.customerPhone, city:form.city, address:form.address, notes:form.notes, items:[item] });
      setCreating(false); setForm({source:"whatsapp",customerName:"",customerPhone:"",city:"",address:"",notes:"",productId:"",quantity:1}); await load();
    } catch(e:any) { setError(e?.message || "Création impossible."); } finally { setSaving(false); }
  };
  const setStatus = async (order:CustomerOrder,status:OrderStatus) => {
    if(status==="confirmed" && !window.confirm("Confirmer cette commande ? Le stock sera déduit immédiatement.")) return;
    if(status==="cancelled" && !window.confirm("Annuler cette commande ? Le stock déjà déduit sera réintégré.")) return;
    setSaving(true); setError("");
    try { await orderService.updateStatus(order.id,status); await load(); onRefreshProducts(); }
    catch(e:any) { setError(e?.message || "Mise à jour impossible."); } finally { setSaving(false); }
  };
  const saveFee = async (id:string) => {
    setSaving(true); setError("");
    try { await orderService.setDeliveryFee(id,Number(deliveryFees[id])); setFeeOrder(null); await load(); }
    catch(e:any) { setError(e?.message || "Impossible d'enregistrer les frais."); } finally { setSaving(false); }
  };
  const markPaid = async (id:string) => { setSaving(true); try { await orderService.markPaid(id); await load(); } catch(e:any) { setError(e?.message || "Mise à jour impossible."); } finally { setSaving(false); } };

  return <section className="space-y-5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div><p className="text-xs uppercase tracking-[.18em] text-[#1769FF] font-bold">Gestion commerciale</p><h2 className="text-2xl font-bold text-[#101828]">Commandes</h2><p className="text-sm text-slate-500">Site web, WhatsApp et saisie manuelle · Paiement à la livraison</p></div>
      <div className="flex gap-2"><button onClick={()=>void load()} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 bg-white"><RefreshCw className="w-4 h-4"/></button><button onClick={()=>setCreating(v=>!v)} className="px-4 py-2.5 rounded-xl bg-[#1769FF] text-white text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4"/> Nouvelle commande</button></div>
    </div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
    {creating && <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
      <div className="flex justify-between"><h3 className="font-bold text-[#101828]">Saisir une commande reçue</h3><button onClick={()=>setCreating(false)}><X className="w-4 h-4"/></button></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="border rounded-xl p-3 text-sm" placeholder="Nom du client *" value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})}/>
        <input className="border rounded-xl p-3 text-sm" placeholder="Téléphone / WhatsApp *" value={form.customerPhone} onChange={e=>setForm({...form,customerPhone:e.target.value})}/>
        <input className="border rounded-xl p-3 text-sm" placeholder="Ville / quartier" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
        <input className="border rounded-xl p-3 text-sm" placeholder="Adresse de livraison" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
        <select className="border rounded-xl p-3 text-sm" value={form.source} onChange={e=>setForm({...form,source:e.target.value as any})}><option value="whatsapp">WhatsApp</option><option value="admin">Autre / téléphone</option></select>
        <select className="border rounded-xl p-3 text-sm" value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})}><option value="">Choisir un produit *</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} — {formatFCFA(p.price)}</option>)}</select>
        <input type="number" min="1" className="border rounded-xl p-3 text-sm" placeholder="Quantité" value={form.quantity} onChange={e=>setForm({...form,quantity:Number(e.target.value)})}/>
        <input className="border rounded-xl p-3 text-sm" placeholder="Note interne (facultatif)" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
      </div>
      <p className="text-xs text-slate-500">La commande sera créée « À confirmer ». Aucun stock ne sera retiré avant ta confirmation. Les frais de livraison seront ajoutés ensuite.</p>
      <button disabled={saving} onClick={()=>void create()} className="px-4 py-2.5 rounded-xl bg-[#101828] text-white text-sm font-semibold disabled:opacity-50">{saving?"Enregistrement…":"Enregistrer la commande"}</button>
    </div>}
    <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input className="w-full border rounded-xl py-2.5 pl-9 pr-3 text-sm" placeholder="Rechercher client ou numéro…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <select className="border rounded-xl px-3 py-2 text-sm" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tous les statuts</option>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
    </div>
    {loading ? <div className="p-12 text-center text-slate-500">Chargement des commandes…</div> : filtered.length===0 ? <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-3"/><p className="font-semibold text-slate-700">Aucune commande trouvée</p><p className="text-sm text-slate-500">Les commandes enregistrées apparaîtront ici.</p></div> :
      <div className="space-y-3">{filtered.map(order=><article key={order.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-[#101828]">{order.orderNumber}</h3><span className="text-[11px] rounded-full px-2 py-1 bg-blue-50 text-blue-700">{labels[order.status]}</span><span className="text-[11px] rounded-full px-2 py-1 bg-slate-100 text-slate-600">{order.source==="whatsapp"?"WhatsApp":order.source==="website"?"Site web":"Saisie admin"}</span></div><p className="text-sm text-slate-700 mt-1">{order.customerName} · {order.customerPhone}</p><p className="text-xs text-slate-500">{[order.city,order.address].filter(Boolean).join(" · ")}</p></div><p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString("fr-FR")}</p></div>
        <div className="border-t border-slate-100 pt-3 space-y-1">{order.items.map((it,i)=><div key={i} className="flex justify-between text-sm"><span className="text-slate-600">{it.quantity} × {it.productName}</span><strong className="text-[#101828]">{formatFCFA(it.unitPrice*it.quantity)}</strong></div>)}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-xl p-3"><div className="text-xs text-slate-600">Articles : {formatFCFA(order.subtotal)}<br/>Livraison : {order.deliveryFee===null?"À définir":formatFCFA(order.deliveryFee)}<br/><strong className="text-[#101828]">Total : {order.total===null?"En attente des frais":formatFCFA(order.total)}</strong></div><div className="flex flex-wrap gap-2 items-center">
          {order.status==="pending_confirmation" && <><button onClick={()=>setFeeOrder(feeOrder===order.id?null:order.id)} className="px-3 py-2 rounded-lg border bg-white text-xs font-semibold">Frais livraison</button><button onClick={()=>void setStatus(order,"confirmed")} disabled={saving||order.deliveryFee===null} className="px-3 py-2 rounded-lg bg-[#1769FF] text-white text-xs font-semibold disabled:opacity-40">Confirmer</button></>}
          {order.status!=="cancelled" && order.status!=="delivered" && order.status!=="pending_confirmation" && <select className="border rounded-lg p-2 text-xs" value={order.status} onChange={e=>void setStatus(order,e.target.value as OrderStatus)}>{nextStatuses.filter(s=>s!=="confirmed").map(s=><option key={s} value={s}>{labels[s]}</option>)}</select>}
          {order.status==="delivered" && order.paymentStatus==="unpaid" && <button onClick={()=>void markPaid(order.id)} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold">Paiement reçu</button>}
          <span className="text-xs text-slate-500">{order.paymentStatus==="paid_on_delivery"?"Payée":"Non payée · paiement à la livraison"}</span>
        </div></div>
        {feeOrder===order.id && <div className="flex gap-2"><input type="number" min="0" placeholder="Frais en FCFA" className="border rounded-lg p-2 text-sm" value={deliveryFees[order.id]??""} onChange={e=>setDeliveryFees({...deliveryFees,[order.id]:e.target.value})}/><button onClick={()=>void saveFee(order.id)} disabled={saving||deliveryFees[order.id]==null||deliveryFees[order.id]===""} className="px-3 py-2 rounded-lg bg-[#101828] text-white text-xs">Enregistrer</button></div>}
      </article>)}</div>}
  </section>;
};
