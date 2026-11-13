# Nantor's Electronics

Boutique e-commerce d'accessoires électroniques pour le Togo. Application React, TypeScript et Vite avec catalogue public, commandes WhatsApp, espace propriétaire et gestion du stock.

## Développement local

Prérequis : Node.js 22 ou version compatible avec Vite 8.

```bash
npm install
npm run dev
```

Vérifications :

```bash
npm run lint
npm run build
```

## Configuration du frontend

Copier `.env.example` vers `.env.local`, puis renseigner les valeurs réelles. Ne jamais committer `.env.local` ni publier de clés privées.

Variables Firebase nécessaires :

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Variables boutique :

- `VITE_WHATSAPP_NUMBER` : numéro au format international, chiffres uniquement (ex. 228XXXXXXXX).

Variables Cloudinary pour les photos produits :

- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_CLOUDINARY_ASSET_FOLDER`

Sans Firebase configuré, le catalogue peut fonctionner en mode local de démonstration. Les commandes, l'inventaire et les données synchronisées exigent Firestore. Le mode local n'est pas une sauvegarde cloud.

## Firebase

Le projet Firebase par défaut est défini dans `.firebaserc`. Vérifier qu'il s'agit bien du projet voulu avant tout déploiement.

1. Activer Firebase Authentication avec Google.
2. Conserver le même compte propriétaire autorisé dans `src/config/environment.ts`, `firestore.rules` et `functions/src/index.ts` (actuellement `instantafrik@gmail.com`).
3. Configurer les variables Firebase dans l'environnement de déploiement.
4. Vérifier les règles et compiler/tester les Cloud Functions :

```bash
cd functions
npm install --package-lock-only --ignore-scripts
npm ci
npm run build
npm test
cd ..
```

5. Déployer les règles Firestore et l'ensemble des fonctions serveur :

```bash
firebase deploy --only firestore:rules,functions
```

Les fonctions comprennent notamment `createWebsiteOrder` (demande web recalculée côté serveur), `createManualOrder`, `createCatalogProduct`, `updateCatalogProduct`, `deleteCatalogProduct`, `createCatalogCategory`, `updateCatalogCategory`, `deleteCatalogCategory`, `setOrderDeliveryFee`, `updateOrderStatus`, `markOrderPaid` et `adjustInventoryStock`. Les créations/modifications/suppressions de produits et catégories, les commandes et les mouvements de stock passent par des fonctions serveur; les contrôles de catégorie et de stock sont transactionnels.

Les règles Firestore gardent les commandes et les mouvements de stock privés au compte administrateur. Les écritures publiques de commandes passent par la fonction serveur, jamais par un accès Firestore direct du navigateur.

## Déploiement Vercel

Le projet utilise Vite avec :

- Build : `npm run build`
- Répertoire de sortie : `dist`
- Version Node : 22.x

Ajouter les variables d'environnement Firebase, Cloudinary, WhatsApp et administrateur dans les environnements Preview et Production de Vercel. Ne jamais inscrire de valeurs secrètes dans le dépôt Git.

Les modifications de travail sont développées sur la branche `redesign/admin-premium`. Ne pas fusionner vers `main` ni promouvoir une prévisualisation en production sans validation explicite du propriétaire.

## Règles métier des commandes

- Modes de commande : site web, WhatsApp saisi manuellement, saisie administrateur.
- Toute commande commence au statut « À confirmer ».
- L'ouverture de WhatsApp n'est pas une confirmation.
- Frais de livraison saisis manuellement par commande.
- Paiement en espèces à la livraison uniquement.
- Le stock est décrémenté une seule fois, à la confirmation, dans une transaction Firestore.
- Une commande annulée après confirmation restitue le stock et inscrit un mouvement de retour.
- Le paiement ne peut être marqué comme reçu qu'après livraison.
- Les prix des commandes web sont recalculés côté serveur et les anciennes lignes de commande conservent leur instantané produit.

## Modules de l'espace propriétaire

- Vue d'ensemble
- Produits et photos
- Commandes
- Catégories
- Stock et mouvements
- Clients (synthèse de l'historique des commandes)
- Statistiques et export CSV
- Configuration et état des connexions


## Contrôles à terminer avant toute mise en production

La prévisualisation Vercel et la compilation ne prouvent pas que les services Firebase ont été déployés ou testés avec les données réelles. Avant d'ouvrir la nouvelle version aux clients :

1. Vérifier dans Vercel que les six variables `VITE_FIREBASE_*` sont renseignées pour Preview et Production. Elles sont présentes dans la configuration consultée pour ce projet.
2. Renseigner le numéro commercial dans **Espace propriétaire → Paramètres → Coordonnées** (indicatif pays inclus, chiffres uniquement), ou ajouter `VITE_WHATSAPP_NUMBER` aux variables Vercel puis redéployer. Le numéro n'était pas présent dans la liste des variables Vercel consultée; tant qu'il manque, le formulaire de commande en ligne reste bloqué volontairement.
3. Vérifier que Firebase Authentication avec Google et Firestore sont activés, que le compte propriétaire autorisé est bien `instantafrik@gmail.com`, et que les vraies fiches produits/catégories sont présentes dans Firestore. Les données `INITIAL_PRODUCTS` sont uniquement des données locales de démonstration et ne sont pas importées automatiquement.
4. Depuis un environnement connecté au bon projet Firebase, vérifier que Firestore Database existe et que le projet est sur le plan Blaze (requis pour Cloud Functions), puis depuis la branche `redesign/admin-premium` exécuter `firebase use nantors-electronics` et `firebase deploy --only firestore:rules,functions`. Ce déploiement Firebase n'est pas effectué par Vercel. Les règles de cette branche autorisent la lecture publique des catégories et produits disponibles, mais réservent les écritures de catalogue aux fonctions transactionnelles.
5. Configurer Firebase App Check pour l'application Web avec reCAPTCHA v3 ou Enterprise. Ajouter la clé publique dans la variable Vercel Preview `VITE_FIREBASE_APPCHECK_SITE_KEY`, autoriser le domaine exact de la prévisualisation dans Firebase Console, puis vérifier l'initialisation depuis **Espace propriétaire → Statut Système & Clés**. Le client initialise App Check dès que cette variable est présente. **La fonction publique `createWebsiteOrder` utilise encore `enforceAppCheck: false`** : après validation du jeton sur la prévisualisation, activer `enforceAppCheck: true` dans `functions/src/index.ts`, redéployer les fonctions, puis retester. Ne pas déclarer la production prête avant cette étape.
6. Dans Cloudinary, vérifier que le cloud `pgjikefb` possède bien le preset `nantors_products` en mode **Unsigned** et que les uploads arrivent dans `nantors-electronics/products`. Les trois variables Cloudinary publiques sont maintenant définies uniquement pour la prévisualisation Vercel de cette branche; aucun secret Cloudinary n'est stocké dans le dépôt.
7. Dans **Espace propriétaire → Paramètres → Coordonnées**, renseigner et enregistrer le numéro WhatsApp commercial au format international. Le numéro n'est pas inclus dans la configuration Vercel consultée; le réglage Firestore est la source prévue.
8. Après déploiement des règles, vérifier que les collections `categories` et `products` contiennent les vraies données. Les données `INITIAL_PRODUCTS` sont des exemples locaux uniquement et ne sont jamais importées automatiquement. Ne pas importer les exemples dans la boutique réelle sans validation du propriétaire.
9. Tester avec le compte propriétaire une commande réelle de bout en bout sur la prévisualisation : création Firestore, ouverture WhatsApp, saisie des frais, confirmation avec déduction de stock, livraison, paiement, puis annulation d'une autre commande confirmée pour vérifier la restitution.

Ne pas fusionner `redesign/admin-premium`, promouvoir la prévisualisation ni modifier le domaine public sans validation explicite du propriétaire.


## Diagnostic de la prévisualisation (13 novembre 2026)

Un test navigateur réel de la prévisualisation a reçu HTTP 200, mais les lectures Firestore de `settings/shop`, `categories` et `products` retournent `permission-denied`. Le fichier `firestore.rules` de cette branche autorise pourtant la lecture publique des catégories et des produits disponibles. Le symptôme indique donc que les règles de cette branche ne sont pas encore publiées sur le projet Firebase ciblé, ou que la base/projet Firestore utilisé n'est pas celui attendu. Après déploiement, refaire le test navigateur avant d'activer les commandes.

La prévisualisation reste protégée par Vercel Authentication. Ce verrou n'est pas un défaut du site public et ne doit pas être supprimé pour la production sans décision du propriétaire.
