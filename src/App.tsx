/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { HomePage } from "./components/pages/HomePage";
import { CatalogPage } from "./components/pages/CatalogPage";
import { AboutPage } from "./components/pages/AboutPage";
import { ContactPage } from "./components/pages/ContactPage";
const ProductDetailModal = lazy(() =>
  import("./components/catalog/ProductDetailModal").then((m) => ({
    default: m.ProductDetailModal,
  })),
);
import {
  Product,
  CategoryInfo,
  SortOption,
  PriceRangeOption,
  AdminUser,
} from "./types";
import { productService } from "./services/productService";
import { applyShopSettings, getShopSettings } from "./services/settingsService";
import { authService } from "./services/authService";
import { MessageSquare, Loader2 } from "lucide-react";
import { generateWhatsAppInquiryUrl } from "./utils/formatters";

// Code-split administrative & authentication modules to optimize public bundle size
const AdminDashboard = lazy(() =>
  import("./components/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const AuthModal = lazy(() =>
  import("./components/admin/AuthModal").then((m) => ({
    default: m.AuthModal,
  })),
);

const AdminLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
    <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00] mb-3" />
    <span className="text-xs uppercase tracking-widest text-[#777777] font-semibold">
      Chargement de l'administration Nantor's...
    </span>
  </div>
);

