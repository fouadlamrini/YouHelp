# Explication des erreurs console

## 1. `net::ERR_CONNECTION_REFUSED` (port 3000)

**Ce que ça veut dire :** Le frontend appelle `http://localhost:3000/api/...` mais **aucun serveur n’écoute sur le port 3000**. La connexion est refusée.

**Cause :** Le **backend Node/Express** n’est pas démarré.

**Solution :** Lancer le serveur backend dans un terminal :

```bash
cd back-end
npm start
```

(ou `node server.js` si tu n’as pas de script `start`). Vérifie que le fichier `.env` du backend contient `MONGO_URI` si tu utilises MongoDB. Une fois le serveur lancé, les appels à `/api/users/me`, `/api/auth/register`, etc. fonctionneront.

---

## 2. `ERR_NAME_NOT_RESOLVED` – circuit-board.png

**Ce que ça veut dire :** Le navigateur essaie de charger une image depuis une URL externe (`https://www.transparenttextures.com/patterns/circuit-board.png`) et **n’arrive pas à résoudre le nom de domaine** (DNS).

**Causes possibles :**  
- Pas d’internet ou DNS en panne.  
- Le site transparenttextures.com est bloqué ou injoignable.  
- Pare-feu / proxy qui bloque ce domaine.

**Où c’est utilisé :** `Login.jsx` – fond décoratif en arrière-plan.

**Solution :** Soit tu restes avec cette URL (ça marchera quand le réseau le permet), soit tu remplaces par une image locale dans `public/` ou un autre pattern (CSS ou image hébergée chez toi).

---

## 3. `[DOM] Input elements should have autocomplete attributes`

**Ce que ça veut dire :** Le navigateur recommande d’ajouter l’attribut **`autocomplete`** sur les champs email et mot de passe pour que les gestionnaires de mots de passe et la saisie automatique fonctionnent mieux.

**Où :** Champs password (et parfois email) des pages **Login** et **Register**.

**Solution :** Ajouter par exemple :  
- sur le champ **email** : `autocomplete="email"` ;  
- sur le champ **mot de passe** (connexion) : `autocomplete="current-password"` ;  
- sur le champ **mot de passe** (inscription) : `autocomplete="new-password"`.

Les champs ont été mis à jour dans le projet pour suivre cette recommandation.
