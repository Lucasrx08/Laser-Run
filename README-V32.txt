V32 — Stabilisation

Fiabilité des courses
- Mass-start : chrono basé sur Date.now, temps d'arrivée enregistré immédiatement dans les résultats.
- Mass-start : état de course sauvegardé dans localStorage et restauré après rechargement.
- Relais : départ et temps d'arrivée des nations sauvegardés/restaurés.
- Poursuite : chrono sauvegardé/restauré ; changement d'onglet ne réinitialise plus le chrono.
- État de course séparé par classe.

Saisie des tirs
- La sauvegarde d'un profil de tir ne reconstruit plus tout l'écran professeur.
- Les modales restent stables en Mode Course.
- Le temps de relais est conservé dans le résultat de tir via relayTime sans modifier le classement individuel.

Résultats
- Une seule méthode choisit désormais le résultat le plus récent.
- Ajout d'un horodatage _updatedAt sur les nouvelles sauvegardes.
- Les anciens résultats restent compatibles.

Leçon 7
- Le chemin Défi Étoile est neutralisé en plus d'être masqué visuellement.

PWA
- Un seul service worker conservé : service-worker.js.
- Nouveau cache V32.
