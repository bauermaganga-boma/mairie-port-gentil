# Mairie de Port-Gentil — site municipal et espace numérique des agents

Proposition de site conçue par Rouana (version de démonstration).

## Pages publiques
- `index.html` : accueil (démarches, mot du maire, budget 2026, espace numérique, projets, actualités, avis)
- `mairie.html` : le maire, l'organisation des services, Port-Gentil en bref, l'audit de mai 2026
- `arrondissements.html` : les 4 mairies d'arrondissement (focus 4e arrondissement)
- `demarches.html` : 12 démarches, dépôt en ligne en 3 étapes, signalements, suivi de dossier par numéro
- `projets.html` : projets et chantiers filtrables
- `actualites.html` : avis et communiqués (gérés depuis le back-office), presse, galerie
- `contact.html` : formulaire (reçu dans le back-office), carte

## Back-office (`espace.html` → `agents.html`)
| Profil | Identifiant / mot de passe (démo) | Modules |
|---|---|---|
| Cabinet du maire | `maire` / `pog2026` | tout, tableau de bord et alertes |
| Secrétariat général | `secretariat` / `admin2026` | tout + gestion des comptes |
| État civil | `etat.civil` / `agent2026` | demandes, registre d'état civil (extraits imprimables), stocks |
| Services techniques | `services.techniques` / `agent2026` | signalements, chantiers, stocks |
| Finances | `recettes` / `agent2026` | encaissements, quittances, chantiers |
| Ressources humaines | `rh` / `agent2026` | dossiers du personnel, pièces manquantes |
| Mairie d'arrondissement | `arr4` ou `arr1` / `arr2026` | ses propres dossiers uniquement |

Les personnes, montants et dossiers de démonstration sont **fictifs**.

## Base de données
- Vide (`assets/js/config.js`) = mode démonstration, données dans le navigateur.
- Supabase : exécuter `supabase/install.sql`, puis renseigner l'URL et la clé publique dans `config.js`.
- Avant la mise en service : changer les mots de passe de démonstration et passer `showDemo` à `false`.

## Contenus à confirmer avec la mairie
Coordonnées (téléphone, e-mail, horaires, adresse exacte), maires des 1er/2e/3e arrondissements,
liste des quartiers, pièces à fournir par démarche, photos officielles (les photos actuelles viennent de la presse).

## Test
`node tests/e2e.js http://localhost:8090/` (puppeteer-core + Microsoft Edge).
