/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { ArrowRight, AudioLines, Cable, Headphones, ShieldCheck, Truck, MessageCircle, Sparkles } from "lucide-react";

interface AboutPageProps { onExploreCatalog: () => void; }

export const AboutPage: React.FC<AboutPageProps> = ({ onExploreCatalog }) => (
  <main className="nantor-info-page">
    <div className="nantor-info-shell">
      <section className="nantor-info-hero">
        <span className="nantor-section-kicker"><Sparkles size={14} /> Notre univers · Lomé, Togo</span>
        <h1>La technologie du quotidien,<br /><span>en mieux.</span></h1>
        <p>Nantor's Electronics rassemble des accessoires utiles pour vos appareils, votre travail et vos moments de détente. Notre idée : rendre le bon choix plus simple.</p>
        <button type="button" onClick={onExploreCatalog}>Explorer la boutique <ArrowRight size={16}/></button>
        <div className="nantor-info-hero-orb" aria-hidden="true"><div/><span>N.</span></div>
      </section>

      <section className="nantor-info-story">
        <div className="nantor-info-story-copy">
          <span className="nantor-section-kicker">Notre approche</span>
          <h2>Moins de complications.<br /><span>Plus de bonnes connexions.</span></h2>
          <p>Choisir un accessoire peut vite devenir compliqué : connectique, puissance, compatibilité, usages… Nous organisons notre catalogue pour vous aider à comparer les informations disponibles et à trouver ce qui correspond à votre besoin.</p>
          <p>Et si vous avez un doute, notre équipe reste disponible pour échanger directement avec vous avant la confirmation de votre commande.</p>
        </div>
        <div className="nantor-info-values">
          <div><span className="nantor-info-value-icon"><Cable size={21}/></span><strong>Une sélection pratique</strong><p>Chargeurs, câbles, audio, hubs et accessoires pour vos appareils.</p></div>
          <div><span className="nantor-info-value-icon"><MessageCircle size={21}/></span><strong>Un échange direct</strong><p>Posez vos questions sur les caractéristiques et la compatibilité.</p></div>
          <div><span className="nantor-info-value-icon"><Truck size={21}/></span><strong>Une commande simple</strong><p>Livraison organisée à Lomé, frais confirmés avant validation.</p></div>
        </div>
      </section>

      <section className="nantor-info-pillars">
        <article><div><Headphones size={22}/></div><span>01 / AUDIO</span><h3>Écoutez autrement.</h3><p>Découvrez des accessoires audio pour accompagner vos déplacements, votre travail et vos loisirs.</p></article>
        <article><div><AudioLines size={22}/></div><span>02 / ÉNERGIE</span><h3>Restez connecté.</h3><p>Explorez les solutions de charge et les accessoires d'alimentation disponibles au catalogue.</p></article>
        <article><div><ShieldCheck size={22}/></div><span>03 / CONSEIL</span><h3>Choisissez avec clarté.</h3><p>Consultez les détails de chaque article et demandez une précision avant de commander.</p></article>
      </section>
      <section className="nantor-info-bottom"><span>YOUR EVERYDAY TECH, SIMPLIFIED.</span><h2>Votre prochain essentiel<br/>vous attend peut-être ici.</h2><button onClick={onExploreCatalog}>Voir les produits <ArrowRight size={16}/></button></section>
    </div>
  </main>
);
