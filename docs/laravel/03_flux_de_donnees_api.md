# 🌊 Flux d'une requête API

1. **Route (`routes/api.php`)** : La requête arrive (ex: `POST /api/register`).
2. **Controller** : Valide les données entrantes (email, mot de passe).
3. **Model** : Enregistre l'utilisateur dans MySQL via Eloquent.
4. **Resource** : Transforme l'objet User en un format JSON sécurisé (sans le mot de passe !).
5. **Response** : Renvoie le JSON et un code HTTP (201 Created) au front-end.