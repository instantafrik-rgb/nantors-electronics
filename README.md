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

## Firebase et isolation staging

Le projet de production est identifié par l'alias explicite `production` dans `.firebaserc`; aucun projet Firebase n'est défini comme cible par défaut. **Ne déployez jamais les règles ou fonctions de cette branche sur le projet de production.**

La configuration Vercel consultée comporte six variables `VITE_FIREBASE_*` communes aux environnements Preview et Production. Tant que Preview n'est pas isolé sur un projet Firebase distinct, toute modification de règles ou de fonctions pourrait affecter le site officiel. Le diagnostic de prévisualisation indique par ailleurs des lectures Firestore refusées (`permission-denied`).

Procédure sûre avant tout test fonctionnel :

1. Le propriétaire crée un projet Firebase de staging distinct (par exemple `nantors-electronics-staging`) et active Authentication avec Google ainsi que Firestore.
2. Le propriétaire vérifie que le plan Firebase permet l'exécution des Cloud Functions (plan Blaze requis pour ce déploiement).
3. Dans Vercel, renseigner **uniquement pour Preview** les six variables `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` et `VITE_FIREBASE_APP_ID` avec la configuration Web du projet staging. Ne pas modifier les variables Production.
4. Vérifier l'identifiant du projet staging avant déploiement (`firebase projects:list`), puis déployer explicitement vers cet identifiant :

```bash
firebase deploy --only firestore:rules,functions --project YOUR_STAGING_PROJECT_ID
```

5. Les fonctions sont configurées pour Node.js 22. Les contrôles locaux/CI à exécuter dans `functions` sont :

```bash
npm install --package-lock-only --ignore-scripts
npm ci
npm run build
npm test
```

Les fonctions comprennent notamment `createWebsiteOrder` (prix et disponibilité recalculés côté serveur), `createManualOrder`, les opérations de catalogue, `setOrderDeliveryFee`, `updateOrderStatus`, `markOrderPaid` et `adjustInventoryStock`. Les écritures de commandes et les mouvements de stock sont transactionnels. Les commandes et coordonnées clients restent privées au compte propriétaire.

### App Check, WhatsApp et Cloudinary

- App Check : configurer reCAPTCHA v3 ou Enterprise dans le projet Firebase staging, autoriser le domaine exact de la prévisualisation et définir `VITE_FIREBASE_APPCHECK_SITE_KEY` **dans Preview uniquement**. La fonction publique `createWebsiteOrder` utilise encore `enforceAppCheck: false`; activer `true` après validation du jeton sur staging, puis redéployer les fonctions sur staging.
- WhatsApp : `VITE_WHATSAPP_NUMBER` n'est pas présent dans Vercel. Le numéro commercial peut être enregistré dans **Espace propriétaire → Paramètres → Coordonnées** une fois Firestore staging opérationnel, ou dans une variable Preview.
- Cloudinary : les variables Preview actuelles utilisent le cloud `pgjikefb`, le preset `nantors_products` et le dossier `nantors-electronics/products`. Avant les tests d'upload, le propriétaire doit confirmer que le preset Unsigned existe et qu'il limite les formats, la taille et le dossier autorisés. Utiliser un dossier/preset de staging distinct pour ne pas mélanger les photos de test avec celles de la boutique réelle.

Ne pas importer automatiquement les données `INITIAL_PRODUCTS` : elles sont des exemples locaux. Le propriétaire doit choisir et valider les données produits/catégories à copier vers staging.

## Déploiement Vercel

Le projet utilise Vite avec :

- Build : `npm run build`
- Répertoire de sortie : `dist`
- Version Node : 22.x

Configurer les variables Firebase de **Preview** sur le projet staging uniquement. Conserver les variables Production inchangées. Les variables Cloudinary Preview doivent utiliser un dossier/preset de staging. Ne jamais inscrire de valeurs secrètes dans le dépôt Git.

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

La prévisualisation Vercel et la compilation ne prouvent pas que les services Firebase ont été déployés ou testés avec les données réelles. La prévisualisation doit d'abord être isolée de la base de production.

1. Créer un projet Firebase staging distinct, activer Google Authentication et Firestore, puis vérifier le plan Blaze pour Cloud Functions.
2. Dans Vercel, remplacer les six variables `VITE_FIREBASE_*` **pour Preview uniquement** par les valeurs du projet staging. Les entrées actuelles sont partagées entre Preview et Production : ne pas modifier ni déployer de règles sur le projet de production.
3. Déployer `firestore.rules` et les Cloud Functions explicitement vers le projet staging avec `firebase deploy --only firestore:rules,functions --project YOUR_STAGING_PROJECT_ID`. Vérifier l'identifiant avant d'exécuter la commande.
4. Configurer App Check sur staging, ajouter le domaine de prévisualisation et renseigner `VITE_FIREBASE_APPCHECK_SITE_KEY` dans Preview. Après vérification du jeton, passer `enforceAppCheck` à `true` pour `createWebsiteOrder` et redéployer uniquement sur staging.
5. Vérifier que le preset Cloudinary `nantors_products` existe en mode Unsigned et restreindre formats, taille et dossier. Utiliser un dossier de staging distinct des photos réelles; les variables Cloudinary actuelles de Preview pointent vers `nantors-electronics/products`.
6. Renseigner le numéro WhatsApp commercial dans **Espace propriétaire → Paramètres → Coordonnées** sur staging, ou ajouter `VITE_WHATSAPP_NUMBER` dans Preview. Il est absent des variables Vercel consultées et le formulaire de commande reste bloqué tant qu'il n'est pas configuré.
7. Copier uniquement les vraies catégories et fiches produits que le propriétaire souhaite tester. Ne jamais importer les données locales `INITIAL_PRODUCTS` dans Firestore réel sans validation.
8. Tester sur staging avec des coordonnées fictives : création Firestore, ouverture WhatsApp, saisie des frais, confirmation et déduction de stock, livraison, paiement, puis annulation d'une autre commande confirmée pour vérifier la restitution.
9. Après validation, demander une approbation explicite avant toute migration vers Firebase Production, modification des variables Production, fusion vers `main`, promotion Vercel ou changement du domaine officiel.

Ne pas fusionner `redesign/admin-premium`, promouvoir la prévisualisation ni modifier le domaine public sans validation explicite du propriétaire.

## Diagnostic de la prévisualisation (13 novembre 2026)

Un test navigateur réel de la prévisualisation a reçu HTTP 200, mais les lectures Firestore de `settings/shop`, `categories` et `products` retournent `permission-denied`. Le fichier `firestore.rules` de cette branche autorise pourtant la lecture publique des catégories et des produits disponibles. Le symptôme indique donc que les règles de cette branche ne sont pas encore publiées sur le projet Firebase ciblé, ou que la base/projet Firestore utilisé n'est pas celui attendu. Après déploiement, refaire le test navigateur avant d'activer les commandes.

La prévisualisation reste protégée par Vercel Authentication. Ce verrou n'est pas un défaut du site public et ne doit pas être supprimé pour la production sans décision du propriétaire.
