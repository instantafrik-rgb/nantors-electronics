import React, { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw } from "lucide-react";
import type { Product } from "../../types";
import { inventoryService, type InventoryMovement } from "../../services/inventoryService";

export const InventoryPanel: React.FC<{ products: Product[]; onRefresh: () => void }> = ({ products, onRefresh }) => {
  const [productId, setProductId] = useState("");
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setBusy(true); setError("");
    try { setMovements(await inventoryService.listMovements()); setLoaded(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Historique indisponible."); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);

  const submit = async () => {
    const count = Number(quantity);
    if (!productId || !Number.isInteger(count) || count < 1) { setError("Choisissez un produit et une quantité entière positive."); return; }
    setBusy(true); setError("");
    try {
      await inventoryService.adjustStock(productId, direction === "in" ? count : -count, note);
      setQuantity("1"); setNote(""); await load(); onRefresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Mouvement impossible."); }
    finally { setBusy(false); }
  };
  const lowStock = products.filter(p => (p.stockCount ?? 0) <= 3);

  return <section className="space-y-5">
    <header className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-[#1769FF] font-bold">Suivi des quantités</p><h2 className="text-2xl font-bold text-slate-900">Stock & inventaire</h2><p className="text-sm text-slate-500">Les commandes confirmées déduisent automatiquement le stock.</p></div><button onClick={() => void load()} disabled={busy} className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600"><RefreshCw className="h-4 w-4"/></button></header>
    {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Références suivies</p><p className="mt-1 text-2xl font-bold text-slate-900">{products.filter(p => Number.isInteger(p.stockCount)).length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Alertes stock bas</p><p className="mt-1 text-2xl font-bold text-amber-600">{lowStock.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Mouvements enregistrés</p><p className="mt-1 text-2xl font-bold text-slate-900">{movements.length}</p></div></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"><h3 className="font-bold text-slate-900">Enregistrer un mouvement</h3><label className="block text-xs font-semibold text-slate-600">Produit<select value={productId} onChange={e => setProductId(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"><option value="">Sélectionner un produit</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} · {p.stockCount ?? "Stock non renseigné"} unité(s)</option>)}</select></label>
        <div className="grid grid-cols-2 gap-2"><button onClick={() => setDirection("in")} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold ${direction === "in" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600"}`}><ArrowDownToLine className="h-4 w-4"/>Entrée</button><button onClick={() => setDirection("out")} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold ${direction === "out" ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600"}`}><ArrowUpFromLine className="h-4 w-4"/>Sortie</button></div>
        <label className="block text-xs font-semibold text-slate-600">Quantité<input type="number" min="1" step="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
        <label className="block text-xs font-semibold text-slate-600">Motif / note<input value={note} onChange={e => setNote(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Réapprovisionnement, casse, inventaire…"/></label>
        <button disabled={busy} onClick={() => void submit()} className="w-full rounded-xl bg-[#1769FF] p-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Enregistrement…" : "Valider le mouvement"}</button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="mb-3 font-bold text-slate-900">Alertes de stock bas</h3>{lowStock.length ? <div className="space-y-2">{lowStock.map(p => <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-3"><span className="text-sm font-medium text-slate-700">{p.name}</span><strong className="text-sm text-amber-700">{p.stockCount ?? 0} restant(s)</strong></div>)}</div> : <p className="text-sm text-slate-500">Aucune alerte calculée. Les seuils personnalisés seront ajoutés dans les paramètres de stock.</p>}</div>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="mb-3 font-bold text-slate-900">Historique des mouvements</h3>{!loaded && busy ? <p className="text-sm text-slate-500">Chargement…</p> : movements.length ? <div className="space-y-2">{movements.slice(0,30).map(m => {
        const incoming = m.type === "manual_in" || m.type === "order_return";
        const label = m.type === "manual_in" ? "Entrée manuelle" : m.type === "manual_out" ? "Sortie manuelle" : m.type === "order_out" ? "Commande confirmée" : "Retour après annulation";
        return <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-2 last:border-0"><div><p className="text-sm font-medium text-slate-800">{m.productName}</p><p className="text-xs text-slate-500">{label} · {m.note || "Mouvement sans note"} · {new Date(m.createdAt).toLocaleString("fr-FR")}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${incoming ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{incoming ? "+" : "−"}{m.quantity} · {m.newStock ?? "—"} en stock</span></div>;
      })}</div> : <p className="text-sm text-slate-500">Aucun mouvement disponible.</p>}</div>
  </section>;
};
