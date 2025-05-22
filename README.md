# Gestionnaire de tâches - Matrice d'Eisenhower

Cette application web permet d'organiser vos tâches selon la matrice d'Eisenhower en les classant par importance et urgence. Elle fonctionne entièrement dans le navigateur et sauvegarde les données via le `localStorage`.

## Lancer le projet en local

1. Clonez ce dépôt puis ouvrez le dossier du projet.
2. Lancez un petit serveur HTTP (par exemple `npx serve` ou `python3 -m http.server`) ou ouvrez simplement `index.html` dans votre navigateur.
3. Vos tâches seront stockées localement et vous pourrez les exporter/importer au format JSON.

## Structure du fichier d'import/export

Les tâches sont échangées sous la forme d'un tableau JSON où chaque tâche possède les champs suivants :

```json
{
  "id": "string",             // identifiant unique
  "title": "string",          // titre de la tâche
  "description": "string|null",
  "dueDate": "YYYY-MM-DD|null",
  "priority": "low|medium|high",
  "category": "string|null",
  "recurrence": "daily|weekly|monthly|null",
  "quadrant": 1,
  "createdAt": "ISO-8601"
}
```

## Fonctionnalités principales

- **Ajout, édition et suppression** de tâches avec choix de la priorité, date d'échéance, catégorie ou récurrence.
- **Drag & drop** pour déplacer les cartes de tâches entre les quatre quadrants.
- **Recherche et filtre par catégorie** pour retrouver rapidement une tâche précise.
- **Statistiques** affichant le nombre de tâches par quadrant.
- **Import/Export** de la liste des tâches au format JSON.

Cette matrice d'Eisenhower simplifie la gestion des priorités et vous aide à garder une vue claire sur vos actions à réaliser.
