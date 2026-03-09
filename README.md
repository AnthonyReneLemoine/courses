# Liste de courses (GitHub Pages + Firebase)

Application web responsive de liste de courses, prête pour :
- hébergement **GitHub Pages** (front statique)
- base de données **Firebase Firestore**

## Fichiers
- `index.html` : structure de la page
- `styles.css` : responsive desktop/mobile
- `app.js` : logique front + Firestore
- `firebase-config.js` : configuration Firebase (à personnaliser)
- `firebase-config.example.js` : modèle de configuration

## 1) Créer un projet Firebase
1. Aller sur Firebase Console.
2. Créer un projet.
3. Activer **Cloud Firestore** (mode production ou test selon besoin).
4. Dans *Project settings > General*, créer une application Web et récupérer la config.
5. Remplacer le contenu de `firebase-config.js` avec vos valeurs.

## 2) Règles Firestore minimales (exemple)
> À durcir ensuite avec auth si nécessaire.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /shoppingItems/{docId} {
      allow read, write: if true;
    }
  }
}
```

## 3) Déployer sur GitHub Pages
1. Pousser le repo sur GitHub.
2. Ouvrir **Settings > Pages**.
3. Source : branche principale (`main` ou autre) et dossier `/root`.
4. L’URL de Pages servira l’application.

## 4) Responsive ciblé
- Desktop Full HD (1920x1080) : layout en 2 colonnes (formulaire + liste).
- Mobile (OnePlus 11 : ~412px CSS) : layout en 1 colonne, boutons pleine largeur.

## 5) Important
`Code.gs` et `Index.html` sont des fichiers historiques de la version Google Apps Script et ne sont pas nécessaires pour GitHub Pages.
