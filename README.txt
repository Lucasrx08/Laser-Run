LASER RUN 6ème — V6

Fichiers à déposer à la racine du dépôt GitHub Pages :
- index.html
- manifest.json
- service-worker.js
- classes.json
- icon-192.png
- icon-512.png

NOUVEAU FONCTIONNEMENT
1. PROFESSEUR
   - Créer les classes.
   - Importer les élèves.
   - Cliquer "Exporter classes.json".
   - Remplacer le fichier classes.json du dépôt GitHub par celui exporté.
   Cette opération n'est nécessaire que lorsque les classes changent.

2. ÉLÈVES
   - Ouvrir l'application une fois avec Internet.
   - "Actualiser les classes".
   - Les classes restent ensuite disponibles hors connexion.
   - L1 propose deux parties :
       Situation 1 : Défi Étoile, score /5 avec cibles vertes/rouges.
       Situation principale : 4 x 150 m, 3 passages au tir, 5 touches obligatoires,
       nombre de rechargements illimité et chronomètre continu.

3. RÉSULTATS
   - Chaque tablette conserve localement les résultats.
   - En fin de séance : "QR des résultats de la tablette".
   - Le professeur : "Scanner les résultats".
   - Un QR peut contenir plusieurs résultats et les doublons sont ignorés.

IMPORTANT
Les bibliothèques techniques XLSX / QR sont chargées lors de la première ouverture en ligne
puis peuvent être mises en cache par le navigateur/service worker.
Aucune performance élève n'est envoyée vers un serveur externe par l'application.