export default function App() {
  const [activePage, setActivePage] = useState<
    "home" | "catalog" | "about" | "contact" | "admin"
  >("home");
  const activePageRef = React.useRef(activePage);
  const isProgrammaticScrollRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef<any>(null);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoadError, setDataLoadError] = useState("");

  // Filters state for catalog
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] = useState<PriceRangeOption>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Admin Auth state
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Smooth scroll to public section with sticky header offset
  const scrollToSection = useCallback(
    (id: "home" | "catalog" | "about" | "contact") => {
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = document.getElementById(id);
      if (!el) return;

      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerHeight - 10;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    },
    [],
  );

  // Load products and categories with security-aware permissions
  const loadData = useCallback(async () => {
    try {
      setDataLoadError("");
      try {
        applyShopSettings(await getShopSettings());
      } catch (settingsError) {
        console.warn("Paramètres publics de la boutique indisponibles; configuration locale conservée.", settingsError);
      }
      const isSuperAdmin = authService.isCurrentFirebaseUserSuperAdmin();
      const [loadedCats, loadedProds] = await Promise.all([
        productService.getCategories(),
        productService.getProducts({}, isSuperAdmin),
      ]);
      setCategories(loadedCats);
      setProducts(loadedProds);
    } catch (err) {
      console.error("Erreur chargement données:", err);
      setDataLoadError("Le catalogue ne peut pas être chargé depuis la source configurée. Vérifiez la connexion Firebase et les règles Firestore. Aucune commande ne sera enregistrée localement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    loadData();

    const shouldInitAuth = window.location.hash.includes("admin");
    const subscribeToAuth = () => {
      if (cancelled) return;
      unsubscribe = authService.subscribe((user) => {
        const isSuperAdmin = authService.isCurrentFirebaseUserSuperAdmin();
        setCurrentUser(user);
        if (!isSuperAdmin) setActivePage((prev) => (prev === "admin" ? "home" : prev));
        loadData();
      });
    };

    if (shouldInitAuth) {
      void authService.initSessionCheck().then(subscribeToAuth).catch((error) => {
        console.error("Initialisation Firebase Auth impossible:", error);
      });
    } else {
      unsubscribe = authService.subscribe((user) => setCurrentUser(user));
    }

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [loadData]);

  // Synchronize navigation state with browser history (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#\/?/, "").trim();
      const validPages = [
        "home",
        "catalog",
        "about",
        "contact",
        "admin",
      ] as const;
      const targetPage = validPages.includes(hash as any)
        ? (hash as (typeof validPages)[number])
        : "home";

      if (targetPage === "admin") {
        const isSuperAdmin = authService.isCurrentFirebaseUserSuperAdmin();
        if (!isSuperAdmin) {
          setAuthModalOpen(true);
          setActivePage("home");
          return;
        }
        setActivePage("admin");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Close modal if open on back/forward navigation
      setSelectedProduct(null);
      setActivePage(targetPage);
      scrollToSection(targetPage);
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);

    // Initial check from URL hash on load
    const initialHash = window.location.hash.replace(/^#\/?/, "").trim();
    if (
      ["home", "catalog", "about", "contact", "admin"].includes(initialHash)
    ) {
      if (initialHash === "admin") {
        const isSuperAdmin = authService.isCurrentFirebaseUserSuperAdmin();
        if (isSuperAdmin) {
          setActivePage("admin");
        }
      } else {
        setActivePage(initialHash as any);
        setTimeout(() => {
          scrollToSection(initialHash as any);
        }, 150);
      }
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, [scrollToSection]);

  // Scrollspy: automatically update active cursor as user scrolls through sections
  useEffect(() => {
    const sectionIds: ("home" | "catalog" | "about" | "contact")[] = [
      "home",
      "catalog",
      "about",
      "contact",
    ];

    const checkScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      if (activePageRef.current === "admin") return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Reached near bottom of page -> highlight contact
      if (windowHeight + scrollY >= documentHeight - 70) {
        if (activePageRef.current !== "contact") {
          setActivePage("contact");
          try {
            window.history.replaceState({ page: "contact" }, "", "#contact");
          } catch {
            // ignore
          }
        }
        return;
      }

      // Near top of page -> highlight home
      if (scrollY < 120) {
        if (activePageRef.current !== "home") {
          setActivePage("home");
          try {
            window.history.replaceState(
              { page: "home" },
              "",
              window.location.pathname,
            );
          } catch {
            // ignore
          }
        }
        return;
      }

      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 100;
      // Focal line: section is active when its top is within or above this point
      const focalPoint = headerHeight + 110;

      let detectedSection: "home" | "catalog" | "about" | "contact" = "home";

      // Evaluate sections from bottom to top using viewport-relative bounding rect
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= focalPoint) {
            detectedSection = id;
            break;
          }
        }
      }

      if (detectedSection !== activePageRef.current) {
        setActivePage(detectedSection);
        const hash =
          detectedSection === "home"
            ? window.location.pathname
            : `#${detectedSection}`;
        try {
          window.history.replaceState({ page: detectedSection }, "", hash);
        } catch {
          // ignore
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // User interaction immediately resumes real-time scrollspy if smooth scrolling was triggered
    const handleUserInterrupt = () => {
      isProgrammaticScrollRef.current = false;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", handleUserInterrupt, { passive: true });
    window.addEventListener("touchmove", handleUserInterrupt, {
      passive: true,
    });

    // Initial check on mount
    checkScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", handleUserInterrupt);
      window.removeEventListener("touchmove", handleUserInterrupt);
    };
  }, []);

  // Navigation handler with strict authorization barrier and browser history sync
  const handleNavigate = useCallback(
    (
      page: "home" | "catalog" | "about" | "contact" | "admin",
      pushHistory = true,
    ) => {
      if (page === "admin") {
        const isSuperAdmin = authService.isCurrentFirebaseUserSuperAdmin();
        if (!isSuperAdmin) {
          setAuthModalOpen(true);
          return;
        }
        setSelectedProduct(null);
        setActivePage("admin");
        if (pushHistory) {
          window.history.pushState({ page: "admin" }, "", "#admin");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Public navigation
      setSelectedProduct(null);
      const wasAdmin = activePageRef.current === "admin";
      setActivePage(page);

      if (pushHistory) {
        const targetHash =
          page === "home" ? window.location.pathname : `#${page}`;
        const currentCleanHash = window.location.hash.replace(/^#\/?/, "");
        const cleanTarget = page === "home" ? "" : page;

        if (currentCleanHash !== cleanTarget) {
          window.history.pushState({ page }, "", targetHash);
        }
      }

      isProgrammaticScrollRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      if (wasAdmin) {
        setTimeout(() => {
          scrollToSection(page);
        }, 60);
      } else {
        scrollToSection(page);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 850);
    },
    [scrollToSection],
  );

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("featured");
    setPriceRange("all");
    setInStockOnly(false);
  };

  // Pre-filtered list of available products
  const allAvailableProducts = useMemo(() => {
    return products.filter((p) => p.isAvailable);
  }, [products]);

  // Filtered products for public storefront
  const publicFilteredProducts = useMemo(() => {
    return allAvailableProducts
      .filter((p) => {
        // Category filter
        if (selectedCategory !== "all" && p.category !== selectedCategory)
          return false;

        // Stock filter
        if (inStockOnly && (!Number.isSafeInteger(p.stockCount) || (p.stockCount ?? 0) <= 0))
          return false;

        // 3. Budget filters: moins de 15 000 FCFA, 15 000 à 30 000 FCFA, plus de 30 000 FCFA
        if (priceRange === "under-15k" && p.price >= 15000) return false;
        if (priceRange === "15k-30k" && (p.price < 15000 || p.price > 30000))
          return false;
        if (priceRange === "over-30k" && p.price <= 30000) return false;

        // Search filter (name, short description, category, features, specifications)
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase().trim();
          return (
            p.name.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.features.some((f) => f.toLowerCase().includes(q)) ||
            (p.specifications &&
              Object.values(p.specifications).some((val) =>
                val.toLowerCase().includes(q),
              ))
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "featured":
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
          case "newest":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "name-asc":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  }, [
    allAvailableProducts,
    selectedCategory,
    inStockOnly,
    priceRange,
    searchQuery,
    sortBy,
  ]);

  // Featured products for home
  const featuredProducts = products.filter((p) => p.featured && p.isAvailable);

  const isSuperAdmin = authService.isCurrentFirebaseUserSuperAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-[#afbdc5] text-slate-900 selection:bg-[#1769FF] selection:text-white">
      {/* Universal Top Header */}
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={async () => {
          // Init Firebase Auth seulement au clic
          await authService.initSessionCheck();
          setAuthModalOpen(true);
        }}
        onSelectCategory={(slug: string) => {
          setSelectedCategory(slug);
          handleNavigate("catalog");
        }}
      />

      {dataLoadError && <div role="alert" className="mx-auto mt-3 w-[min(1200px,calc(100%-2rem))] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{dataLoadError}</div>}

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === "admin" && isSuperAdmin && currentUser ? (
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminDashboard
              products={products}
              categories={categories}
              currentUser={currentUser}
              onRefreshData={loadData}
              onOpenProductDetails={(p) => setSelectedProduct(p)}
              onExitAdmin={() => handleNavigate("home")}
            />
          </Suspense>
        ) : (
          <div className="flex flex-col">
            <section id="home" className="scroll-mt-28 md:scroll-mt-32">
              <HomePage
                products={products}
                featuredProducts={
                  featuredProducts.length > 0
                    ? featuredProducts
                    : products.slice(0, 6)
                }
                categories={categories}
                onOpenDetails={(p) => setSelectedProduct(p)}
                onNavigate={handleNavigate}
                onSelectCategory={(slug) => {
                  setSelectedCategory(slug);
                  handleNavigate("catalog");
                }}
              />
            </section>

            <section
              id="catalog"
              className="scroll-mt-28 md:scroll-mt-32 border-t border-[#222222]"
            >
              <CatalogPage
                products={publicFilteredProducts}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(slug) => setSelectedCategory(slug)}
                searchQuery={searchQuery}
                onSearchChange={(q) => setSearchQuery(q)}
                sortBy={sortBy}
                onSortChange={(s) => setSortBy(s)}
                priceRange={priceRange}
                onPriceRangeChange={(r) => setPriceRange(r)}
                inStockOnly={inStockOnly}
                onToggleInStock={(v) => setInStockOnly(v)}
                onOpenDetails={(p) => setSelectedProduct(p)}
                onResetFilters={handleResetFilters}
                allAvailableProducts={allAvailableProducts}
              />
            </section>

            <section
              id="about"
              className="scroll-mt-28 md:scroll-mt-32 border-t border-[#222222]"
            >
              <AboutPage onExploreCatalog={() => handleNavigate("catalog")} />
            </section>

            <section
              id="contact"
              className="scroll-mt-28 md:scroll-mt-32 border-t border-[#222222]"
            >
              <ContactPage />
            </section>
          </div>
        )}
      </main>

      {/* Global Footer (shown on public pages) */}
      {activePage !== "admin" && (
        <Footer
          onNavigate={handleNavigate}
          onSelectCategory={(slug) => {
            setSelectedCategory(slug);
            handleNavigate("catalog");
          }}
        />
      )}

      {/* Product Detail Modal */}
      <Suspense fallback={null}>
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectCategory={(slug: string) => {
            setSelectedCategory(slug);
            setSelectedProduct(null);
            handleNavigate("catalog");
          }}
        />
      </Suspense>

      {/* Admin Authentication Modal */}
      <Suspense fallback={null}>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            handleNavigate("admin");
          }}
        />
      </Suspense>

      {/* Floating WhatsApp Quick Action Button */}
      {activePage !== "admin" && (
        <aside
          aria-label="Action rapide WhatsApp"
          className="fixed bottom-6 right-6 z-30"
        >
          <a
            href={generateWhatsAppInquiryUrl()}
            target={
              generateWhatsAppInquiryUrl().startsWith("#")
                ? undefined
                : "_blank"
            }
            rel={
              generateWhatsAppInquiryUrl().startsWith("#")
                ? undefined
                : "noopener noreferrer"
            }
            className="w-13 h-13 rounded-full bg-[#FF6B00] hover:bg-[#e05f00] text-[#111111] flex items-center justify-center shadow-[0_4px_25px_rgba(255,107,0,0.45)] hover:shadow-[0_6px_30px_rgba(255,107,0,0.6)] hover:scale-108 active:scale-95 transition-all duration-300 ring-4 ring-[#111111]"
            title="Assistance directe WhatsApp Nantor's"
            aria-label="Assistance directe WhatsApp Nantor's"
          >
            <MessageSquare className="w-6 h-6 fill-[#111111] stroke-none" />
          </a>
        </aside>
      )}
    </div>
  );
}
