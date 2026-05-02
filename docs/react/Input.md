# Input — Composant réutilisable

Composant React complet et accessible couvrant tous les cas d'usage courants : champ texte, email, mot de passe, recherche, téléphone, tags, textarea et select.

---

## Installation

Copiez `Input.tsx` dans votre projet. Le composant s'auto-injecte son CSS au premier rendu — aucune importation de feuille de style supplémentaire n'est requise.

```bash
# Optionnel : ajouter les polices utilisées
# Ajoutez dans votre index.html ou _document.tsx
```

```html
<link
  href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

---

## Exports

```ts
import Input, { Textarea, Select } from "./Input";
import type { InputProps, TextareaProps, SelectProps, TagItem, PhoneDialCode } from "./Input";
```

| Export       | Type      | Description                        |
|--------------|-----------|------------------------------------|
| `Input`      | Component | Champ principal (toutes variantes) |
| `Textarea`   | Component | Zone de texte multiligne           |
| `Select`     | Component | Liste déroulante                   |
| `TagItem`    | Type      | `{ id: string; label: string }`    |
| `PhoneDialCode` | Type   | `{ flag, code, country }`          |

---

## Props — `Input`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `label` | `string` | — | Libellé affiché au-dessus |
| `hint` | `string` | — | Texte d'aide sous le champ |
| `error` | `string` | — | Message d'erreur (active l'état rouge) |
| `success` | `boolean` | `false` | Active l'état vert |
| `variant` | `"default" \| "search" \| "password" \| "tags" \| "phone"` | `"default"` | Comportement spécialisé |
| `iconLeft` | `ReactNode` | — | Icône à gauche |
| `iconRight` | `ReactNode` | — | Icône à droite |
| `prefix` | `string` | — | Préfixe textuel (ex: `"https://"`) |
| `suffix` | `string` | — | Suffixe textuel (ex: `".com"`) |
| `showCount` | `boolean` | `false` | Compteur de caractères (nécessite `maxLength`) |
| `showStrength` | `boolean` | `false` | Barre de force (variant `"password"` uniquement) |
| `disabled` | `boolean` | `false` | Désactive le champ |
| `tags` | `TagItem[]` | `[]` | Tags actuels (variant `"tags"`) |
| `onTagAdd` | `(tag: TagItem) => void` | — | Callback ajout de tag |
| `onTagRemove` | `(id: string) => void` | — | Callback suppression de tag |
| `dialCodes` | `PhoneDialCode[]` | Liste intégrée | Indicatifs (variant `"phone"`) |
| `defaultDialCode` | `string` | `"+33"` | Indicatif sélectionné par défaut |
| `onDialChange` | `(dial: PhoneDialCode) => void` | — | Callback changement d'indicatif |
| `className` | `string` | — | Classe CSS additionnelle sur le wrapper |

Toutes les props natives `<input>` (`value`, `onChange`, `placeholder`, `maxLength`, `id`, `ref`…) sont transmises.

---

## Props — `Textarea`

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Libellé |
| `hint` | `string` | Texte d'aide |
| `error` | `string` | Message d'erreur |
| `success` | `boolean` | État succès |
| `showCount` | `boolean` | Compteur (nécessite `maxLength`) |

Toutes les props natives `<textarea>` sont transmises.

---

## Props — `Select`

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Libellé |
| `hint` | `string` | Texte d'aide |
| `error` | `string` | Message d'erreur |
| `success` | `boolean` | État succès |
| `children` | `ReactNode` | `<option>` elements |

Toutes les props natives `<select>` sont transmises.

---

## Exemples d'utilisation

### Champ basique

```tsx
<Input
  label="Nom complet"
  placeholder="Jean Dupont"
  hint="Prénom et nom de famille"
/>
```

---

### Avec icône à gauche

```tsx
import { Mail } from "lucide-react";

<Input
  label="Email"
  type="email"
  placeholder="jean@exemple.fr"
  iconLeft={<Mail size={15} />}
/>
```

---

### État erreur

```tsx
<Input
  label="Email"
  type="email"
  value="jean@"
  error="Format d'email invalide"
/>
```

---

### État succès

```tsx
<Input
  label="Nom d'utilisateur"
  value="jean_dupont"
  success
  hint="Disponible ✓"
/>
```

---

### Désactivé

```tsx
<Input
  label="Champ lecture seule"
  value="Non modifiable"
  disabled
/>
```

---

### Mot de passe avec barre de force

```tsx
const [pwd, setPwd] = useState("");

<Input
  label="Mot de passe"
  variant="password"
  value={pwd}
  onChange={(e) => setPwd(e.target.value)}
  showStrength
  placeholder="Minimum 8 caractères"
/>
```

---

### Recherche avec bouton clear

```tsx
const [q, setQ] = useState("");

