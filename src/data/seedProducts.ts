/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CategoryInfo, Product } from "../types";

export const INITIAL_CATEGORIES: CategoryInfo[] = [
  {
    id: "cat-chargeurs",
    slug: "chargeurs",
    name: "Chargeurs & Stations",
    description:
      "Blocs rapides GaN, chargeurs multi-ports et stations à induction sans fil.",
    icon: "Zap",
  },
  {
    id: "cat-cables",
    slug: "cables",
    name: "Câbles Ultra-Durables",
    description:
      "Câbles tressés nylon blindés, Type-C 100W, Lightning et transmission ultra-rapide.",
    icon: "Cable",
  },
  {
    id: "cat-accessoires-telephonie",
    slug: "accessoires-telephonie",
    name: "Accessoires Téléphoniques",
    description:
      "Supports MagSafe, coques blindées, verres trempés et supports voiture magnétiques.",
    icon: "Smartphone",
  },
  {
    id: "cat-accessoires-informatique",
    slug: "accessoires-informatique",
    name: "Accessoires Informatiques",
    description:
      "Hubs USB-C aluminium, adaptateurs multi-écrans, claviers et souris ergonomiques.",
    icon: "Laptop",
  },
  {
    id: "cat-audio-ecouteurs",
    slug: "audio-ecouteurs",
    name: "Audio & Écouteurs",
    description:
      "Casques à réduction de bruit active (ANC), écouteurs sans fil TWS et enceintes.",
    icon: "Headphones",
  },
  {
    id: "cat-energie",
    slug: "energie-batteries",
    name: "Batteries Externes",
    description:
      "Powerbanks haute capacité avec affichage numérique LED et charge rapide bidirectionnelle.",
    icon: "BatteryCharging",
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-gan-65w",
    name: "Chargeur GaN Ultra-Compact 65W Multi-Port",
    slug: "chargeur-gan-ultra-compact-65w",
    category: "chargeurs",
    categoryLabel: "Chargeurs & Stations",
    price: 24500,
    originalPrice: 29000,
    shortDescription:
      "Chargeur mural nouvelle génération au Nitrure de Gallium (GaN) délivrant 65W sur 3 ports simultanés.",
    description:
      "Conçu avec les dernières technologies de semi-conducteurs au Nitrure de Gallium (GaN III), ce chargeur ultra-compact remplace avantageusement tous vos adaptateurs encombrants. Capable d'alimenter simultanément un MacBook Pro, un iPhone et des écouteurs sans surchauffe grâce au contrôle thermique actif intelligent.",
    features: [
      "Technologie GaN III avancée réduisant la taille de 45%",
      "2 ports USB-C Power Delivery 3.0 + 1 port USB-A Quick Charge 4.0+",
      "Recharge un iPhone à 60% en seulement 28 minutes",
      "Protection intégrée contre les surtensions, courts-circuits et surchauffes",
      "Prise européenne certifiée CE et RoHS",
    ],
    specifications: {
      "Puissance maximale": "65 Watts Max",
      "Ports de sortie": "2x USB-C + 1x USB-A",
      Technologie: "GaN III Fast Charging",
      Entrée: "100-240V ~ 50/60Hz 1.5A",
      Poids: "118 grammes",
      "Garantie Nantor's": "12 mois remplacement neuf",
    },
    images: [
      "/images/product_gan_charger_1793629796501.jpg",
      "/images/hero_nantors_tech_1793629795085.jpg",
    ],
    featured: true,
    isAvailable: true,
    stockCount: 18,
    badge: "Best-Seller",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "prod-magsafe-3in1",
    name: "Station de Charge Magnétique 3-en-1 Aluminium",
    slug: "station-charge-magnetique-3-en-1-aluminium",
    category: "accessoires-telephonie",
    categoryLabel: "Accessoires Téléphoniques",
    price: 36000,
    originalPrice: 42000,
    shortDescription:
      "Support premium en alliage d'aluminium anodisé pour charger simultanément iPhone, Apple Watch et AirPods.",
    description:
      "Sublimez votre bureau ou table de chevet avec cette station d'accueil 3-en-1 usinée dans un bloc d'aluminium de qualité aérospatiale. Les aimants néodyme N52 ultra-puissants maintiennent fermement votre téléphone en mode portrait ou paysage pour les appels vidéo et le mode veille.",
    features: [
      "Charge sans fil rapide 15W certifiée Qi / MagSafe",
      "Socle lourd anti-dérapant en aluminium brossé",
      "Angle de visionnage optimal réglable à 360°",
      "Câble tressé renforcé 1.5m inclus dans le coffret",
      "Témoin LED discret sans perturbation nocturne",
    ],
    specifications: {
      Compatibilité: "iPhone MagSafe (12 à 16), Apple Watch, AirPods Pro",
      "Puissance totale": "25 Watts combinés",
      Matériau: "Alliage aluminium CNC + Silicone doux",
      Dimensions: "145 x 110 x 140 mm",
      "Garantie Nantor's": "12 mois constructeur",
    },
    images: [
      "/images/product_magsafe_stand_1793629797071.jpg",
      "/images/hero_nantors_tech_1793629795085.jpg",
    ],
    featured: true,
    isAvailable: true,
    stockCount: 12,
    badge: "Coup de Cœur",
    createdAt: "2026-03-05T12:00:00Z",
    updatedAt: "2026-03-05T12:00:00Z",
  },
  {
    id: "prod-cables-braided-100w",
    name: "Pack Câbles Tressés Blindés USB-C vers USB-C 100W",
    slug: "pack-cables-tresses-blindes-usbc-100w",
    category: "cables",
    categoryLabel: "Câbles Ultra-Durables",
    price: 5000,
    originalPrice: 15000,
    shortDescription:
      "Câble haute performance avec puce E-Marker supportant jusqu'à 100W PD et transfert 480 Mbps.",
    description:
      "Fini les câbles qui se déchirent après quelques semaines d'utilisation. Conçu avec une gaine en nylon balistique tressé et des connecteurs renforcés en alliage de zinc testés pour supporter plus de 35 000 torsions sans dommage. Compatible avec la recharge super-rapide des ordinateurs portables et smartphones.",
    features: [
      "Puce E-Marker intelligente pour délivrer jusqu'à 20V / 5A (100W)",
      "Gaine extérieure en nylon à double tressage anti-nœuds",
      "Connecteurs en alliage de zinc avec décharge de traction flexible",
      "Longueur généreuse de 2 mètres avec attache scratch en cuir vegan",
      "Blindage interne quadruple contre les interférences",
    ],
    specifications: {
      "Puissance supportée": "100W Max (5A / 20V)",
      "Débit de données": "480 Mbps (USB 2.0 High Speed)",
      Longueur: "2.0 mètres",
      "Test de courbure": "> 35 000 flexions",
      "Garantie Nantor's": "12 mois échange standard",
    },
    images: [
      "/images/product_braided_cables_1793629797955.jpg",
      "/images/hero_nantors_tech_1793629795085.jpg",
    ],
    featured: true,
    isAvailable: true,
    stockCount: 45,
    badge: "Indispensable",
    createdAt: "2026-03-02T14:00:00Z",
    updatedAt: "2026-03-02T14:00:00Z",
  },
  {
    id: "prod-anc-headphones",
    name: "Casque Audio Sans Fil Réduction Active de Bruit (ANC)",
    slug: "casque-audio-sans-fil-anc-audiophile",
    category: "audio-ecouteurs",
    categoryLabel: "Audio & Écouteurs",
    price: 49500,
    originalPrice: 58000,
    shortDescription:
      "Casque circum-aural haute fidélité avec réduction hybride du bruit ambiant jusqu'à -38dB et 40h d'autonomie.",
    description:
      "Une immersion sonore totale que vous soyez au bureau, en transport ou en avion. Les transducteurs dynamiques de 40 mm avec diaphragme en titane reproduisent des basses profondes et des aigus cristallins. Les coussinets en mousse à mémoire de forme et cuir protéiné offrent un confort exceptionnel même lors de sessions prolongées.",
    features: [
      "Réduction Active de Bruit hybride (ANC) réglable + Mode Transparence",
      "Autonomie record de 40 heures avec ANC activé (60h sans ANC)",
      "Charge rapide : 10 minutes de charge procurent 5 heures d'écoute",
      "Microphones à formation de faisceaux pour des appels clairs sans écho",
      "Connexion multipoint Bluetooth 5.3 (2 appareils en simultané)",
    ],
    specifications: {
      "Version Bluetooth": "Bluetooth 5.3 aptX HD / AAC",
      Transducteurs: "40 mm Titane Néodyme",
      Autonomie: "40h (ANC On) / 60h (ANC Off)",
      Connectique: "USB-C + Entrée jack 3.5mm auxiliaire",
      Poids: "248 grammes",
      "Garantie Nantor's": "12 mois",
    },
    images: [
      "/images/product_anc_headphones_1793629798214.jpg",
      "/images/hero_nantors_tech_1793629795085.jpg",
    ],
    featured: true,
    isAvailable: true,
    stockCount: 15,
    badge: "Son Studio",
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-10T09:00:00Z",
  },
  {
    id: "prod-powerbank-20000",
    name: "Batterie Externe 20 000 mAh PD 65W Affichage Digital",
    slug: "batterie-externe-20000mah-pd-65w-digital",
    category: "energie-batteries",
    categoryLabel: "Batteries Externes",
    price: 29500,
    originalPrice: 34000,
    shortDescription:
      "Monstre d'autonomie 20 000 mAh capable d'alimenter même un ordinateur portable via USB-C Power Delivery.",
    description:
      "Ne tombez plus jamais à court de batterie lors de vos déplacements professionnels ou coupures de courant. Équipée d'un écran numérique précis affichant le pourcentage exact restant ainsi que le voltage et l'intensité de charge en temps réel. Capable de recharger un iPhone 5 fois ou un MacBook Air 1.5 fois.",
    features: [
      "Capacité colossale de 20 000 mAh / 74Wh autorisée en cabine avion",
      "Puissance de sortie USB-C 65W : compatible PC portable et tablettes",
      "Recharge rapide de la batterie elle-même en seulement 1h45",
      "Écran numérique haute précision rétroéclairé",
      "Boîtier métallique en alliage d'aluminium résistant aux impacts",
    ],
    specifications: {
      Capacité: "20 000 mAh / 74Wh",
      Sorties: "1x USB-C (65W) + 2x USB-A (22.5W)",
      Entrée: "USB-C PD 65W Max",
      Affichage: "Écran LCD Numérique",
      "Garantie Nantor's": "12 mois constructeur",
    },
    images: [
      "/images/product_powerbank_1793629814640.jpg",
      "/images/hero_nantors_tech_1793629795085.jpg",
    ],
    featured: false,
    isAvailable: true,
    stockCount: 22,
    createdAt: "2026-03-08T15:30:00Z",
    updatedAt: "2026-03-08T15:30:00Z",
  },
  {
    id: "prod-usbc-hub-8in1",
    name: "Hub USB-C 8-en-1 Aluminium 4K HDMI & Ethernet Gigabit",
    slug: "hub-usbc-8-en-1-aluminium-4k-ethernet",
    category: "accessoires-informatique",
    categoryLabel: "Accessoires Informatiques",
    price: 28000,
    originalPrice: 33000,
    shortDescription:
      "Station d'extension tout-en-un avec sortie vidéo 4K@60Hz, port RJ45 Gigabit, lecteurs SD/TF et PD 100W.",
    description:
      "Transformez un simple port USB-C de votre ordinateur en véritable station de travail professionnelle. Idéal pour MacBook, iPad Pro, Dell XPS et PC portables récents. Le châssis monobloc en aluminium anodisé dissipe efficacement la chaleur lors des transferts de données intensifs.",
    features: [
      "Sortie HDMI 4K@60Hz ultra-fluide pour écrans et projecteurs",
      "Port Ethernet Gigabit RJ45 pour une connexion réseau filaire stable à 1000 Mbps",
      "Pass-through de charge USB-C Power Delivery jusqu'à 100W",
      "Lecteur de cartes mémoire SD & MicroSD (TF) haute vitesse",
      "3 ports USB 3.0 avec débits de transfert allant jusqu'à 5 Gbps",
    ],
    specifications: {
      "Connectique d'entrée": "Câble USB-C tressé intégré 15 cm",
      Ports:
        "1x HDMI 4K@60Hz, 1x RJ45 1000M, 1x PD 100W, 3x USB 3.0, 1x SD, 1x TF",
      "Compatibilité OS": "macOS, Windows 11/10, Linux, iPadOS, Android OTG",
      Matériau: "Aluminium aérospatial anodisé gris sidéral",
      "Garantie Nantor's": "12 mois échange à neuf",
    },
    images: [
      "/images/product_usb_hub_1793629815490.jpg",
      "/images/hero_nantors_tech_1793629795085.jpg",
    ],
    featured: true,
    isAvailable: true,
    stockCount: 20,
    badge: "Pro Performance",
    createdAt: "2026-03-04T11:00:00Z",
    updatedAt: "2026-03-04T11:00:00Z",
  },
];
