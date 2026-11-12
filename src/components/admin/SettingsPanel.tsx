import React, { useEffect, useState } from "react";
import { CheckCircle2, Image as ImageIcon, Save, Store, Truck, Palette } from "lucide-react";
import {
  applyShopSettings, getShopSettings, saveShopSettings,
  type ShopSettings,
} from "../../services/settingsService";

interface SettingsPanelProps { onSaved: () => void; }

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onSaved }) => {
  const [form, setForm] = useState<ShopSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getShopSettings().then(setForm)
      .catch(e => setError(e instanceof Error ? e.message : "Impossible de charger les paramètres."))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof ShopSettings>(key: K, value: ShopSettings[K]) => {
    setForm(current => current ? { ...current, [key]: value } : current);
  };

  const save = async () => {
    if (!form) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      await saveShopSettings(form);
      applyShopSettings(form);
      setSuccess("Paramètres de la boutique enregistrés.");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally { setBusy(false); }
  };

  if (loading) return <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">Chargement des paramètres…</div>;
  if (!form) return <div role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error || "Paramètres indisponibles."}</div>;

  const field = (label: string, key: keyof ShopSettings, placeholder = "", type = "text") => (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <input type={type} value={String(form[key] ?? "")} placeholder={placeholder}
        onChange={e => update(key, (key === "stockAlertThreshold" ? Number(e.target.value) : e.target.value) as ShopSettings[typeof key])}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1769FF] focus:ring-2 focus:ring-[#1769FF]/10"/>
    </label>
  );

  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-[#1769FF]">Configuration propriétaire</p><h2 className="text-2xl font-bold text-slate-900">Paramètres de la boutique</h2><p className="text-sm text-slate-500">Identité, coordonnées, livraison, seuil de stock et apparence.</p></header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {success && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/>{success}</div>}

    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <h3 className="flex items-center gap-2 font-bold text-slate-900"><Store className="h-4 w-4 text-[#1769FF]"/> Identité de la boutique</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {field("Nom de la boutique","name","Nantor's Electronics")}
        {field("Signature / slogan","tagline","La technologie au quotidien")}
        <div className="sm:col-span-2">{field("URL du logo (HTTPS ou chemin local)","logoUrl","https://…")}</div>
        {form.logoUrl && <div className="sm:col-span-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3"><img src={form.logoUrl} alt="Aperçu du logo" className="h-12 w-12 rounded-lg bg-white object-contain p-1"/><span className="text-xs text-slate-500">Aperçu du logo utilisé dans l'en-tête.</span></div>}
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <h3 className="flex items-center gap-2 font-bold text-slate-900"><ImageIcon className="h-4 w-4 text-[#1769FF]"/> Coordonnées et contact</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {field("WhatsApp avec indicatif pays","whatsappNumber","Ex. 2289XXXXXXXX")}
        {field("Téléphone affiché","phoneFormatted","+228 …")}
        {field("Adresse e-mail","email","contact@…","email")}
        {field("Ville / zone de livraison","location","Lomé, Togo")}
        <div className="sm:col-span-2">{field("Adresse du showroom / retrait","showroomAddress","Quartier, rue, repère")}</div>
        <div className="sm:col-span-2">{field("Horaires","workingHours","Lun - Sam : 08h30 - 19h00")}</div>
      </div>
      {!form.whatsappNumber && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Le numéro WhatsApp n'est pas encore configuré : les boutons WhatsApp et le parcours de commande resteront indisponibles tant qu'il n'est pas renseigné.</p>}
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <h3 className="flex items-center gap-2 font-bold text-slate-900"><Truck className="h-4 w-4 text-[#1769FF]"/> Livraison et paiement</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Devise</p><strong className="text-sm text-slate-900">XOF / FCFA</strong></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Mode de paiement</p><strong className="text-sm text-slate-900">Paiement à la livraison uniquement</strong></div>
      </div>
      <p className="text-xs leading-5 text-slate-500">Les frais de livraison sont saisis manuellement sur chaque commande avant confirmation. Le total reste vide tant que ces frais ne sont pas renseignés. Le paiement n'est enregistré qu'après livraison.</p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <h3 className="flex items-center gap-2 font-bold text-slate-900"><Palette className="h-4 w-4 text-[#1769FF]"/> Stock et apparence</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("Seuil global d'alerte de stock","stockAlertThreshold","3","number")}
        <div className="space-y-2"><span className="text-xs font-semibold text-slate-600">Thème de la boutique</span><div className="flex gap-2">
          <button type="button" onClick={() => update("theme","light")} className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold ${form.theme === "light" ? "border-[#1769FF] bg-blue-50 text-[#1769FF]" : "border-slate-200 text-slate-600"}`}>Clair</button>
          <button type="button" onClick={() => update("theme","dark")} className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold ${form.theme === "dark" ? "border-[#1769FF] bg-slate-900 text-white" : "border-slate-200 text-slate-600"}`}>Sombre</button>
        </div></div>
      </div>
      <p className="text-xs text-slate-500">Un seuil spécifique défini sur un produit reste prioritaire; sinon le seuil global s'applique.</p>
    </div>

    <div className="flex justify-end"><button disabled={busy} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-xl bg-[#1769FF] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0f56d9] disabled:opacity-50"><Save className="h-4 w-4"/>{busy ? "Enregistrement…" : "Enregistrer les paramètres"}</button></div>
  </section>;
};
