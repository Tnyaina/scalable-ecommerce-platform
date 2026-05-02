# 🖋️ Syntaxe et Bonnes Pratiques

## 1. Nommage (Conventions Laravel) 📏
* **Contrôleurs** : PascalCase + Suffixe (ex: `ProductController`).
* **Modèles** : PascalCase, singulier (ex: `Product`).
* **Méthodes** : camelCase (ex: `public function storeOrder()`).
* **Variables** : snake_case ou camelCase (sois cohérent).

## 2. Le principe "Thin Controller" 🧼
Le contrôleur ne doit pas contenir de calculs complexes. 
1. Le contrôleur reçoit la donnée.
2. Il appelle une méthode dans le **Modèle** ou un **Service**.
3. Il renvoie la réponse.

## 3. Réponses API 🌐
N'utilise jamais `return view()`. Pour une API, on renvoie toujours du JSON :
```php
return response()->json(['message' => 'Succès'], 200);