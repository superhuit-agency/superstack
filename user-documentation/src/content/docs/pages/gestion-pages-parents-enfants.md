---
title: 'Gestion des pages parents/enfants'
category: 'pages'
wordpressName: 'Pages (plugin Nested Pages)'
summary: 'Organiser les pages en hiérarchie parent/enfant, avec URLs imbriquées automatiquement.'
image: '/docs/pages/gestion-pages-parents-enfants/overview.png'
imageAlt: "Arborescence des pages dans l'administration"
order: 2
---

Les Pages sont **hiérarchiques** : une page peut avoir une page parente, et son adresse publique reflète cette hiérarchie (`/fr/parent/enfant/`).

Le menu **Pages** de l'administration affiche l'arborescence complète du site (plugin Nested Pages) avec réordonnancement par glisser-déposer.

## Édition pas à pas

### Depuis l'arborescence

1. **Ouvrez le menu « Pages »** — l'arborescence s'affiche ; **Tout déplier** montre tous les niveaux.

2. **Les pages enfants apparaissent indentées** sous leur parent — la poignée à gauche de chaque ligne permet de glisser-déposer une page pour la réordonner ou la placer sous une autre page (elle devient enfant, son URL change).

    ![Arborescence des pages avec poignée de glisser-déposer](/docs/pages/gestion-pages-parents-enfants/01-tree-view.png)

### Depuis l'éditeur

3. **Autre méthode : le réglage « Parent »** dans l'éditeur — ouvrez la page, puis dans la barre latérale, onglet **Page**, ligne **Parent**.

    ![Réglage Parent dans la barre latérale](/docs/pages/gestion-pages-parents-enfants/02-parent-setting.png)

4. **Choisissez la page parente** — recherchez par titre et sélectionnez dans la liste.

    ![Recherche de la page parente](/docs/pages/gestion-pages-parents-enfants/03-choose-parent.png)

5. **L'URL devient imbriquée** — cliquez sur **Slug** pour voir le permalien complet : l'adresse de la page enfant contient celle du parent.

    ![Permalien imbriqué](/docs/pages/gestion-pages-parents-enfants/04-nested-url.png)

## À noter

- **Déplacer une page sous un parent change son URL publique** — à faire en connaissance de cause sur des pages déjà en ligne.
- Seules les **pages publiées** sont proposées comme parent dans l'éditeur.
- L'édition rapide (titre, statut, date) reste disponible directement depuis l'arborescence.
- **Aucune limite de profondeur** : le site résout les URLs imbriquées à n'importe quel niveau.

## Documentation liée

[Comment afficher la liste des pages enfants dans la navigation ?](/navigation/list-child-pages/)
