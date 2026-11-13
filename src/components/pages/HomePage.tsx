/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Sparkles, Headphones, Zap, Truck, CreditCard, MessageCircle, ShoppingBag } from "lucide-react";
import { CategoryInfo, Product } from "../../types";
import { formatFCFA, generateWhatsAppInquiryUrl } from "../../utils/formatters";

interface HomePageProps {
  products: Product[];
  featuredProducts: Product[];
  categories: CategoryInfo[];
  onOpenDetails: (product: Product) => void;
  onNavigate: (page: "home" | "catalog" | "about" | "contact" | "admin") => void;
  onSelectCategory: (categorySlug: string) => void;
}

const categoryFallbacks = [
  { name: "Audio & écouteurs", description: "Le son qui vous accompagne partout", slug: "audio-ecouteurs" },
  { name: "Chargeurs & énergie", description: "Rechargez vos appareils simplement", slug: "chargeurs" },
  { name: "Accessoires mobile", description: "Les essentiels de votre smartphone", slug: "accessoires-telephonie" },
  { name: "Informatique & connectique", description: "Des connexions plus simples au quotidien", slug: "accessoires-informatique" },
];

export const HomePage: React.FC<HomePageProps> = ({
  products, featuredProducts, categories, onOpenDetails, onNavigate, onSelectCategory,
}) => {
  const [activeTab, setActiveTab] = useState<"bestsellers" | "new">("bestsellers");
  const availableProducts = useMemo(() => products.filter((product) => product.isAvailable), [products]);
  const bestsellers = (featuredProducts.length ? featuredProducts : availableProducts).slice(0, 4);
  const newest = [...availableProducts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const visibleProducts = activeTab === "bestsellers" ? bestsellers : newest;
  const spotlight = bestsellers[0] || availableProducts[0] || null;
  const displayCategories = categories.length ? categories.slice(0, 4) : categoryFallbacks.map((item) => ({ ...item, id: item.slug, icon: "" }));
  const whatsappUrl = generateWhatsAppInquiryUrl("Bonjour, je souhaite découvrir vos accessoires high-tech.");
  const categoryTiles = displayCategories.map((category) => {
    const categoryProducts = availableProducts.filter((product) => product.category === category.slug);
    const preview = categoryProducts[0] || products.find((product) => product.category === category.slug);
    return { category, count: categoryProducts.length, image: preview?.images?.[0] };
  });

  return (
    <main className="nantor-home">
      <div className="nantor-home-shell">
        <section className="nantor-home-hero" aria-label="Bienvenue chez Nantor's Electronics">
          <div className="nantor-home-hero-copy">
            <span className="nantor-section-kicker"><span className="nantor-kicker-dot" /> Nantor's Electronics · Lomé</span>
            <h1>La technologie<br />qui vous <span>ressemble.</span></h1>
            <p>Les accessoires qui font la différence au quotidien. Découvrez une sélection pensée pour vos appareils, votre travail et vos envies.</p>
            <div className="nantor-home-hero-actions">
              <button type="button" onClick={() => onNavigate("catalog")}>Explorer la boutique <ArrowRight size={17}/></button>
              <a href={whatsappUrl} target={whatsappUrl.startsWith("#") ? undefined : "_blank"} rel="noopener noreferrer"><MessageCircle size={16}/> Un conseil ? Écrivez-nous</a>
            </div>
            <div className="nantor-home-hero-benefits">
              <span><Truck size={16}/> Livraison à Lomé</span>
              <span><CreditCard size={16}/> Paiement à la livraison</span>
            </div>
          </div>
          <div className="nantor-home-hero-visual">
            <div className="nantor-hero-visual-glow" aria-hidden="true"/>
            <span className="nantor-hero-visual-label">LA SÉLECTION NANTOR'S</span>
            {spotlight?.images?.[0] ? (
              <button type="button" className="nantor-home-hero-product" onClick={() => onOpenDetails(spotlight)} aria-label={`Découvrir ${spotlight.name}`}>
                <img src={spotlight.images[0]} alt={spotlight.name} fetchPriority="high"/>
              </button>
            ) : (
              <div className="nantor-home-hero-placeholder"><ShoppingBag size={76} strokeWidth={1}/></div>
            )}
            {spotlight && <button type="button" className="nantor-hero-product-chip" onClick={() => onOpenDetails(spotlight)}>
              <span><small>À DÉCOUVRIR</small><strong>{spotlight.name}</strong></span>
              <b>{formatFCFA(spotlight.price)}</b><ArrowUpRight size={17}/>
            </button>}
            <span className="nantor-hero-vertical-note">TECH THAT MOVES YOU</span>
          </div>
        </section>

        <section className="nantor-category-panel" aria-labelledby="category-heading">
          <div className="nantor-section-heading">
            <div>
              <span className="nantor-section-kicker">L'univers Nantor's</span>
              <h2 id="category-heading">Explorez par <span>catégorie.</span></h2>
              <p>Trouvez rapidement les accessoires adaptés à vos appareils.</p>
            </div>
            <button className="nantor-text-link" onClick={() => onNavigate("catalog")}>Tout explorer <ArrowUpRight size={16}/></button>
          </div>
          <div className="nantor-category-grid">
            {categoryTiles.map(({ category, count, image }, index) => (
              <button type="button" key={category.id} onClick={() => onSelectCategory(category.slug)} className={`nantor-category-tile nantor-category-tile-${index + 1}`}>
                <div className="nantor-category-copy">
                  <span className="nantor-category-count">{count ? `${count} article${count > 1 ? "s" : ""}` : "À découvrir"}</span>
                  <h3>{category.name}</h3><p>{category.description}</p>
                  <span className="nantor-category-link">Explorer la catégorie <ArrowRight size={15}/></span>
                </div>
                {image ? <img src={image} alt="" loading="lazy" className="nantor-category-image"/> : <div className="nantor-category-placeholder"><Headphones size={70} strokeWidth={1}/></div>}
              </button>
            ))}
          </div>
        </section>

        <section className="nantor-bestsellers-panel" aria-labelledby="bestsellers-heading">
          <div className="nantor-products-heading">
            <div><span className="nantor-section-kicker"><Sparkles size={14}/> La sélection du moment</span><h2 id="bestsellers-heading">{activeTab === "bestsellers" ? "Les produits à découvrir" : "Les nouveautés"}</h2></div>
            <div className="nantor-products-actions">
              <div className="nantor-tabs" role="tablist" aria-label="Sélection de produits">
                <button role="tab" aria-selected={activeTab === "bestsellers"} className={activeTab === "bestsellers" ? "active" : ""} onClick={() => setActiveTab("bestsellers")}>Populaires</button>
                <button role="tab" aria-selected={activeTab === "new"} className={activeTab === "new" ? "active" : ""} onClick={() => setActiveTab("new")}>Nouveautés</button>
              </div>
              <button className="nantor-text-link" onClick={() => onNavigate("catalog")}>Voir tout <ArrowRight size={15}/></button>
            </div>
          </div>
          {visibleProducts.length ? <div className="nantor-product-grid">
            {visibleProducts.map((product) => <button type="button" key={product.id} className="nantor-product-tile" onClick={() => onOpenDetails(product)}>
              <div className="nantor-product-image-wrap">
                {product.images?.[0] ? <img src={product.images[0]} alt={product.name} loading="lazy"/> : <div className="nantor-category-placeholder"><Zap size={44}/></div>}
                <span className="nantor-product-category">{product.categoryLabel || product.category}</span>
                {product.badge && <span className="nantor-product-badge">{product.badge}</span>}
                <span className="nantor-product-open"><ArrowUpRight size={17}/></span>
              </div>
              <div className="nantor-product-meta"><span className="nantor-product-name">{product.name}</span><span className="nantor-product-price">{formatFCFA(product.price)}</span></div>
              <span className="nantor-product-description">{product.shortDescription}</span>
            </button>)}
          </div> : <div className="nantor-empty-products"><p>Les prochains arrivages se préparent.</p><a href={whatsappUrl} target={whatsappUrl.startsWith("#") ? undefined : "_blank"} rel="noopener noreferrer">Demander une disponibilité <ArrowRight size={14}/></a></div>}
        </section>

        <section className="nantor-service-strip">
          <div><Truck size={18}/><span>Livraison à Lomé</span></div>
          <div><CreditCard size={18}/><span>Paiement à la livraison</span></div>
          <div><MessageCircle size={18}/><span>Conseil sur WhatsApp</span></div>
        </section>
      </div>
    </main>
  );
};
