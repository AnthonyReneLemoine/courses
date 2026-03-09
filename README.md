# Liste de courses (GitHub Pages + Firebase)

Application web responsive de liste de courses, prête pour :
- hébergement **GitHub Pages** (front statique)
- base de données **Firebase Firestore**
- authentification **Google** (Firebase Auth)

## Fichiers
- `index.html` : structure de la page
- `styles.css` : responsive desktop/mobile
- `app.js` : logique front + Firestore + Auth Google
- `firebase-config.js` : configuration Firebase (à personnaliser)
- `firebase-config.example.js` : modèle de configuration

## 1) Créer un projet Firebase
1. Aller sur Firebase Console.
2. Créer un projet.
3. Activer **Authentication > Sign-in method > Google**.
4. Activer **Cloud Firestore**.
5. Dans *Project settings > General*, créer une application Web et récupérer la config.
6. Remplacer le contenu de `firebase-config.js` avec vos valeurs.

## 2) Autoriser GitHub Pages dans Firebase Auth
Dans **Authentication > Settings > Authorized domains**, ajouter votre domaine Pages, par exemple :
- `votre-compte.github.io`

## 3) Règles Firestore recommandées (par utilisateur)
```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /shoppingItems/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

## 4) Déployer sur GitHub Pages
1. Pousser le repo sur GitHub.
2. Ouvrir **Settings > Pages**.
3. Source : branche principale (`main` ou autre) et dossier `/root`.
4. L’URL de Pages servira l’application.

## 5) Responsive ciblé
- Desktop Full HD (1920x1080) : layout en 2 colonnes.
- Mobile (OnePlus 11 : ~412px CSS) : layout en 1 colonne.


## 6) Données enregistrées
Chaque article contient :
- `uid` (utilisateur connecté)
- `product`
- `quantity`
- `bought`
- `createdAt`

Le champ `store` a été retiré.
