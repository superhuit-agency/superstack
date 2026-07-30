---
title: 'Traduction contenu'
category: 'multilang'
wordpressName: 'Langues (plugin Polylang)'
summary: 'Gérer les contenus du site en français et en allemand.'
image: '/docs/multilang/multilangue/overview.png'
imageAlt: "Menu Langues dans l'administration"
order: 1
---

Le site est bilingue **français / allemand** (FR = langue par défaut, plugin Polylang).

- chaque contenu existe en **versions séparées par langue**, reliées entre elles
- côté site public, toutes les URLs sont **préfixées par la langue** (`/fr/...`, `/de/...`)

## Édition pas à pas

### Éditer / Ajouter une page par langue

3. **Dans la liste des pages**, une colonne par langue — l'icône de langue indique qu'une version existe (cliquez pour l'ouvrir) ; le **+** crée la traduction manquante dans cette langue.

    ![Colonnes de langue dans la liste des pages](/docs/multilang/multilangue/02-pages-list.png)

4. **Filtrez l'admin par langue** — le sélecteur en haut de l'admin (« Afficher toutes les langues ») limite les listes de contenus à une seule langue.

    ![Sélecteur de langue de l'admin](/docs/multilang/multilangue/03-admin-filter.png)

5. **Dans l'éditeur d'une page**, le panneau **Langues** (en haut à droite) — montre la langue de la page et ses traductions ; le **+** crée la version dans l'autre langue.

    ![Panneau Langues dans l'éditeur](/docs/multilang/multilangue/04-editor-panel.png)

    ![Création de la traduction depuis l'éditeur](/docs/multilang/multilangue/04-editor-panel-2.png)

### Traduction des chaînes de caractères prédéfinies dans les compositions

Pour certaines composition comme le header de la homepage, il n'est pas possible de venir modifier la traduction depuis le contenu, il faut le faire depuis le code.
Pour ce faire, envoyer la traduction souhaitée à Superhuit qui se chargera de la mettre en place. Voici la liste des chaînes de caractères nom modifiable sur wordpress.

Dernière mise à jour: 28/07/2026

```
{
	"button-ai-assistant": "Besoin d’un conseil ?",
	"label": {
		"new": "Nouveauté",
		"ia": "Intégration IA"
	},
	"list-cards-image": {
		"more": "Afficher plus"
	},
	"list-features": {
		"button": "Toutes les fonctionnalités"
	},
	"list-testimonials": {
		"before": "Avant tipee",
		"after": "Après tipee",
		"period": "Période des témoignages"
	},
	"map": {
		"aria-label": "Carte de la Suisse avec les localisations de tipee à Lausanne et Spiez"
	},
	"partners": {
		"title": "Ils nous font confiance :"
	},
	"title-homepage": {
		"less-administrative": "Moins d’administratif",
		"more-impact": "Plus d’impact",
		"simplicity": "Simplicité",
		"fluidité": "Fluidité"
	},
	"video": {
		"aria-label": "Lire la vidéo"
	}
}

```

## À noter

- Sont traduits par langue : **titre, contenu (blocs), extrait, slug, image mise en avant, SEO** — l'essentiel de la page.
- Le plugin **Duplicate Post** (« Copier dans un nouveau brouillon ») permet de dupliquer un contenu comme base de traduction.
- Dans l'éditeur, les listes de contenus (ex. section Blog) ne montrent que les contenus de la **langue de la page en cours** — pas de mélange FR/DE dans l'aperçu.
- **Garde-fous automatiques** : préfixe de langue toujours visible dans l'URL, contenu sans langue rattaché à la langue par défaut.
- Un visiteur qui arrive sur la racine `/` du site est **redirigé vers la langue de son navigateur** ; le sélecteur de langue du site pointe vers la traduction exacte de la page courante.
