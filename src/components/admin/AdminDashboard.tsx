/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  Settings,
  LogOut,
} from 'lucide-react';
import { CategoryInfo, Product, AdminUser } from '../../types';
import { ProductFormModal } from './ProductFormModal';
import { SystemConfigModal } from './SystemConfigModal';
import { formatFCFA } from '../../utils/formatters';
import { productService } from '../../services/productService';
import { authService } from '../../services/authService';
import { OrdersPanel } from './OrdersPanel';
import { CategoriesPanel } from './CategoriesPanel';
import { InventoryPanel } from './InventoryPanel';
import { CustomersPanel } from './CustomersPanel';
import { AnalyticsPanel } from './AnalyticsPanel';
import { OverviewPanel } from './OverviewPanel';

interface AdminDashboardProps {
  products: Product[];
  categories: CategoryInfo[];
  currentUser: AdminUser;
  onRefreshData: () => void;
  onOpenProductDetails: (product: Product) => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  currentUser,
  onRefreshData,
  onOpenProductDetails,
  onExitAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'categories' | 'inventory' | 'customers' | 'analytics'>('overview');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Metrics calculation
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.isAvailable).length;
  const featuredCount = products.filter((p) => p.featured).length;
  const avgPrice = totalProducts > 0
    ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / totalProducts)
    : 0;

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleToggleAvailability = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newState = await productService.toggleProductAvailability(id);
      showNotify(`Disponibilité mise à jour : ${newState ? 'En stock' : 'Rupture'}`);
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleFeatured = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newState = await productService.toggleProductFeatured(id);
      showNotify(`Mise en vedette : ${newState ? 'Actif sur l\'accueil' : 'Retiré de l\'accueil'}`);
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteCandidate) return;
    try {
      await productService.deleteProduct(deleteCandidate.id);
      showNotify(`Produit "${deleteCandidate.name}" supprimé avec succès.`);
      setDeleteCandidate(null);
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (productToEdit) {
        await productService.updateProduct(productToEdit.id, productData);
        showNotify(`Produit "${productData.name}" mis à jour.`);
      } else {
        await productService.createProduct(productData as any);
        showNotify(`Nouveau produit "${productData.name}" ajouté au catalogue.`);
      }
      setFormModalOpen(false);
      setProductToEdit(null);
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    onExitAdmin();
  };

  return (
    <div className="py-8 md:py-12 bg-[#F5F7FA] min-h-screen text-[#101828]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Navigation & User Strip */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EFF4FF] border border-[#1769FF]/20 flex items-center justify-center text-[#1769FF] font-bold text-lg">
              {currentUser.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1769FF]">Nantor’s Electronics · Espace propriétaire</p>
                  <h1 className="font-display text-lg sm:text-xl font-bold text-[#101828]">Centre de pilotage</h1>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1769FF]/10 text-[#1769FF] border border-[#1769FF]/20">
                  Admin Autorisé
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {currentUser.email} · {productService.getDataSource() === 'firebase' ? 'Firestore sélectionné' : 'Mode local · non synchronisé'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setConfigModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F8FAFC] hover:bg-slate-100 hover:text-[#101828] rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#1769FF]" />
              <span>Statut Système & Clés</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-xl border border-red-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>

            <button
              onClick={onExitAdmin}
              className="px-4 py-2 text-xs font-bold text-white bg-[#1769FF] hover:bg-[#1258DA] rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Retour à la boutique
            </button>
          </div>
        </div>

        {/* Global Notification Toast */}
        {notification && (
          <div className="p-3.5 rounded-2xl bg-white text-[#101828] border border-[#1769FF]/30 text-xs font-medium flex items-center justify-between shadow-2xl animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1769FF]" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-[#101828] cursor-pointer">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {productService.getDataSource() === 'local' && (
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong className="block font-semibold">Mode local actif — données non synchronisées</strong>
            <span className="mt-1 block text-amber-800">Les changements effectués ici restent dans ce navigateur et ne seront pas visibles sur vos autres appareils. Configurez Firebase puis sélectionnez Firestore dans « Statut Système & Clés » avant toute gestion réelle des commandes et du stock.</span>
          </div>
        )}

        <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Navigation administration">
          <button onClick={() => setActiveTab('overview')} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'bg-[#1769FF] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Vue d'ensemble</button>
          <button onClick={() => setActiveTab('products')} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'products' ? 'bg-[#1769FF] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Produits</button>
          <button onClick={() => setActiveTab('orders')} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'orders' ? 'bg-[#1769FF] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Commandes</button>
          <button onClick={() => setActiveTab('categories')} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'categories' ? 'bg-[#1769FF] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Catégories</button>
          <button onClick={() => setActiveTab('inventory')} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'inventory' ? 'bg-[#1769FF] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Stock</button>
          <button onClick={() => setActiveTab('customers')} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'customers' ? 'bg-[#1769FF] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Clients</button>
          <button onClick={() => setActiveTab('analytics')} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'analytics' ? 'bg-[#1769FF] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Statistiques</button>
        </nav>

        {activeTab === 'orders' ? (
          <OrdersPanel products={products} onRefreshProducts={onRefreshData} />
        ) : activeTab === 'categories' ? (
          <CategoriesPanel categories={categories} products={products} onRefresh={onRefreshData} />
        ) : activeTab === 'inventory' ? (
          <InventoryPanel products={products} onRefresh={onRefreshData} />
        ) : activeTab === 'customers' ? (
          <CustomersPanel />
        ) : activeTab === 'analytics' ? (
          <AnalyticsPanel products={products} />
        ) : activeTab === 'overview' ? (
          <OverviewPanel products={products} />
        ) : (
          <>
        {/* 4 Stats Cards in CASE editorial style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Références</span>
            <div className="font-display text-2xl font-bold text-[#101828]">
              {totalProducts} <span className="text-xs font-normal text-slate-500">articles</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Disponibles en Stock</span>
            <div className="font-display text-2xl font-bold text-[#1769FF]">
              {inStockCount} <span className="text-xs font-normal text-slate-500">prêts à livrer</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Sélection Vedette</span>
            <div className="font-display text-2xl font-bold text-[#1769FF]">
              {featuredCount} <span className="text-xs font-normal text-slate-500">sur l'accueil</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Prix Moyen Catalogue</span>
            <div className="font-mono text-xl font-bold text-[#101828] tabular-nums">
              {formatFCFA(avgPrice)}
            </div>
          </div>
        </div>

        {/* Products Management Table & Actions */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          {/* Action & Filter Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par nom ou catégorie..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] text-[#101828] rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF6B00] placeholder:text-slate-500"
                />
              </div>

              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="text-xs px-3 py-2 bg-[#F8FAFC] text-[#101828] rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF6B00] cursor-pointer"
              >
                <option value="all">Toutes catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug} className="bg-[#F8FAFC]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setProductToEdit(null);
                setFormModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#1769FF] hover:bg-[#1258DA] text-white text-xs font-bold rounded-xl shadow-[0_8px_24px_rgba(23,105,255,0.18)] transition-all flex items-center justify-center gap-1.5 active:scale-98 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nouveau Produit</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Produit</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Prix FCFA</th>
                  <th className="py-3 px-4 text-center">En Stock</th>
                  <th className="py-3 px-4 text-center">Vedette</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => {
                  const thumb = p.images && p.images[0]
                    ? p.images[0]
                    : '/images/product_gan_charger_1793629796501.jpg';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#F8FAFC]/80 transition-colors cursor-pointer group"
                      onClick={() => onOpenProductDetails(p)}
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#F5F7FA] overflow-hidden shrink-0 border border-slate-200">
                            <img
                              src={thumb}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="max-w-xs">
                            <h4 className="font-display font-semibold text-[#101828] group-hover:text-[#1769FF] transition-colors truncate">
                              {p.name}
                            </h4>
                            <span className="text-[11px] text-slate-500 font-mono">
                              #{p.id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {p.categoryLabel || p.category}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-mono font-bold text-[#101828] tabular-nums whitespace-nowrap">
                        {formatFCFA(p.price)}
                      </td>

                      {/* Stock Toggle Switch */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleToggleAvailability(p.id, e)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-[11px] transition-colors cursor-pointer ${
                            p.isAvailable
                              ? 'bg-[#1769FF]/10 text-[#1769FF] border border-[#1769FF]/20 hover:bg-[#1769FF]/20'
                              : 'bg-white/5 text-slate-500 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p.isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#1769FF]" />
                              <span>En Stock</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>Rupture</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Featured Toggle Star */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleToggleFeatured(p.id, e)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            p.featured
                              ? 'text-[#1769FF] bg-[#1769FF]/10 border border-[#1769FF]/20'
                              : 'text-slate-400 hover:text-[#999999]'
                          }`}
                          title={p.featured ? 'Retirer de la sélection vedette' : 'Mettre en vedette'}
                        >
                          <Star className={`w-4 h-4 ${p.featured ? 'fill-[#FF6B00]' : ''}`} />
                        </button>
                      </td>

                      {/* Actions Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onOpenProductDetails(p)}
                            className="p-1.5 text-slate-600 hover:text-[#101828] hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Aperçu fiche"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProductToEdit(p);
                              setFormModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-[#1769FF] hover:bg-[#1769FF]/10 rounded-lg cursor-pointer"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(p)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                Aucun produit ne correspond à votre filtre.
              </div>
            )}
          </div>
        </div>

          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 text-[#101828]">
              <h3 className="font-display font-bold text-base text-[#101828]">
                Confirmer la suppression
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le produit <strong className="text-white">{deleteCandidate.name}</strong> ?
              </p>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-white hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Add / Edit Modal */}
        <ProductFormModal
          isOpen={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setProductToEdit(null);
          }}
          onSave={handleSaveProduct}
          productToEdit={productToEdit}
          categories={categories}
        />

        {/* System Configuration & Cloud Status Modal */}
        <SystemConfigModal
          isOpen={configModalOpen}
          onClose={() => setConfigModalOpen(false)}
          onDataReset={onRefreshData}
        />
      </div>
    </div>
  );
};
