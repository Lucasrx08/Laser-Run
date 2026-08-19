V32.1 — Sécurisation

CORRECTIONS
1. Résultat le plus récent
- Correction de l'erreur Date.parse() * 1000.
- _updatedAt et dates historiques utilisent maintenant la même unité : millisecondes.

2. États de course
- Clé de sauvegarde = année scolaire + classe.
- Impossible pour une nouvelle 6A de récupérer l'état de la 6A de l'année précédente.
- La mémoire course est remise à zéro AVANT toute restauration.
- Une classe sans état sauvegardé ne peut plus afficher les données de la classe ouverte précédemment.
- Chronos/tickers sont arrêtés proprement lors du changement de classe.

3. Nettoyage
- Suppression de l'ancien écran caché « Poursuite · Départs » qui appelait
  startPursuitMaster(), pausePursuitMaster() et resetPursuitMaster() inexistants.

4. PWA / hors ligne
- Un seul service worker.
- Les fichiers essentiels sont pré-cachés.
- XLSX, jsQR et qrcode-generator sont mis en cache lors de l'installation
  quand Internet est disponible.
- L'échec d'un CDN ne bloque jamais l'installation de l'application.
- Une fois ces bibliothèques mises en cache, QR/scan/Excel restent disponibles hors ligne.
- Le faux fichier XLSX placeholder n'est plus présenté comme une vraie bibliothèque.

Aucun changement pédagogique ni graphique volontaire par rapport à la V32.
