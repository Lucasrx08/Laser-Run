LASER RUN 6e — VERSION 34

Fichiers à déposer à la racine du dépôt GitHub Pages :
- index.html
- manifest.json
- service-worker.js
- icon-192.png (conserver celui déjà présent)
- icon-512.png (conserver celui déjà présent)

Corrections V34 :
- Suppression de l'attribution des nations côté Athlètes / Leçon 1.
- Les nations sont attribuées uniquement depuis Professeur > Athlètes > Attribution des nations.
- Roue plein écran recalibrée : roue + résultat + bouton de tirage visibles sans défilement.
- Noms des pays tous affichés dans le même sens.
- Mass-start et Relais : tuiles compactes en mode course, jusqu'à 5 colonnes, chrono et zone de tir accessibles sans défilement sur écran paysage.
- Poursuite : chronomètre et liste de départ compactés pour tenir dans le plein écran.
- Import CSV renforcé : séparateurs ; , tabulation ou |, colonnes Nom/Prénom ou Nom Prénom, UTF-8 et Windows-1252.
- Cache PWA renouvelé pour forcer le chargement de la V34.

Après mise en ligne, recharger une fois la page. Si une ancienne version reste affichée sur un appareil installé en PWA, fermer complètement l'application puis la rouvrir avec Internet pour permettre la mise à jour du service worker.
