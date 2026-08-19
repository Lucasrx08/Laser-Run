Laser Run 6e — V36.1

VISIBILITÉ
- Drapeau ajouté devant chaque athlète en Mass-start.
- Drapeau ajouté devant chaque nation en Relais.
- Noms légèrement agrandis sans casser la grille plein écran.

RELAIS / PROFILS
- Vérifié : les touches saisies en L5 alimentent bien la réussite au tir du profil individuel.
- La logique existante [L4, L5] dans renderStudentProfiles est conservée.
- relayTime reste stocké sur les résultats L5 des athlètes de la nation.

GLOBE DE CRISTAL
- Correction majeure L5 : le Relais est maintenant classé UNE fois par nation à partir de relayTime.
- Le temps n'est plus absent du Globe et n'est pas multiplié par le nombre d'athlètes.
- Recalcul immédiat du Globe après l'arrivée d'une nation.
- Barème L1 à L6 conservé : 1-4 = 4, 5-8 = 3, 9+ = 2 cristaux.
- Barème L7 corrigé : 1er = 12, 2e = 9, 3e = 6, autres = 0.