<Input
  label="Recherche"
  variant="search"
  value={q}
  onChange={(e) => setQ(e.target.value)}
  placeholder="Rechercher..."
/>
```

---

### Compteur de caractères

```tsx
<Input
  label="Titre"
  maxLength={80}
  showCount
  placeholder="Votre titre ici"
/>
```

---

### Préfixe / suffixe

```tsx
// URL
<Input
  label="Site web"
  prefix="https://"
  suffix=".com"
  placeholder="exemple"
/>

// Prix
<Input
  label="Prix"
  type="number"
  prefix="€"
  placeholder="0.00"
/>
```

---

### Tags (saisie multiple)

```tsx
const [tags, setTags] = useState<TagItem[]>([
  { id: "1", label: "React" },
  { id: "2", label: "TypeScript" },
]);

<Input
  label="Compétences"
  variant="tags"
  tags={tags}
  onTagAdd={(tag) => setTags((prev) => [...prev, tag])}
  onTagRemove={(id) => setTags((prev) => prev.filter((t) => t.id !== id))}
  placeholder="Ajouter et appuyer Entrée…"
  hint="Entrée ou virgule pour valider"
/>
```

---

### Téléphone avec indicatif

```tsx
const [phone, setPhone] = useState("");
const [dial, setDial] = useState<PhoneDialCode>();

<Input
  label="Téléphone"
  variant="phone"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  onDialChange={(d) => setDial(d)}
  defaultDialCode="+33"
  placeholder="06 12 34 56 78"
/>
```

Indicatifs personnalisés :

```tsx
const myDials: PhoneDialCode[] = [
  { flag: "🇫🇷", code: "+33", country: "France" },
  { flag: "🇩🇿", code: "+213", country: "Algérie" },
  { flag: "🇲🇦", code: "+212", country: "Maroc" },
];

<Input variant="phone" dialCodes={myDials} defaultDialCode="+213" />
```

---

### Textarea avec compteur

```tsx
const [bio, setBio] = useState("");

<Textarea
  label="Biographie"
  value={bio}
  onChange={(e) => setBio(e.target.value)}
  maxLength={200}
  showCount
  placeholder="Parlez-nous de vous..."
/>
```

---

### Select

```tsx
<Select label="Pays" hint="Votre pays de résidence">
  <option value="">— Choisir —</option>
  <option value="fr">France</option>
  <option value="be">Belgique</option>
  <option value="ch">Suisse</option>
  <option value="mg">Madagascar</option>
</Select>
```

---

### Avec `ref` (accès DOM)

```tsx
const inputRef = useRef<HTMLInputElement>(null);

<Input
  ref={inputRef}
  label="Focus par code"
  placeholder="..."
/>

// Quelque part :
inputRef.current?.focus();
```

---

## Personnalisation (CSS variables)

Toutes les couleurs et dimensions sont pilotées par des variables CSS. Surchargez-les globalement ou localement :

```css
:root {
  --input-bg:         #ffffff;
  --input-border:     #e2e0da;
  --input-border-h:   #c5c3bc;   /* survol */
  --input-border-f:   #1a1a1a;   /* focus */
  --input-text:       #1a1a1a;
  --input-muted:      #7a7872;
  --input-ph:         #b0aea8;   /* placeholder */
  --input-surface:    #f0ede7;   /* fond préfixe / tags */
  --input-disabled:   #f4f2ee;
  --input-error:      #c0392b;
  --input-success:    #1e7b4b;
  --input-radius:     8px;
  --input-shadow-f:   rgba(26,26,26,.08);   /* focus ring */
  --input-shadow-e:   rgba(192,57,43,.10);  /* focus ring erreur */
  --input-shadow-s:   rgba(30,123,75,.10);  /* focus ring succès */
}
```

---

## Accessibilité

- Chaque champ reçoit un `id` unique généré automatiquement (ou celui fourni via prop `id`).
- Le `<label>` est associé via `htmlFor`.
- `aria-invalid` est positionné sur le champ en état erreur.
- `aria-describedby` relie le champ à son message d'erreur ou d'aide.
- Le menu téléphone porte `role="listbox"` et `aria-expanded`.
- Les boutons "supprimer tag" ont un `aria-label` explicite.
- Le bouton bascule mot de passe a un `aria-label` dynamique.

---

## Dépendances

| Package | Version minimale | Obligatoire |
|---------|-----------------|-------------|
| `react` | 17+ | ✅ |
| `react-dom` | 17+ | ✅ |

Aucune autre dépendance externe. Les polices sont optionnelles (Google Fonts).

---

## Compatibilité

- React 17, 18, 19
- TypeScript 4.9+
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- SSR compatible (l'injection CSS est protégée par `typeof document`)
