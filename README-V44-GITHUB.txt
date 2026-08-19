LASER RUN 6e — V44 COMPLET POUR GITHUB PAGES

Base : V43 complète et validée.
Modification V44 uniquement sur le générateur de dossards JO :
- bloc pays + drapeau décalé de 15 px vers la gauche ;
- grand numéro 01, 02, 03… décalé de 15 px vers la gauche ;
- aucun autre comportement de l’application n’a été modifié.

Fichiers à mettre ensemble à la RACINE du dépôt :
- index.html
- manifest.json
- service-worker.js
- icon-192.png
- icon-512.png
- bib-template.png

Le cache du service worker est passé en V44 afin d’éviter le maintien d’une ancienne version par Safari/GitHub Pages.
