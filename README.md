# Mairie de Port-Gentil — site municipal et espace numérique des agents

Proposition de site conçue par Rouana (version de démonstration).

## Pages publiques
- `index.html` : accueil (démarches, mot du maire, budget 2026, espace numérique, projets, actualités, avis)
- `mairie.html` : le maire, l'organisation des services, Port-Gentil en bref, l'audit de mai 2026
- `arrondissements.html` : les 4 mairies d'arrondissement, même présentation pour chacune (repères, actions datées et sourcées, projets)
- `demarches.html` : 12 démarches avec tarifs indicatifs, dépôt en 4 étapes avec pièces justificatives, paiement en ligne (Airtel Money, carte bancaire) ou à la mairie, suivi par n° de dossier + téléphone, téléchargement du document et du reçu en PDF
- `projets.html` : projets et chantiers filtrables
- `actualites.html` : avis et communiqués (gérés depuis le back-office), presse, galerie
- `contact.html` : message à la mairie centrale ou à une mairie d'arrondissement, avec pièces jointes (reçu dans le back-office)

## Back-office (`espace.html` → `agents.html`)
| Profil | Identifiant / mot de passe (démo) | Modules |
|---|---|---|
| Cabinet du maire | `maire` / `pog2026` | tout, tableau de bord et alertes |
| Secrétariat général | `secretariat` / `admin2026` | tout + gestion des comptes |
| État civil | `etat.civil` / `agent2026` | demandes, registre d'état civil (extraits imprimables), stocks |
| Services techniques | `services.techniques` / `agent2026` | signalements, chantiers, stocks |
| Finances | `recettes` / `agent2026` | encaissements, quittances, chantiers |
| Ressources humaines | `rh` / `agent2026` | dossiers du personnel, pièces manquantes |
| Mairie d'arrondissement | `arr1`, `arr2`, `arr3`, `arr4` / `arr2026` | ses propres dossiers, messages et indicateurs |

Module **Indicateurs** (maire central, secrétariat, finances, maires d'arrondissement) : courbes (demandes, recettes par arrondissement), camemberts (statuts, moyens de paiement, nature des recettes, signalements), délais, dotation engagée, tableau comparatif des 4 arrondissements.

Les personnes, montants et dossiers de démonstration sont **fictifs**. Le paiement est **simulé** : en production, il passe par un prestataire agréé (Airtel Money, agrégateur, banque) dont le webhook appelle `pay_public`.

## Base de données
- Vide (`assets/js/config.js`) = mode démonstration, données dans le navigateur.
- Supabase : exécuter `supabase/install.sql`, puis renseigner l'URL et la clé publique dans `config.js`.
- Avant la mise en service : changer les mots de passe de démonstration et passer `showDemo` à `false`.

## Contenus à confirmer avec la mairie
Coordonnées (téléphone, e-mail, horaires, adresse exacte), maires des 1er/2e/3e arrondissements,
liste des quartiers, pièces à fournir par démarche, photos officielles (les photos actuelles viennent de la presse).

## Test
`node tests/e2e.js http://localhost:8090/` (puppeteer-core + Microsoft Edge).
