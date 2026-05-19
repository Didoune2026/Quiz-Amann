# Quiz — Culture Générale

Application de quiz culture générale jouable dans un navigateur, sans installation ni dépendance. 20 questions aléatoires par partie, chrono 15 secondes par question, Hall of Fame local.

**Démo live** : [à compléter après déploiement GitHub Pages]

---

## Déploiement

### GitHub Pages (recommandé)

1. Créer un repo public sur GitHub
2. Pousser les deux fichiers à la racine :
   ```
   index.html
   questions.json
   ```
3. Settings → Pages → Source : **Deploy from a branch** → Branch `main` → Dossier `/` (root)
4. L'appli est disponible à `https://<ton-compte>.github.io/<nom-du-repo>/`

### En local

```bash
# Python 3
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

> Ne pas ouvrir `index.html` directement dans le navigateur (double-clic) : le `fetch` de `questions.json` échoue sans serveur HTTP. Un fallback de 35 questions embarquées prend le relais automatiquement dans ce cas.

---

## Structure du projet

```
/
├── index.html        Application complète (React + Babel CDN, tout-en-un)
├── questions.json    Base de questions (200 questions, modifiable sans toucher au code)
└── README.md
```

---

## Ajouter ou modifier des questions

Toute la base de questions est dans `questions.json`. Aucune modification du code n'est nécessaire.

### Format d'une question

```json
{
  "id": 201,
  "categorie": "Histoire",
  "difficulte": "moyen",
  "points": 2,
  "question": "En quelle année la Tour Eiffel a-t-elle été construite ?",
  "reponses": ["1887", "1889", "1891", "1900"],
  "bonne": "B",
  "explication": "La Tour Eiffel a été construite pour l'Exposition universelle de 1889."
}
```

### Règles à respecter

| Champ | Type | Valeurs acceptées |
|---|---|---|
| `id` | entier | unique, incrémenter depuis le dernier |
| `categorie` | string | libre — cohérent avec les catégories existantes |
| `difficulte` | string | `facile` / `moyen` / `difficile` (minuscules) |
| `points` | entier | `1` (facile) / `2` (moyen) / `3` (difficile) |
| `question` | string | texte de la question |
| `reponses` | tableau de 4 strings | exactement 4 propositions |
| `bonne` | string | `A` / `B` / `C` / `D` (majuscule) — index dans `reponses` |
| `explication` | string | affiché après la réponse (peut être vide `""`) |

### Répartition recommandée

Le tirage effectue **5 faciles + 10 moyennes + 5 difficiles** par partie. Pour garantir la variété d'une partie à l'autre, maintenir au minimum :

- 30 questions faciles
- 40 questions moyennes
- 20 questions difficiles

La base actuelle contient **200 questions** (65 faciles / 86 moyennes / 49 difficiles).

### Catégories existantes

`Histoire` · `Science` · `Géographie` · `Culture pop` · `Sport` · `Cinéma` · `Série` · `Musique` · `Littérature` · `Gastronomie` · `Langue française` · `Étymologie` · `Économie` · `Société` · `Nature` · `Technologie` · `Architecture` · `Jeux Olympiques` · `Religion` · `Répliques célèbres` · `Acronymes` · `Orthographe` · `Métiers`

---

## Mécanique du jeu

- **20 questions** tirées aléatoirement à chaque partie (5 faciles, 10 moyennes, 5 difficiles)
- **15 secondes** par question — passage automatique à 0
- **Score** = points de base (1/2/3) + bonus de rapidité (jusqu'à +1 selon le temps restant)
- **Hall of Fame** : classement local stocké dans `localStorage`, persistant entre les sessions sur le même navigateur

---

## Personnalisation

### Modifier le chrono

Dans `index.html`, ligne 5 :
```js
const TIMER_MAX = 15; // secondes par question
```

### Modifier la répartition des questions

Dans `index.html`, fonction `pickQuestions` :
```js
function pickQuestions(db) {
  const facile = shuffle(db.filter(q => q.difficulte === "facile")).slice(0, 5);
  const moyen  = shuffle(db.filter(q => q.difficulte === "moyen")).slice(0, 10);
  const diff   = shuffle(db.filter(q => q.difficulte === "difficile")).slice(0, 5);
  return shuffle([...facile, ...moyen, ...diff]);
}
```

### Ajouter une catégorie thématique

Ajouter les questions dans `questions.json` avec la nouvelle valeur de `categorie`. Aucune autre modification nécessaire.

---

## Technique

- **React 18** via CDN (unpkg)
- **Babel Standalone** pour la transpilation JSX dans le navigateur
- Aucune dépendance npm, aucun bundler
- Compatible tous navigateurs modernes
- `prefers-color-scheme` : thème sombre automatique si le système est en mode sombre, overridable via le toggle ⚙
