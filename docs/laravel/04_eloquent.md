# 📘 Guide Eloquent ORM — Pour Débutants

> **Eloquent** est l'ORM (Object-Relational Mapper) intégré à Laravel. Il permet d'interagir avec votre base de données en utilisant des classes PHP plutôt qu'écrire du SQL brut.

---

## 📋 Table des matières

1. [Prérequis & Configuration](#1-prérequis--configuration)
2. [Créer un Modèle](#2-créer-un-modèle)
3. [Structure d'un Modèle](#3-structure-dun-modèle)
4. [Récupérer des données (SELECT)](#4-récupérer-des-données-select)
5. [Filtrer les données (WHERE)](#5-filtrer-les-données-where)
6. [Trier et Limiter](#6-trier-et-limiter)
7. [Insérer des données (INSERT)](#7-insérer-des-données-insert)
8. [Mettre à jour des données (UPDATE)](#8-mettre-à-jour-des-données-update)
9. [Supprimer des données (DELETE)](#9-supprimer-des-données-delete)
10. [Les Relations entre tables](#10-les-relations-entre-tables)
11. [Eager Loading (éviter les N+1)](#11-eager-loading-éviter-les-n1)
12. [Les Scopes (requêtes réutilisables)](#12-les-scopes-requêtes-réutilisables)
13. [Accesseurs & Mutateurs](#13-accesseurs--mutateurs)
14. [Soft Deletes (suppression douce)](#14-soft-deletes-suppression-douce)
15. [Pagination](#15-pagination)
16. [Résumé des méthodes essentielles](#16-résumé-des-méthodes-essentielles)

---

## 1. Prérequis & Configuration

### Configurer la base de données

Dans le fichier `.env` à la racine de votre projet Laravel :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nom_de_votre_base
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

> 💡 **Conseil** : Laravel supporte MySQL, PostgreSQL, SQLite et SQL Server.

---

## 2. Créer un Modèle

La commande Artisan génère automatiquement un modèle :

```bash
# Créer un modèle simple
php artisan make:model Article

# Créer un modèle + sa migration (recommandé)
php artisan make:model Article -m

# Créer un modèle + migration + contrôleur
php artisan make:model Article -mc
```

Cela crée le fichier `app/Models/Article.php`.

---

## 3. Structure d'un Modèle

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    // ✅ Nom de la table (facultatif si la convention est respectée)
    // Convention : nom de la classe au pluriel en minuscules → "articles"
    protected $table = 'articles';

    // ✅ Clé primaire (par défaut : 'id')
    protected $primaryKey = 'id';

    // ✅ Colonnes que l'on peut remplir en masse (sécurité)
    protected $fillable = ['titre', 'contenu', 'auteur_id'];

    // ✅ Alternative : colonnes interdites à l'écriture en masse
    protected $guarded = ['id'];

    // ✅ Timestamps automatiques (created_at, updated_at)
    // Mettre false si votre table n'a pas ces colonnes
    public $timestamps = true;

    // ✅ Conversion automatique de types
    protected $casts = [
        'publié'     => 'boolean',
        'publié_le'  => 'datetime',
        'note'       => 'float',
    ];
}
```

> 🔑 **Convention de nommage** : Si votre classe s'appelle `Article`, Eloquent cherche automatiquement la table `articles`. Pas besoin de déclarer `$table` dans ce cas.

---

## 4. Récupérer des données (SELECT)

```php
use App\Models\Article;

// Récupérer TOUS les articles (retourne une Collection)
$articles = Article::all();

// Récupérer un article par son ID (retourne un modèle ou une erreur 404)
$article = Article::find(1);         // null si non trouvé
$article = Article::findOrFail(1);   // Exception si non trouvé

// Récupérer le premier résultat
$article = Article::first();
$article = Article::firstOrFail();   // Exception si non trouvé

// Récupérer uniquement certaines colonnes
$articles = Article::all(['id', 'titre']);
$articles = Article::select('id', 'titre')->get();

// Compter les enregistrements
$total = Article::count();

// Vérifier si un résultat existe
$existe = Article::where('titre', 'Laravel')->exists();   // true / false
$nexiste = Article::where('titre', 'Laravel')->doesntExist();
```

---

## 5. Filtrer les données (WHERE)

```php
// WHERE simple
$articles = Article::where('statut', 'publié')->get();

// WHERE avec opérateur
$articles = Article::where('note', '>=', 4)->get();
$articles = Article::where('note', '!=', 0)->get();

// Plusieurs conditions (AND)
$articles = Article::where('statut', 'publié')
                   ->where('note', '>=', 4)
                   ->get();

// Condition OR
$articles = Article::where('statut', 'publié')
                   ->orWhere('featured', true)
                   ->get();

// WHERE IN (parmi une liste)
$articles = Article::whereIn('id', [1, 2, 5])->get();

// WHERE NOT IN
$articles = Article::whereNotIn('statut', ['brouillon', 'archivé'])->get();

// WHERE BETWEEN
$articles = Article::whereBetween('note', [3, 5])->get();

// WHERE NULL / NOT NULL
$articles = Article::whereNull('supprimé_le')->get();
$articles = Article::whereNotNull('publié_le')->get();

// WHERE sur une date
$articles = Article::whereDate('created_at', '2024-01-15')->get();
$articles = Article::whereYear('created_at', 2024)->get();
$articles = Article::whereMonth('created_at', 1)->get();

// WHERE LIKE (recherche partielle)
$articles = Article::where('titre', 'like', '%Laravel%')->get();
```

---

## 6. Trier et Limiter

```php
// Trier par ordre croissant (ASC)
$articles = Article::orderBy('titre')->get();
$articles = Article::orderBy('created_at', 'asc')->get();

// Trier par ordre décroissant (DESC)
$articles = Article::orderBy('created_at', 'desc')->get();
$articles = Article::latest()->get();    // raccourci : orderBy created_at DESC
$articles = Article::oldest()->get();    // raccourci : orderBy created_at ASC

// Limiter le nombre de résultats
$articles = Article::limit(10)->get();
$articles = Article::take(10)->get();    // identique à limit()

// Sauter des résultats (offset)
$articles = Article::skip(20)->take(10)->get();   // résultats 21 à 30
```

---

## 7. Insérer des données (INSERT)

```php
// Méthode 1 : create() — nécessite $fillable dans le modèle
$article = Article::create([
    'titre'     => 'Mon premier article',
    'contenu'   => 'Contenu de l\'article...',
    'auteur_id' => 1,
]);

// Méthode 2 : instanciation + save()
$article = new Article();
$article->titre   = 'Mon premier article';
$article->contenu = 'Contenu de l\'article...';
$article->save();

// Méthode 3 : firstOrCreate() — récupère si existe, sinon crée
$article = Article::firstOrCreate(
    ['titre' => 'Mon article'],          // critères de recherche
    ['contenu' => 'Contenu par défaut']  // valeurs supplémentaires si création
);

// Méthode 4 : updateOrCreate() — met à jour si existe, sinon crée
$article = Article::updateOrCreate(
    ['titre' => 'Mon article'],          // critères de recherche
    ['contenu' => 'Nouveau contenu']     // valeurs à écrire
);
```

---

## 8. Mettre à jour des données (UPDATE)

```php
// Méthode 1 : récupérer + modifier + save()
$article = Article::find(1);
$article->titre = 'Titre modifié';
$article->save();

// Méthode 2 : update() sur une requête
Article::where('statut', 'brouillon')->update(['statut' => 'publié']);

// Méthode 3 : update() sur un modèle trouvé
$article = Article::find(1);
$article->update(['titre' => 'Nouveau titre', 'note' => 5]);

// Incrémenter / décrémenter une valeur
Article::find(1)->increment('vues');        // vues + 1
Article::find(1)->increment('vues', 5);    // vues + 5
Article::find(1)->decrement('stock');      // stock - 1
```

---

## 9. Supprimer des données (DELETE)

```php
// Supprimer un enregistrement trouvé
$article = Article::find(1);
$article->delete();

// Supprimer directement par ID
Article::destroy(1);
Article::destroy([1, 2, 3]);   // supprimer plusieurs

// Supprimer via une requête
Article::where('statut', 'archivé')->delete();
```

---

## 10. Les Relations entre tables

### 🔗 One-to-Many (Un à plusieurs)

> Un `Auteur` possède plusieurs `Article`s.

```php
// Dans le modèle Auteur
class Auteur extends Model
{
    public function articles()
    {
        return $this->hasMany(Article::class);
        // Cherche auteur_id dans la table articles
    }
}

// Dans le modèle Article
class Article extends Model
{
    public function auteur()
    {
        return $this->belongsTo(Auteur::class);
        // Utilise auteur_id dans cette table
    }
}

// Utilisation
$auteur   = Auteur::find(1);
$articles = $auteur->articles;           // tous ses articles (Collection)
$article  = Article::find(1);
$auteur   = $article->auteur;            // son auteur (modèle)
```

### 🔗 Many-to-Many (Plusieurs à plusieurs)

> Un `Article` peut avoir plusieurs `Tag`s, et un `Tag` peut appartenir à plusieurs `Article`s.

```php
// Table pivot nécessaire : article_tag (article_id, tag_id)

// Dans le modèle Article
class Article extends Model
{
    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }
}

// Dans le modèle Tag
class Tag extends Model
{
    public function articles()
    {
        return $this->belongsToMany(Article::class);
    }
}

// Utilisation
$article = Article::find(1);
$tags    = $article->tags;               // Collection de tags

// Attacher / détacher des relations
$article->tags()->attach(3);            // ajouter le tag ID 3
$article->tags()->detach(3);            // retirer le tag ID 3
$article->tags()->sync([1, 2, 4]);      // définir exactement ces tags
```

### 🔗 One-to-One (Un à un)

```php
// Un Utilisateur a un seul Profil
class Utilisateur extends Model
{
    public function profil()
    {
        return $this->hasOne(Profil::class);
    }
}

class Profil extends Model
{
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}
```

---

## 11. Eager Loading (éviter les N+1)

Le problème N+1 survient quand on fait une requête par élément dans une boucle.

```php
// ❌ MAUVAIS — génère 1 + N requêtes SQL (problème N+1)
$articles = Article::all();
foreach ($articles as $article) {
    echo $article->auteur->nom;  // 1 requête SQL par article !
}

// ✅ BON — génère seulement 2 requêtes SQL au total
$articles = Article::with('auteur')->get();
foreach ($articles as $article) {
    echo $article->auteur->nom;  // données déjà chargées
}

// Charger plusieurs relations en même temps
$articles = Article::with(['auteur', 'tags', 'commentaires'])->get();

// Charger des relations imbriquées
$articles = Article::with('auteur.profil')->get();

// Eager loading conditionnel
$articles = Article::with(['commentaires' => function ($query) {
    $query->where('approuvé', true)->orderBy('created_at', 'desc');
}])->get();
```

---

## 12. Les Scopes (requêtes réutilisables)

Les scopes permettent d'encapsuler des filtres courants dans le modèle.

```php
// Dans le modèle Article
class Article extends Model
{
    // Scope local : préfixe "scope" + NomDuScope
    public function scopePublié($query)
    {
        return $query->where('statut', 'publié');
    }

    public function scopePopulaire($query)
    {
        return $query->where('vues', '>=', 1000);
    }

    public function scopeDeCategorie($query, $categorie)
    {
        return $query->where('categorie', $categorie);
    }
}

// Utilisation (sans le préfixe "scope")
$articles = Article::publié()->get();
$articles = Article::publié()->populaire()->get();
$articles = Article::deCategorie('technologie')->publié()->get();
```

---

## 13. Accesseurs & Mutateurs

Ils permettent de transformer les données à la lecture ou à l'écriture.

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

class Article extends Model
{
    // Accesseur : transformer à la LECTURE
    // $article->titre retournera le titre en majuscules
    protected function titre(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => strtoupper($value),
        );
    }

    // Mutateur : transformer à l'ÉCRITURE
    // $article->titre = 'mon titre' stockera 'mon titre' en minuscules
    protected function titre(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ucfirst($value),
            set: fn ($value) => strtolower($value),
        );
    }

    // Attribut calculé (n'existe pas en base)
    protected function nomComplet(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->prenom . ' ' . $this->nom,
        );
    }
}

// Utilisation
$article = Article::find(1);
echo $article->titre;        // retourne la valeur transformée
echo $article->nom_complet;  // attribut calculé (snake_case)
```

---

## 14. Soft Deletes (suppression douce)

Au lieu de supprimer réellement l'enregistrement, on enregistre la date de suppression dans `deleted_at`.

```php
// 1. Ajouter la colonne dans la migration
Schema::table('articles', function (Blueprint $table) {
    $table->softDeletes(); // ajoute la colonne deleted_at
});

// 2. Ajouter le trait dans le modèle
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use SoftDeletes;
}

// 3. Utilisation
$article = Article::find(1);
$article->delete();                       // marque deleted_at, ne supprime pas

Article::all();                           // ignore les articles supprimés
Article::withTrashed()->get();            // inclut les supprimés
Article::onlyTrashed()->get();            // uniquement les supprimés

$article = Article::withTrashed()->find(1);
$article->restore();                      // restaurer un article supprimé
$article->forceDelete();                  // suppression définitive en base
```

---

## 15. Pagination

```php
// Pagination classique (liens Précédent / Suivant / Numéros)
$articles = Article::paginate(15);         // 15 résultats par page

// Pagination simple (liens Précédent / Suivant seulement, plus rapide)
$articles = Article::simplePaginate(15);

// Dans un contrôleur
public function index()
{
    $articles = Article::latest()->paginate(10);
    return view('articles.index', compact('articles'));
}

// Dans la vue Blade
@foreach ($articles as $article)
    <p>{{ $article->titre }}</p>
@endforeach

{{ $articles->links() }}   {{-- affiche les boutons de pagination --}}
```

---

## 16. Résumé des méthodes essentielles

| Méthode | Description | Exemple |
|---|---|---|
| `all()` | Tous les enregistrements | `Article::all()` |
| `find($id)` | Par ID | `Article::find(1)` |
| `findOrFail($id)` | Par ID ou 404 | `Article::findOrFail(1)` |
| `first()` | Premier résultat | `Article::first()` |
| `get()` | Exécuter la requête | `Article::where(...)->get()` |
| `create([])` | Insérer en masse | `Article::create([...])` |
| `update([])` | Mettre à jour | `$article->update([...])` |
| `save()` | Insérer ou mettre à jour | `$article->save()` |
| `delete()` | Supprimer | `$article->delete()` |
| `destroy($id)` | Supprimer par ID | `Article::destroy(1)` |
| `where()` | Filtrer | `Article::where('statut', 'publié')` |
| `orderBy()` | Trier | `Article::orderBy('created_at', 'desc')` |
| `limit()` | Limiter | `Article::limit(10)` |
| `count()` | Compter | `Article::count()` |
| `exists()` | Vérifier existence | `Article::where(...)->exists()` |
| `with()` | Eager loading | `Article::with('auteur')` |
| `paginate()` | Paginer | `Article::paginate(15)` |
| `increment()` | Incrémenter | `$article->increment('vues')` |

---

## 🎯 Conseils pour débutants

1. **Toujours définir `$fillable`** dans vos modèles pour sécuriser l'écriture en masse.
2. **Utiliser `with()`** dès que vous accédez à des relations dans une boucle.
3. **Préférer `findOrFail()`** à `find()` dans vos contrôleurs pour gérer automatiquement les 404.
4. **Les scopes** rendent votre code plus lisible et réutilisable.
5. **Utiliser `php artisan tinker`** pour tester vos requêtes Eloquent en temps réel dans le terminal.

```bash
# Tester Eloquent interactivement
php artisan tinker

>>> App\Models\Article::count()
>>> App\Models\Article::where('statut', 'publié')->first()
```

---

*Documentation rédigée pour Laravel 10/11 — Eloquent ORM*