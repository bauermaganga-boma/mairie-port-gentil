/* Mairie de Port-Gentil — couche de données.
   • Mode réel : base Supabase (PostgreSQL + authentification + temps réel), activé dès que
     assets/js/config.js contient l'URL et la clé publique du projet.
   • Mode démonstration : données enregistrées dans le navigateur (localStorage).
   Toutes les pages utilisent la même interface : un cache en mémoire (lecture synchrone)
   chargé par init(), et des méthodes asynchrones pour les écritures. */
const Store = (() => {
  const CFG = window.ESM_CONFIG || {};
  const LIVE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const KEY = "pog_db_v3", SKEY = "pog_session";
  const EMAIL = login => String(login).trim().toLowerCase() + "@mairie-pog.local";
  const COLS = ["demandes","signalements","actes","agenda","recettes","agents","stocks","chantiers","publications","contacts","journal"];

  /* ---------- Rôles et droits ---------- */
  const ROLES = {
    maire:{l:"Cabinet du maire", mods:"*"},
    sg:{l:"Secrétariat général", mods:"*"},
    etatcivil:{l:"État civil", mods:["tableau","demandes","actes","stocks","journal","compte"]},
    technique:{l:"Services techniques", mods:["tableau","signalements","chantiers","stocks","compte"]},
    finances:{l:"Finances & recettes", mods:["tableau","indicateurs","recettes","chantiers","compte"]},
    rh:{l:"Ressources humaines", mods:["tableau","agents","compte"]},
    arrondissement:{l:"Mairie d'arrondissement", mods:["tableau","indicateurs","demandes","signalements","actes","agenda","recettes","chantiers","stocks","publications","contacts","compte"]},
  };
  const STATUTS = {
    demandes:["Nouvelle","En traitement","Pièce manquante","Prête","Remise","Rejetée"],
    signalements:["Nouveau","Pris en charge","En intervention","Résolu"],
    chantiers:["À l'étude","Programmé","En cours","Réalisé","Suspendu"],
  };
  const NATURES = ["Droits de place (marchés)","Occupation du domaine public","Frais d'actes d'état civil","Permis de construire","Taxe de voirie","Taxe sur la publicité","Location de salles"];
  const MODES = ["Espèces","Airtel Money","Carte bancaire","Virement"];
  const natureDe = typeId => ({permis:"Permis de construire", domaine:"Occupation du domaine public", place:"Droits de place (marchés)"})[typeId] || "Frais d'actes d'état civil";
  const telKey = t => String(t || "").replace(/\D/g, "").slice(-6);

  let db = {users:[]}; COLS.forEach(c => db[c] = []);
  let me = null, sb = null, readyP = null;

  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = () => new Date().toISOString();
  const quittanceNo = () => "Q-" + String(new Date().getFullYear()).slice(2) + "-" + String(Date.now()).slice(-6);

  /* =========================================================
     DONNÉES DE DÉMONSTRATION (personnes et chiffres fictifs)
     ========================================================= */
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function seed() {
    const r = rng(2026), pick = a => a[Math.floor(r() * a.length)], ago = d => new Date(Date.now() - d * 864e5).toISOString();
    const P = "Jean-Pierre Marie-Claire Ghislain Prisca Arsène Nadège Rodrigue Sylvie Landry Murielle Fabrice Christelle Hervé Laetitia Yannick Gisèle Brice Carine Ulrich Stessy Davy Ornella Serge Pélagie Cédric Merveille Junior Félicité Loïc Bertrande".split(" ");
    const N = "Moussavou Nzé Ondo Mba Obiang Ndong Mabika Boussougou Koumba Mouele Ella Oyane Mapangou Bivigou Engone Ntoutoume Mengue Assoumou Makaya Ekomi Ibinga Nkoghe Ango Mboumba Ogoula Rapontchombo Ndjave Okoumba Renombo Ayo".split(" ");
    const Q = {1:["ASECNA","Cap Lopez","Carrefour Léon Mba","Cora Wood"],2:["Grand Village","Centre-ville","Bord de mer"],3:["Grand Village","La Balise","Quartier résidentiel"],4:["Matanda","Lip Matanda","Iguiri","Matiti 1","Matiti 2","Salsa","Ntchengué"]};
    // Profil d'activité par arrondissement (pour des indicateurs contrastés mais réalistes)
    const W = {1:1.05, 2:1.15, 3:0.9, 4:1.0}, SPEED = {1:1.0, 2:0.8, 3:1.35, 4:0.9}, ONLINE = {1:.55, 2:.6, 3:.4, 4:.5};
    const arrPick = () => { const t = r() * 4; return t < 1 ? 1 : t < 2 ? 2 : t < 3 ? 3 : 4; };
    const person = () => ({prenom:pick(P), nom:pick(N)});
    const tel = () => "0" + pick(["74","77","76","66","62"]) + " " + String(Math.floor(r()*90+10)) + " " + String(Math.floor(r()*90+10)) + " " + String(Math.floor(r()*90+10));

    const users = [
      {id:"u1", role:"maire", arr:0, login:"maire", pwd:"pog2026", prenom:"Cabinet", nom:"du Maire", titre:"Cabinet du maire"},
      {id:"u2", role:"sg", arr:0, login:"secretariat", pwd:"admin2026", prenom:"Secrétariat", nom:"Général", titre:"Administrateur"},
      {id:"u3", role:"etatcivil", arr:0, login:"etat.civil", pwd:"agent2026", prenom:"Gisèle", nom:"Ondo", titre:"Chef du service central de l'état civil"},
      {id:"u4", role:"technique", arr:0, login:"services.techniques", pwd:"agent2026", prenom:"Rodrigue", nom:"Mabika", titre:"Directeur des services techniques"},
      {id:"u5", role:"finances", arr:0, login:"recettes", pwd:"agent2026", prenom:"Carine", nom:"Boussougou", titre:"Receveuse municipale"},
      {id:"u6", role:"rh", arr:0, login:"rh", pwd:"agent2026", prenom:"Hervé", nom:"Koumba", titre:"Responsable des ressources humaines"},
    ];
    [1,2,3,4].forEach(a => users.push({id:"ua" + a, role:"arrondissement", arr:a, login:"arr" + a, pwd:"arr2026", prenom:"Mairie", nom:"du " + a + (a === 1 ? "er" : "e") + " arrondissement", titre:"Mairie du " + a + (a === 1 ? "er" : "e") + " arrondissement"}));

    const recettes = [];
    let qn = 4800;
    const addRec = (nature, arr, montant, payeur, mode, date, agent) => { const q = "Q-26-" + String(++qn).padStart(6, "0"); recettes.push({id:"r" + qn, quittance:q, nature, arr, montant, payeur, mode, agent:agent || "Guichet central", date}); return q; };

    // Demandes (6 mois)
    const demandes = [], types = DEMARCHES.filter(d => !d.signal);
    for (let i = 0; i < 150; i++) {
      const t = pick(types), p = person(), arr = arrPick(), age = Math.pow(r(), 0.85) * 180, sp = SPEED[arr];
      let k = age > 25 ? (r() < .78 ? 4 : r() < .5 ? 5 : 3) : age > 8 ? Math.floor(r() * 5) : (r() < .55 ? 0 : 1);
      if (!t.doc && k === 3 && age > 25) k = 4;
      const st = STATUTS.demandes[k], d0 = ago(age);
      const hist = [{date:d0, statut:"Nouvelle", note:"Demande reçue " + (r() < .7 ? "en ligne" : "au guichet") + ".", pub:true}];
      const step = x => ago(Math.max(0, age - x * sp));
      if (k >= 1) hist.push({date:step(.6 + r()), statut:"En traitement", note:"Dossier pris en charge par le service " + t.service + ".", pub:true});
      if (k === 2) hist.push({date:step(2), statut:"Pièce manquante", note:"Merci de fournir une copie lisible de votre pièce d'identité.", pub:true});
      let ready = null;
      if (k >= 3 && k !== 5) { ready = step(2 + r() * 5); hist.push({date:ready, statut:"Prête", note:t.doc ? "Votre document est prêt : téléchargez-le en ligne ou retirez-le au guichet." : "Votre dossier est prêt : présentez-vous au guichet avec votre pièce d'identité.", pub:true}); }
      if (k === 4) hist.push({date:step(4 + r() * 6), statut:"Remise", note:t.doc ? "Document téléchargé / remis au demandeur." : "Dossier remis au demandeur.", pub:true});
      if (k === 5) hist.push({date:step(3 + r() * 3), statut:"Rejetée", note:"Acte introuvable dans les registres de la commune : rapprochez-vous du lieu d'enregistrement.", pub:true});
      const ref = "PG-26-" + String(1000 + i).padStart(5, "0"), montant = t.prix || 0;
      let paiement = {statut:"Gratuit"};
      if (montant) {
        const online = r() < ONLINE[arr];
        if (online && k !== 5) { const mode = r() < .66 ? "Airtel Money" : "Carte bancaire", pd = ago(Math.max(0, age - .02)); paiement = {choix:"en ligne", statut:"Payé", mode, date:pd, quittance:addRec(natureDe(t.id), arr, montant, p.prenom + " " + p.nom, mode, pd, "Paiement en ligne"), transaction:(mode === "Airtel Money" ? "AM" : "CB") + Math.floor(r() * 1e9)}; hist.push({date:pd, statut:hist[hist.length - 1].statut, note:`Paiement reçu (${mode}) : ${fcfa(montant)}.`, pub:true}); }
        else if (k === 4) { const pd = hist[hist.length - 1].date, mode = pick(["Espèces","Espèces","Airtel Money","Carte bancaire"]); paiement = {choix:"guichet", statut:"Payé", mode, date:pd, quittance:addRec(natureDe(t.id), arr, montant, p.prenom + " " + p.nom, mode, pd, "Guichet")}; }
        else paiement = {choix:"guichet", statut:"À régler"};
      }
      demandes.push({id:"d" + i, ref, type:t.id, typeLabel:t.t, service:t.service, arr, ...p, tel:tel(), email:"", quartier:pick(Q[arr]), details:t.id === "audience" ? "Présentation d'un projet associatif de quartier." : "", statut:st, date:d0, montant, paiement, pj:[], document:ready && t.doc ? {type:"auto", date:ready} : null, historique:hist.sort((a, b) => a.date.localeCompare(b.date))});
    }
    demandes.push({id:"dx", ref:"PG-26-01234", type:"naissance", typeLabel:"Copie ou extrait d'acte de naissance", service:"État civil", arr:2, prenom:"Prisca", nom:"Mengue", tel:"077 12 34 56", email:"", quartier:"Grand Village", details:"Copie intégrale pour dossier de passeport.", statut:"Prête", date:ago(3), montant:2000,
      paiement:{choix:"en ligne", statut:"Payé", mode:"Airtel Money", date:ago(2.98), quittance:addRec("Frais d'actes d'état civil", 2, 2000, "Prisca Mengue", "Airtel Money", ago(2.98), "Paiement en ligne"), transaction:"AM482913077"}, pj:[], document:{type:"auto", date:ago(1)},
      historique:[{date:ago(3), statut:"Nouvelle", note:"Demande reçue en ligne.", pub:true},{date:ago(2.98), statut:"Nouvelle", note:"Paiement reçu (Airtel Money) : 2 000 FCFA.", pub:true},{date:ago(2), statut:"En traitement", note:"Dossier pris en charge par le service État civil.", pub:true},{date:ago(1.6), statut:"En traitement", note:"Acte retrouvé dans le registre 2004, volume 3.", pub:false},{date:ago(1), statut:"Prête", note:"Votre document est prêt : téléchargez-le en ligne ou retirez-le au guichet.", pub:true}]});
    demandes.push({id:"dy", ref:"PG-26-01235", type:"residence", typeLabel:"Certificat de résidence", service:"État civil", arr:1, prenom:"Landry", nom:"Ogoula", tel:"074 55 66 77", email:"", quartier:"Cap Lopez", details:"", statut:"En traitement", date:ago(1), montant:2000, paiement:{choix:"guichet", statut:"À régler"}, pj:[], document:null,
      historique:[{date:ago(1), statut:"Nouvelle", note:"Demande reçue en ligne. Paiement prévu au guichet.", pub:true},{date:ago(.5), statut:"En traitement", note:"Dossier pris en charge par le service État civil.", pub:true}]});

    // Signalements (5 mois)
    const signalements = [], STS = STATUTS.signalements;
    for (let i = 0; i < 80; i++) {
      const [ty, lbl] = pick(TYPES_SIGNAL), arr = arrPick(), age = r() * 150, sp = SPEED[arr];
      const k = age > 20 * sp ? (r() < .85 ? 3 : 2) : Math.floor(r() * 4), p = person(), d0 = ago(age);
      const hist = [{date:d0, statut:"Nouveau", note:"Signalement reçu.", pub:true}];
      if (k) hist.push({date:ago(Math.max(0, age - .5 * sp)), statut:"Pris en charge", note:"Équipe des services techniques informée.", pub:true});
      if (k === 3) hist.push({date:ago(Math.max(0, age - (2 + r() * 8) * sp)), statut:"Résolu", note:"Intervention terminée.", pub:true});
      signalements.push({id:"s" + i, ref:"SIG-26-" + String(300 + i).padStart(4, "0"), type:ty, typeLabel:lbl, arr, quartier:pick(Q[arr]), lieu:pick(["Près du marché","Carrefour principal","Derrière l'école","Le long du canal","Face à la pharmacie","Entrée du quartier"]), description:{canal:"Le canal est envahi par les herbes et les déchets, l'eau déborde à chaque pluie.",ordures:"Dépôt sauvage d'ordures qui grossit depuis plusieurs jours.",eclairage:"Plusieurs lampadaires éteints, la rue est dans le noir la nuit.",voirie:"Nid-de-poule dangereux et regard sans couvercle.",anarchique:"Construction en cours sur l'emprise du canal.",autre:"Arbre tombé qui bloque une partie de la voie."}[ty], ...p, tel:tel(), priorite:ty === "canal" || ty === "voirie" ? "Haute" : pick(["Normale","Normale","Haute"]), statut:STS[k], date:d0, historique:hist});
    }

    // Registre d'état civil
    const actes = [];
    for (let i = 0; i < 90; i++) {
      const ty = r() < .62 ? "naissance" : r() < .55 ? "mariage" : "deces", arr = arrPick(), age = r() * 175, p = person();
      const a = {id:"a" + i, type:ty, arr, num:"", nom:p.nom, prenoms:p.prenom, sexe:pick(["M","F"]), dateEvt:ago(age + 2).slice(0, 10), lieu:"Port-Gentil", officier:"Officier d'état civil — " + arr + (arr === 1 ? "er" : "e") + " arrondissement", date:ago(age)};
      if (ty === "naissance") { a.pere = pick(P) + " " + p.nom; a.mere = pick(P) + " " + pick(N); a.lieu = pick(["Hôpital régional de Port-Gentil","Centre médical de Ntchengué","Domicile"]); }
      if (ty === "mariage") { const q = person(); a.conjoint = q.prenom + " " + q.nom; a.regime = pick(["Monogamie","Monogamie","Polygamie"]); }
      if (ty === "deces") a.lieu = pick(["Hôpital régional de Port-Gentil","Domicile"]);
      actes.push(a);
    }
    actes.sort((x, y) => x.date.localeCompare(y.date)).forEach((a, i) => a.num = {naissance:"N", mariage:"M", deces:"D"}[a.type] + "-2026-" + String(i + 101).padStart(5, "0"));

    // Autres recettes (6 mois)
    const RANGE = {"Droits de place (marchés)":[2000,25000],"Occupation du domaine public":[25000,300000],"Frais d'actes d'état civil":[1000,10000],"Permis de construire":[150000,1200000],"Taxe de voirie":[20000,250000],"Taxe sur la publicité":[50000,600000],"Location de salles":[50000,250000]};
    for (let i = 0; i < 190; i++) {
      const nat = pick(NATURES.filter(n => n !== "Frais d'actes d'état civil")), arr = arrPick(), age = r() * 182, p = person(), b = RANGE[nat];
      const growth = 0.75 + (182 - age) / 182 * 0.5; // recettes en hausse depuis la réorganisation
      addRec(nat, arr, Math.round((b[0] + r() * (b[1] - b[0])) * growth * W[arr] / 500) * 500, nat === "Droits de place (marchés)" ? "Commerçant · " + p.nom : p.prenom + " " + p.nom, r() < .5 - age / 600 ? pick(["Airtel Money","Carte bancaire"]) : pick(["Espèces","Espèces","Virement"]), ago(age), pick(["Agent de recouvrement 1","Agent de recouvrement 2","Guichet central"]));
    }

    // Personnel (échantillon)
    const SERV = [["État civil","Agent d'état civil"],["Services techniques","Agent de voirie"],["Services techniques","Chef d'équipe assainissement"],["Finances","Agent de recouvrement"],["Secrétariat général","Secrétaire"],["Police municipale","Agent de police municipale"],["Domaine public & marchés","Placier"],["Ressources humaines","Gestionnaire RH"],["Hygiène & salubrité","Agent d'hygiène"]];
    const agents = [];
    for (let i = 0; i < 60; i++) {
      const [service, poste] = pick(SERV), p = person(), pieces = {};
      ["Acte de naissance","Pièce d'identité","Diplôme","Contrat / arrêté","RIB","Photo"].forEach(x => pieces[x] = r() < .78);
      agents.push({id:"g" + i, matricule:"PG-" + String(1040 + i * 7).padStart(5, "0"), ...p, service, poste, arr:r() < .4 ? 0 : 1 + (i % 4), categorie:pick(["A","B","B","C","C","C"]), entree:String(1996 + Math.floor(r() * 30)), statut:r() < .94 ? "Actif" : "En congé", pieces});
    }

    // Stocks (mairie centrale + chaque arrondissement)
    const stocks = [
      {id:"k1", article:"Papier sécurisé pour actes d'état civil", unite:"rame", qte:6, seuil:10, service:"État civil", arr:0},
      {id:"k2", article:"Registres d'état civil (naissances)", unite:"registre", qte:14, seuil:5, service:"État civil", arr:0},
      {id:"k3", article:"Cartouches d'encre imprimantes", unite:"cartouche", qte:9, seuil:6, service:"État civil", arr:0},
      {id:"k5", article:"Sacs poubelles grande contenance", unite:"carton", qte:42, seuil:20, service:"Services techniques", arr:0},
      {id:"k6", article:"Gants et bottes de curage", unite:"paire", qte:18, seuil:25, service:"Services techniques", arr:0},
      {id:"k7", article:"Lampes d'éclairage public LED", unite:"lampe", qte:64, seuil:30, service:"Services techniques", arr:0},
      {id:"k8", article:"Carnets de quittances", unite:"carnet", qte:22, seuil:10, service:"Finances", arr:0},
    ];
    [[1,8],[2,12],[3,4],[4,7]].forEach(([a, q]) => stocks.push({id:"kp" + a, article:"Papier sécurisé pour actes d'état civil", unite:"rame", qte:q, seuil:5, service:"État civil", arr:a}));
    stocks.forEach(s => s.hist = [{date:ago(20), delta:s.qte + 12, motif:"Inventaire initial", by:"Magasin"}, {date:ago(6), delta:-12, motif:"Sortie pour le service", by:s.service}]);

    // Chantiers : 2 par arrondissement (budgets fictifs pour la démonstration)
    const CH = [
      [1,"Libération du domaine public – axe ASECNA – Cap Lopez","Cadre de vie",22e6,14e6,60,"En cours"],
      [1,"Assainissement Cora Wood – carrefour Léon Mba","Assainissement",35e6,30e6,85,"En cours"],
      [2,"Aménagement des abords du marché de Grand Village","Cadre de vie",48e6,20e6,40,"En cours"],
      [2,"Curage des canaux du 2e arrondissement","Assainissement",45e6,45e6,100,"Réalisé"],
      [3,"Éclairage public – axes du 3e arrondissement","Éclairage",60e6,8e6,10,"Programmé"],
      [3,"Curage des caniveaux du 3e arrondissement","Assainissement",40e6,22e6,55,"En cours"],
      [4,"Curage du canal principal de Lip Matanda","Assainissement",42e6,31.5e6,70,"En cours"],
      [4,"Regards d'assainissement – voie de Matiti 1 et 2","Assainissement",18e6,18e6,100,"Réalisé"],
      [0,"Réhabilitation des routes (programme PID/PIH)","Voirie",1.2e9,3.1e8,25,"En cours"],
    ];
    const chantiers = CH.map(([arr, titre, theme, budget, engage, avancement, statut], i) => ({id:"c" + i, titre, arr, theme, budget, engage, avancement, statut, debut:ago(40 + i * 15).slice(0, 10), fin:ago(-30 - i * 20).slice(0, 10), entreprise:i % 3 ? "Entreprise à désigner" : "Régie municipale", notes:[]}));

    const at = (d, h, m = 0) => { const x = new Date(Date.now() + d * 864e5); x.setHours(h, m, 0, 0); return x.toISOString(); };
    const agenda = [
      {id:"e1", titre:"Audience – Association des commerçants de Grand Village", type:"Audience", date:at(2, 10), lieu:"Cabinet du maire", arr:0},
      {id:"e2", titre:"Point d'étape – digitalisation des recettes", type:"Réunion", date:at(3, 11), lieu:"Direction des finances", arr:0},
      {id:"e3", titre:"Visite de chantier – axe ASECNA – Cap Lopez", type:"Terrain", date:at(4, 8, 30), lieu:"1er arrondissement", arr:1},
      {id:"e4", titre:"Visite du marché de Grand Village", type:"Terrain", date:at(5, 9), lieu:"2e arrondissement", arr:2},
      {id:"e5", titre:"Réunion des quatre maires d'arrondissement", type:"Réunion", date:at(6, 15), lieu:"Hôtel de ville", arr:0},
      {id:"e6", titre:"Rencontre avec les chefs de quartier", type:"Réunion", date:at(8, 10), lieu:"Mairie du 3e arrondissement", arr:3},
      {id:"e7", titre:"Visite de chantier – canal de Lip Matanda", type:"Terrain", date:at(9, 8, 30), lieu:"4e arrondissement", arr:4},
      {id:"e8", titre:"Session du conseil municipal", type:"Conseil", date:at(13, 9), lieu:"Salle des délibérations", arr:0},
    ];
    const publications = [
      {id:"pb1", type:"Communiqué", titre:"Saison des pluies : participez à la propreté des canaux", texte:"La mairie rappelle qu'il est interdit de jeter des déchets dans les canaux. Signalez tout canal bouché depuis la rubrique « Démarches » du site : vos signalements sont transmis directement aux services techniques.", arr:0, publie:true, date:ago(3)},
      {id:"pb2", type:"Avis", titre:"Vos documents téléchargeables en ligne", texte:"Les actes et certificats demandés en ligne peuvent désormais être réglés par Airtel Money ou carte bancaire, puis téléchargés dès qu'ils sont prêts, depuis la rubrique « Suivre mon dossier ».", arr:0, publie:true, date:ago(5)},
      {id:"pb3", type:"Communiqué", titre:"Libérez le domaine public : poursuite des opérations", texte:"Les propriétaires de constructions marquées sur le domaine public sont invités à libérer les emprises. Les opérations se poursuivent dans les quatre arrondissements.", arr:0, publie:true, date:ago(8)},
      {id:"pb4", type:"Recrutement", titre:"Brouillon – appel à candidatures (à valider)", texte:"Exemple de publication en attente de validation : elle n'apparaît pas encore sur le site public.", arr:0, publie:false, date:ago(1)},
    ];
    const contacts = [
      {id:"m1", nom:"Ghislain Ndjave", email:"g.ndjave@exemple.ga", tel:"", sujet:"Renseignement", message:"Bonjour, quels sont les jours de célébration des mariages à l'hôtel de ville ?", date:ago(1.3), lu:false, pj:[]},
      {id:"m2", nom:"Association des jeunes de Matanda", email:"ajm@exemple.ga", tel:"", sujet:"Partenariat", message:"Nous souhaitons organiser une journée de salubrité avec notre mairie d'arrondissement.", date:ago(4), lu:true, pj:[]},
    ];
    const journal = [
      {id:"j1", date:ago(0.2), user:"Gisèle Ondo", action:"Alerte stock", detail:"Papier sécurisé pour actes : 6 rames restantes (seuil 10). Le cabinet a été averti automatiquement.", arr:0},
      {id:"j2", date:ago(0.6), user:"Rodrigue Mabika", action:"Chantier mis à jour", detail:"Assainissement Cora Wood – carrefour Léon Mba : 85 %", arr:1},
      {id:"j3", date:ago(1.1), user:"Paiement en ligne", action:"Paiement reçu", detail:"PG-26-01234 · Airtel Money · 2 000 FCFA", arr:2},
    ];
    return {v:3, users, demandes, signalements, actes, agenda, recettes, agents, stocks, chantiers, publications, contacts, journal};
  }

  /* =========================================================
     MODE DÉMONSTRATION (localStorage)
     ========================================================= */
  const pub = o => ({ref:o.ref, typeId:o.type, type:o.typeLabel, statut:o.statut, date:o.date, arr:o.arr, prenom:o.prenom, nom:o.nom, quartier:o.quartier, montant:o.montant || 0, paiement:o.paiement || null, document:o.document || null, historique:(o.historique || []).filter(h => h.pub)});
  const Demo = {
    load() { let d; try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} if (!d || d.v !== 3) { d = seed(); db = d; this.save(); } db = d; },
    save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { throw new Error("Mémoire de démonstration pleine : fichier trop volumineux."); } },
    async init() { this.load(); let id; try { id = sessionStorage.getItem(SKEY); } catch (e) {} me = id ? db.users.find(u => u.id === id) || null : null; return me; },
    async initPublic() { this.load(); },
    async login(login, pwd) {
      this.load();
      const u = db.users.find(x => x.login.toLowerCase() === String(login).trim().toLowerCase() && x.pwd === pwd);
      if (u) { try { sessionStorage.setItem(SKEY, u.id); } catch (e) {} me = u; }
      return u || null;
    },
    async logout() { try { sessionStorage.removeItem(SKEY); } catch (e) {} me = null; },
    async add(col, o) { this.load(); const n = {id:uid(col[0]), date:now(), ...o}; db[col].unshift(n); this.save(); return n; },
    async update(col, id, patch) { this.load(); const o = db[col].find(x => x.id === id); if (!o) throw new Error("Élément introuvable"); Object.assign(o, patch); this.save(); return o; },
    async remove(col, id) { this.load(); db[col] = db[col].filter(x => x.id !== id); this.save(); },
    async submit(col, d) {
      this.load();
      const yr = String(new Date().getFullYear()).slice(2);
      const ref = col === "signalements" ? "SIG-" + yr + "-" + String(300 + db.signalements.length + 1).padStart(4, "0") : col === "demandes" ? "PG-" + yr + "-" + String(1000 + db.demandes.length + 1).padStart(5, "0") : null;
      const first = {demandes:"Nouvelle", signalements:"Nouveau"}[col];
      const n = {pj:[], ...d, id:uid(col[0]), date:now()};
      if (ref) Object.assign(n, {ref, statut:first, historique:[{date:now(), statut:first, note:col === "demandes" ? "Demande reçue en ligne." + (d.paiement && d.paiement.choix === "guichet" ? " Paiement prévu au guichet." : "") : "Signalement reçu.", pub:true}]});
      if (col === "contacts") n.lu = false;
      db[col].unshift(n);
      try { this.save(); } catch (e) { db[col].shift(); throw e; }
      return ref;
    },
    async suivi(ref, tel) {
      this.load(); ref = String(ref).trim().toUpperCase();
      const o = [...db.demandes, ...db.signalements].find(x => x.ref === ref);
      if (!o || telKey(o.tel) !== telKey(tel)) return null;
      return pub(o);
    },
    async pay(ref, tel, mode) {
      this.load(); const o = db.demandes.find(x => x.ref === String(ref).trim().toUpperCase());
      if (!o || telKey(o.tel) !== telKey(tel)) throw new Error("Dossier introuvable");
      if (o.paiement && o.paiement.statut === "Payé") return pub(o);
      const q = quittanceNo(), d = now(), tr = (mode === "Airtel Money" ? "AM" : "CB") + String(Date.now()).slice(-9);
      o.paiement = {choix:"en ligne", statut:"Payé", mode, date:d, quittance:q, transaction:tr};
      o.historique.push({date:d, statut:o.statut, note:`Paiement reçu (${mode}) : ${fcfa(o.montant)}.`, pub:true});
      db.recettes.unshift({id:uid("r"), quittance:q, nature:natureDe(o.type), arr:o.arr, montant:o.montant, payeur:o.prenom + " " + o.nom, mode, agent:"Paiement en ligne", date:d});
      db.journal.unshift({id:uid("j"), date:d, user:"Paiement en ligne", action:"Paiement reçu", detail:`${o.ref} · ${mode} · ${fcfa(o.montant)}`, arr:o.arr});
      this.save(); return pub(o);
    },
    async markDownloaded(ref, tel) {
      this.load(); const o = db.demandes.find(x => x.ref === ref);
      if (!o || telKey(o.tel) !== telKey(tel) || o.statut !== "Prête") return;
      o.statut = "Remise"; o.historique.push({date:now(), statut:"Remise", note:"Document téléchargé en ligne par le demandeur.", pub:true}); this.save();
    },
    async changePassword(pwd) { me.pwd = pwd; db.users.find(u => u.id === me.id).pwd = pwd; this.save(); },
    async createUser(u) {
      if (db.users.some(x => x.login.toLowerCase() === u.login.trim().toLowerCase())) throw new Error("Cet identifiant existe déjà");
      if ((u.password || "").length < 6) throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      const n = {id:uid("u"), role:u.role, arr:+u.arr || 0, login:u.login.trim(), pwd:u.password, prenom:u.prenom, nom:u.nom, titre:u.titre || ROLES[u.role].l};
      db.users.push(n); this.save(); return n;
    },
    async setPassword(id, pwd) { if ((pwd || "").length < 6) throw new Error("Le mot de passe doit contenir au moins 6 caractères"); db.users.find(u => u.id === id).pwd = pwd; this.save(); },
    async deleteUser(id) { if (id === me.id) throw new Error("Vous ne pouvez pas supprimer votre propre compte"); db.users = db.users.filter(u => u.id !== id); this.save(); },
    async reset() { try { localStorage.removeItem(KEY); } catch (e) {} this.load(); },
    subscribe(cb) { addEventListener("storage", e => { if (e.key === KEY) { const id = me && me.id; this.load(); me = db.users.find(u => u.id === id) || me; cb("all"); } }); },
  };

  /* =========================================================
     MODE RÉEL (Supabase) — table unique « records » (une ligne = un élément,
     colonne « col » = la rubrique, « arr » = l'arrondissement, « data » = le contenu)
     ========================================================= */
  function ready() {
    if (!readyP) readyP = new Promise((res, rej) => {
      const go = () => { sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey); res(sb); };
      if (window.supabase) return go();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
      s.onload = go; s.onerror = () => rej(new Error("Impossible de joindre la base de données"));
      document.head.appendChild(s);
    });
    return readyP;
  }
  const q = async p => { const {data, error} = await p; if (error) throw new Error(error.message); return data; };
  const fromRow = r => ({...r.data, id:r.id, arr:r.arr, date:r.data.date || r.created_at});
  const mapUser = p => ({id:p.id, role:p.role, arr:p.arr || 0, login:p.login, prenom:p.prenom, nom:p.nom, titre:p.titre});

  const Live = {
    async loadCol(col) { db[col] = (await q(sb.from("records").select("*").eq("col", col).order("created_at", {ascending:false}).limit(5000))).map(fromRow); },
    async loadAll() {
      await Promise.all(COLS.map(c => this.loadCol(c).catch(() => { db[c] = []; })));
      db.users = (await q(sb.from("profiles").select("*").order("nom"))).map(mapUser);
    },
    async init() {
      await ready();
      const {data:{session}} = await sb.auth.getSession();
      if (!session) return null;
      const p = await q(sb.from("profiles").select("*").eq("id", session.user.id).maybeSingle());
      if (!p) return null;
      me = mapUser(p); await this.loadAll(); return me;
    },
    async initPublic() { await ready(); db.publications = (await q(sb.rpc("public_publications"))).map(fromRow); },
    async login(login, pwd) {
      await ready();
      const {data, error} = await sb.auth.signInWithPassword({email:EMAIL(login), password:pwd});
      if (error || !data.user) return null;
      const p = await q(sb.from("profiles").select("*").eq("id", data.user.id).maybeSingle());
      if (!p) { await sb.auth.signOut(); return null; }
      return (me = mapUser(p));
    },
    async logout() { await ready(); await sb.auth.signOut(); me = null; },
    async add(col, o) {
      const id = uid(col[0]), data = {date:now(), ...o}; delete data.id;
      const row = await q(sb.from("records").insert({id, col, arr:+o.arr || 0, data}).select().single());
      const n = fromRow(row); db[col].unshift(n); return n;
    },
    async update(col, id, patch) {
      const o = db[col].find(x => x.id === id); if (!o) throw new Error("Élément introuvable");
      const merged = {...o, ...patch}; const data = {...merged}; delete data.id;
      await q(sb.from("records").update({arr:+merged.arr || 0, data}).eq("id", id));
      Object.assign(o, patch); return o;
    },
    async remove(col, id) { await q(sb.from("records").delete().eq("id", id)); db[col] = db[col].filter(x => x.id !== id); },
    async submit(col, d) { await ready(); return await q(sb.rpc("submit_public", {p_col:col, p_arr:+d.arr || 0, p_data:d})); },
    async suivi(ref, tel) { await ready(); return (await q(sb.rpc("suivi_dossier", {p_ref:String(ref).trim().toUpperCase(), p_tel:telKey(tel)}))) || null; },
    async pay(ref, tel, mode) { await ready(); return await q(sb.rpc("pay_public", {p_ref:String(ref).trim().toUpperCase(), p_tel:telKey(tel), p_mode:mode})); },
    async markDownloaded(ref, tel) { await ready(); await q(sb.rpc("mark_downloaded", {p_ref:ref, p_tel:telKey(tel)})).catch(() => {}); },
    async changePassword(pwd) { const {error} = await sb.auth.updateUser({password:pwd}); if (error) throw new Error(error.message); },
    async createUser(u) { await q(sb.rpc("admin_create_user", {p_login:u.login, p_password:u.password, p_role:u.role, p_arr:+u.arr || 0, p_prenom:u.prenom, p_nom:u.nom, p_titre:u.titre || ROLES[u.role].l})); db.users = (await q(sb.from("profiles").select("*").order("nom"))).map(mapUser); },
    async setPassword(id, pwd) { await q(sb.rpc("admin_set_password", {p_user:id, p_password:pwd})); },
    async deleteUser(id) { await q(sb.rpc("admin_delete_user", {p_user:id})); db.users = db.users.filter(u => u.id !== id); },
    async reset() {},
    subscribe(cb) {
      sb.channel("pog-live").on("postgres_changes", {event:"*", schema:"public", table:"records"}, async payload => {
        const col = (payload.new && payload.new.col) || (payload.old && payload.old.col);
        if (!col) return; try { await this.loadCol(col); } catch (e) { return; }
        cb(col, payload.new && payload.new.data);
      }).subscribe();
    },
  };

  const A = LIVE ? Live : Demo;
  const scope = list => me && me.arr ? list.filter(x => +x.arr === +me.arr) : list;

  return {
    LIVE, ROLES, STATUTS, NATURES, MODES, COLS, natureDe,
    init: () => A.init(),
    initPublic: () => A.initPublic(),
    db: () => db,
    current: () => me,
    user: id => db.users.find(u => u.id === id),
    can: mod => !!me && (ROLES[me.role].mods === "*" || ROLES[me.role].mods.includes(mod)),
    list: col => scope(db[col] || []),
    login: (l, p) => A.login(l, p),
    logout: () => A.logout(),
    changePassword: p => A.changePassword(p),
    add: (c, o) => A.add(c, o),
    update: (c, id, p) => A.update(c, id, p),
    remove: (c, id) => A.remove(c, id),
    async log(action, detail) { try { await A.add("journal", {user:me ? me.prenom + " " + me.nom : "Site public", action, detail, arr:me ? me.arr : 0}); } catch (e) {} },
    // Encaissement d'une démarche au guichet (back-office)
    async encaisser(demId, mode) {
      const o = db.demandes.find(x => x.id === demId); if (!o) throw new Error("Dossier introuvable");
      const qn = quittanceNo(), d = now();
      const r = await A.add("recettes", {quittance:qn, nature:natureDe(o.type), arr:o.arr, montant:o.montant, payeur:o.prenom + " " + o.nom, mode, agent:me.prenom + " " + me.nom, date:d});
      const h = (o.historique || []).concat([{date:d, statut:o.statut, note:`Paiement reçu au guichet (${mode}) : ${fcfa(o.montant)}.`, pub:true}]);
      await A.update("demandes", o.id, {paiement:{choix:"guichet", statut:"Payé", mode, date:d, quittance:qn}, historique:h});
      return r;
    },
    // Formulaires publics
    submitDemande: d => A.submit("demandes", d),
    submitSignalement: d => A.submit("signalements", d),
    addContact: d => A.submit("contacts", d),
    suivi: (ref, tel) => A.suivi(ref, tel),
    pay: (ref, tel, mode) => A.pay(ref, tel, mode),
    markDownloaded: (ref, tel) => A.markDownloaded(ref, tel),
    publicationsPubliques: () => (db.publications || []).filter(p => p.publie).sort((a, b) => b.date.localeCompare(a.date)),
    // Comptes
    createUser: u => A.createUser(u),
    setPassword: (id, p) => A.setPassword(id, p),
    deleteUser: id => A.deleteUser(id),
    reset: () => A.reset(),
    subscribe: cb => A.subscribe(cb),
  };
})();
