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
4. Déployer les règles Firestore :

```bash
firebase deploy --only firestore:rules
```

5. Déployer la fonction callable qui enregistre les commandes du site :

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions:createWebsiteOrder
```

La fonction `createWebsiteOrder` relit les prix et les noms produits depuis Firestore. Elle enregistre les demandes web au statut « À confirmer » et ne retire pas de stock. Le stock est vérifié et déduit dans une transaction uniquement lorsque le propriétaire confirme la commande.

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
