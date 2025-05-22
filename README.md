# Gestionnaire de tâches - Matrice d'Eisenhower

Cette application web permet d'organiser vos tâches selon la matrice d'Eisenhower en les classant par importance et urgence. Elle fonctionne entièrement dans le navigateur et stocke les données grâce à **LocalForage**, qui utilise `IndexedDB` quand c'est possible et se replie sur `localStorage` si nécessaire.

## Lancer le projet en local

1. Clonez ce dépôt puis ouvrez le dossier du projet.
2. Mettez vous à jour avec `git pull origin main` puis exécutez `npm test` pour vérifier le bon fonctionnement des utilitaires.
3. Lancez ensuite un petit serveur HTTP (par exemple `npx serve` ou `python3 -m http.server`) et ouvrez `http://localhost:5000` dans votre navigateur.
4. Vos tâches seront stockées localement et vous pourrez les exporter/importer au format JSON.

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
- **Statistiques** affichant le nombre de tâches par quadrant et la liste ordonnée des actions à réaliser.
- **Import/Export** de la liste des tâches au format JSON.
- **Fonctionnement hors ligne** grâce à la mise en cache du site via un Service Worker.
- **Notifications** optionnelles pour rappeler les tâches dont l'échéance est proche.

Cette matrice d'Eisenhower simplifie la gestion des priorités et vous aide à garder une vue claire sur vos actions à réaliser.

## Licence

Ce projet est distribue sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.
