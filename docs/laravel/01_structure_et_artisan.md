# 🏗️ Structure de Laravel & Artisan CLI

## 📂 Structure des Dossiers (Microservices)
Dans un projet d'API, voici les dossiers que tu utiliseras 90% du temps :

* **app/Http/Controllers** : Le "cerveau". Reçoit la requête, demande des données au modèle, et renvoie une réponse JSON.
* **app/Models** : La représentation de tes tables de base de données. C'est ici qu'on définit les relations (ex: un User a plusieurs Orders).
* **routes/api.php** : Le fichier où tu déclares tes URLs (ex: `GET /api/users`).
* **database/migrations** : Le "versioning" de ta base de données. Permet de créer les tables via du code PHP.
* **app/Http/Resources** : (Crucial pour l'API) Permet de transformer tes modèles en JSON propre pour le front-end React.

## 🛠️ Commandes Artisan Essentielles
Utilise toujours `./vendor/bin/sail artisan` pour exécuter ces commandes dans Docker.

| Commande | Utilité |
| :--- | :--- |
| `make:controller NameController` | Crée un nouveau contrôleur. |
| `make:model Name -m` | Crée un modèle ET sa migration associée. |
| `migrate` | Exécute les nouvelles migrations pour créer les tables. |
| `route:list` | Affiche toutes les URLs disponibles dans ton application. |