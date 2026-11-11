import React, { useState } from "react";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import type { CategoryInfo, Product } from "../../types";
import { productService } from "../../services/productService";

type Draft = { name: string; slug: string; description: string; icon: string };
const emptyDraft: Draft = { name: "", slug: "", description: "", icon: "package" };
const toSlug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const CategoriesPanel: React.FC<{
  categories: CategoryInfo[];
  products: Product[];
  onRefresh: () => void;
}> = ({ categories, products, onRefresh }) => {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<CategoryInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const startEdit = (category: CategoryInfo) => {
    setEditing(category);
    setDraft({ name: category.name, slug: category.slug, description: category.description, icon: category.icon });
    setOpen(true);
    setError("");
  };
  const close = () => { setOpen(false); setEditing(null); setDraft(emptyDraft); setError(""); };
  const save = async () => {
    const name = draft.name.trim();
    const slug = toSlug(draft.slug || name);
    if (!name || !slug) { setError("Le nom et l'identifiant de la catégorie sont obligatoires."); return; }
    if (categories.some(c => c.slug === slug && c.id !== editing?.id)) { setError("Cet identifiant est déjà utilisé."); return; }
    setBusy(true); setError("");
    try {
      const payload = { name, slug, description: draft.description.trim(), icon: draft.icon.trim() || "package" };
      if (editing) await productService.updateCategory(editing.id, payload);
      else await productService.createCategory(payload);
      close(); onRefresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Enregistrement impossible."); }
    finally { setBusy(false); }
  };
  const remove = async (category: CategoryInfo) => {
    if (!window.confirm(`Supprimer la catégorie « ${category.name} » ?`)) return;
    setBusy(true); setError("");
    try { await productService.deleteCategory(category.id); onRefresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Suppression impossible."); }
    finally { setBusy(false); }
  };

  return <section className="space-y-5">
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div><p className="text-xs uppercase tracking-widest text-[#1769FF] font-bold">Organisation du catalogue</p><h2 className="text-2xl font-bold text-[#101828]">Catégories</h2><p className="text-sm text-slate-500">Classez les produits et gardez un catalogue facile à parcourir.</p></div>
      <button onClick={() => { setEditing(null); setDraft(emptyDraft); setOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1769FF] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4"/>Ajouter une catégorie</button>
    </header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map(category => {
        const count = products.filter(p => p.category === category.slug).length;
        return <article key={category.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#1769FF]">{category.slug}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{category.name}</h3></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{count} produit{count > 1 ? "s" : ""}</span></div>
          <p className="mt-3 min-h-10 text-sm leading-6 text-slate-500">{category.description || "Aucune description renseignée."}</p>
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3"><button onClick={() => startEdit(category)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"><Edit2 className="h-3.5 w-3.5"/>Modifier</button><button disabled={busy} onClick={() => void remove(category)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5"/>Supprimer</button></div>
        </article>;
      })}
      {categories.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Aucune catégorie. Créez votre première catégorie.</div>}
    </div>
    {open && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="category-form-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between"><h3 id="category-form-title" className="text-lg font-bold text-slate-900">{editing ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3><button onClick={close} aria-label="Fermer"><X className="h-5 w-5 text-slate-500"/></button></div>
        {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600">Nom<input value={draft.name} onChange={e => setDraft(d => ({...d,name:e.target.value,slug:editing ? d.slug : toSlug(e.target.value)}))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Ex. Chargeurs"/></label>
          <label className="block text-xs font-semibold text-slate-600">Identifiant (slug)<input value={draft.slug} onChange={e => setDraft(d => ({...d,slug:toSlug(e.target.value)}))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="chargeurs"/></label>
          <label className="block text-xs font-semibold text-slate-600">Description<textarea value={draft.description} onChange={e => setDraft(d => ({...d,description:e.target.value}))} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Décrivez cette catégorie"/></label>
          <label className="block text-xs font-semibold text-slate-600">Icône (nom symbolique)<input value={draft.icon} onChange={e => setDraft(d => ({...d,icon:e.target.value}))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="package"/></label>
        </div>
        <div className="mt-6 flex justify-end gap-2"><button onClick={close} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Annuler</button><button disabled={busy} onClick={() => void save()} className="rounded-xl bg-[#1769FF] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Enregistrement…" : "Enregistrer"}</button></div>
      </div>
    </div>}
  </section>;
};
