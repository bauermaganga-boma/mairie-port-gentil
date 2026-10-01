/* Mairie de Port-Gentil — couche de données.
   • Mode réel : base Supabase (PostgreSQL + authentification + temps réel), activé dès que
     assets/js/config.js contient l'URL et la clé publique du projet.
   • Mode démonstration : données enregistrées dans le navigateur (localStorage).
   Toutes les pages utilisent la même interface : un cache en mémoire (lecture synchrone)
   chargé par init(), et des méthodes asynchrones pour les écritures. */
const Store = (() => {
  const CFG = window.ESM_CONFIG || {};
  const LIVE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const KEY = "pog_db_v2", SKEY = "pog_session";
  const EMAIL = login => String(login).trim().toLowerCase() + "@mairie-pog.local";
  const COLS = ["demandes","signalements","actes","agenda","recettes","agents","stocks","chantiers","publications","contacts","journal"];

  /* ---------- Rôles et droits ---------- */
  const ROLES = {
    maire:{l:"Cabinet du maire", mods:"*"},
    sg:{l:"Secrétariat général", mods:"*"},
    etatcivil:{l:"État civil", mods:["tableau","demandes","actes","stocks","journal","compte"]},
    technique:{l:"Services techniques", mods:["tableau","signalements","chantiers","stocks","compte"]},
    finances:{l:"Finances & recettes", mods:["tableau","recettes","chantiers","compte"]},
    rh:{l:"Ressources humaines", mods:["tableau","agents","compte"]},
    arrondissement:{l:"Mairie d'arrondissement", mods:["tableau","demandes","signalements","actes","agenda","recettes","chantiers","stocks","publications","compte"]},
  };
  const STATUTS = {
    demandes:["Nouvelle","En traitement","Pièce manquante","Prête","Remise","Rejetée"],
    signalements:["Nouveau","Pris en charge","En intervention","Résolu"],
    chantiers:["À l'étude","Programmé","En cours","Réalisé","Suspendu"],
  };
  const NATURES = ["Droits de place (marchés)","Occupation du domaine public","Frais d'actes d'état civil","Permis de construire","Taxe de voirie","Taxe sur la publicité","Location de salles"];

  let db = {users:[]}; COLS.forEach(c => db[c] = []);
  let me = null, sb = null, readyP = null;

  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = () => new Date().toISOString();

  /* =========================================================
     DONNÉES DE DÉMONSTRATION (personnes et chiffres fictifs)
     ========================================================= */
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function seed() {
    const r = rng(2026), pick = a => a[Math.floor(r() * a.length)], ago = d => new Date(Date.now() - d * 864e5).toISOString();
    const P = "Jean-Pierre Marie-Claire Ghislain Prisca Arsène Nadège Rodrigue Sylvie Landry Murielle Fabrice Christelle Hervé Laetitia Yannick Gisèle Brice Carine Ulrich Stessy Davy Ornella Serge Pélagie Cédric Merveille Junior Félicité Loïc Bertrande".split(" ");
    const N = "Moussavou Nzé Ondo Mba Obiang Ndong Mabika Boussougou Koumba Mouele Ella Oyane Mapangou Bivigou Engone Ntoutoume Mengue Assoumou Makaya Ekomi Ibinga Nkoghe Ango Mboumba Ogoula Rapontchombo Ndjave Okoumba Renombo Ayo".split(" ");
    const Q = {1:["Grand Village","Centre-ville","Bord de mer"],2:["Balise","Cité Shell","Château"],3:["Ntchengué Plaine","Mosquée","SNI"],4:["Matanda","Lip Matanda","Iguiri","Matiti 1","Matiti 2","Salsa","Boule-Noire 2","Quartier Sud"]};
    const person = () => ({prenom:pick(P), nom:pick(N)});
    const tel = () => "0" + pick(["62","66","74","77"]) + " " + String(Math.floor(r()*90+10)) + " " + String(Math.floor(r()*90+10)) + " " + String(Math.floor(r()*90+10));

    const users = [
      {id:"u1", role:"maire", arr:0, login:"maire", pwd:"pog2026", prenom:"Cabinet", nom:"du Maire", titre:"Cabinet du maire"},
      {id:"u2", role:"sg", arr:0, login:"secretariat", pwd:"admin2026", prenom:"Secrétariat", nom:"Général", titre:"Administrateur"},
      {id:"u3", role:"etatcivil", arr:0, login:"etat.civil", pwd:"agent2026", prenom:"Gisèle", nom:"Ondo", titre:"Chef du service central de l'état civil"},
      {id:"u4", role:"technique", arr:0, login:"services.techniques", pwd:"agent2026", prenom:"Rodrigue", nom:"Mabika", titre:"Directeur des services techniques"},
      {id:"u5", role:"finances", arr:0, login:"recettes", pwd:"agent2026", prenom:"Carine", nom:"Boussougou", titre:"Receveuse municipale"},
      {id:"u6", role:"rh", arr:0, login:"rh", pwd:"agent2026", prenom:"Hervé", nom:"Koumba", titre:"Responsable des ressources humaines"},
      {id:"u7", role:"arrondissement", arr:4, login:"arr4", pwd:"arr2026", prenom:"Mairie", nom:"du 4e arrondissement", titre:"Mairie du 4e arrondissement"},
      {id:"u8", role:"arrondissement", arr:1, login:"arr1", pwd:"arr2026", prenom:"Mairie", nom:"du 1er arrondissement", titre:"Mairie du 1er arrondissement"},
    ];

    // Demandes en ligne / guichet
    const demandes = [], STD = STATUTS.demandes;
    const types = DEMARCHES.filter(d => !d.signal);
    for (let i = 0; i < 46; i++) {
      const t = pick(types), p = person(), arr = 1 + Math.floor(r() * 4), age = r() * 55;
      let k = age > 30 ? (r() < .7 ? 4 : r() < .5 ? 5 : 3) : age > 10 ? Math.floor(r() * 4) : (r() < .6 ? 0 : 1);
      const st = STD[k], hist = [{date:ago(age), statut:"Nouvelle", note:"Demande reçue " + (r() < .7 ? "en ligne" : "au guichet") + ".", pub:true}];
      if (k >= 1) hist.push({date:ago(age - 1), statut:"En traitement", note:"Dossier pris en charge par le service " + t.service + ".", pub:true});
      if (k === 2) hist.push({date:ago(age - 2), statut:"Pièce manquante", note:"Merci de fournir une copie lisible de votre pièce d'identité.", pub:true});
      if (k >= 3 && k !== 5) hist.push({date:ago(age - 3), statut:"Prête", note:"Votre document est prêt : retrait au guichet de la mairie muni de votre pièce d'identité.", pub:true});
      if (k === 4) hist.push({date:ago(age - 6), statut:"Remise", note:"Document remis au demandeur.", pub:true});
      if (k === 5) hist.push({date:ago(age - 4), statut:"Rejetée", note:"Acte introuvable dans les registres de la commune : rapprochez-vous du lieu de naissance.", pub:true});
      demandes.push({id:"d" + i, ref:"PG-26-" + String(1180 + i).padStart(5, "0"), type:t.id, typeLabel:t.t, service:t.service, arr, ...p, tel:tel(), email:"", quartier:pick(Q[arr]), details:t.id === "audience" ? "Présentation d'un projet associatif de quartier." : "", statut:st, date:ago(age), historique:hist});
    }
    demandes.push({id:"dx", ref:"PG-26-01234", type:"naissance", typeLabel:"Copie ou extrait d'acte de naissance", service:"État civil", arr:4, prenom:"Prisca", nom:"Mengue", tel:"077 12 34 56", email:"", quartier:"Lip Matanda", details:"Copie intégrale pour dossier de passeport.", statut:"En traitement", date:ago(2),
      historique:[{date:ago(2), statut:"Nouvelle", note:"Demande reçue en ligne.", pub:true},{date:ago(1), statut:"En traitement", note:"Dossier pris en charge par le service État civil.", pub:true},{date:ago(1), statut:"En traitement", note:"Acte retrouvé dans le registre 2004, volume 3.", pub:false}]});

    // Signalements
    const signalements = [], STS = STATUTS.signalements;
    for (let i = 0; i < 28; i++) {
      const [ty, lbl] = pick(TYPES_SIGNAL), arr = r() < .4 ? 4 : 1 + Math.floor(r() * 4), age = r() * 40, k = age > 20 ? 3 : Math.floor(r() * 4);
      const p = person();
      signalements.push({id:"s" + i, ref:"SIG-26-" + String(410 + i).padStart(4, "0"), type:ty, typeLabel:lbl, arr, quartier:pick(Q[arr]), lieu:pick(["Près du marché","Carrefour principal","Derrière l'école","Le long du canal","Face à la pharmacie","Entrée du quartier"]), description:{canal:"Le canal est envahi par les herbes et les déchets, l'eau déborde à chaque pluie.",ordures:"Dépôt sauvage d'ordures qui grossit depuis plusieurs jours.",eclairage:"Plusieurs lampadaires éteints, la rue est dans le noir la nuit.",voirie:"Nid-de-poule dangereux et regard sans couvercle.",anarchique:"Construction en cours sur l'emprise du canal.",autre:"Arbre tombé qui bloque une partie de la voie."}[ty], ...p, tel:tel(), priorite:ty === "canal" || ty === "voirie" ? "Haute" : pick(["Normale","Normale","Haute"]), statut:STS[k], date:ago(age),
        historique:[{date:ago(age), statut:"Nouveau", note:"Signalement reçu.", pub:true}].concat(k ? [{date:ago(age - 1), statut:STS[k], note:k === 3 ? "Intervention terminée par l'équipe de voirie." : "Équipe des services techniques informée.", pub:true}] : [])});
    }

    // Registre d'état civil
    const actes = [], sexe = ["M","F"];
    for (let i = 0; i < 64; i++) {
      const ty = r() < .62 ? "naissance" : r() < .55 ? "mariage" : "deces", arr = 1 + Math.floor(r() * 4), age = r() * 120, p = person();
      const a = {id:"a" + i, type:ty, arr, num:"", nom:p.nom, prenoms:p.prenom, sexe:pick(sexe), dateEvt:ago(age + 2).slice(0, 10), lieu:"Port-Gentil", officier:"Officier d'état civil — " + arr + (arr === 1 ? "er" : "e") + " arrondissement", date:ago(age)};
      if (ty === "naissance") { a.pere = pick(P) + " " + p.nom; a.mere = pick(P) + " " + pick(N); a.lieu = pick(["Hôpital régional de Port-Gentil","Centre médical de Ntchengué","Domicile"]); }
      if (ty === "mariage") { const q = person(); a.conjoint = q.prenom + " " + q.nom; a.regime = pick(["Monogamie","Monogamie","Polygamie"]); }
      if (ty === "deces") a.lieu = pick(["Hôpital régional de Port-Gentil","Domicile"]);
      actes.push(a);
    }
    actes.sort((x, y) => x.date.localeCompare(y.date)).forEach((a, i) => a.num = {naissance:"N", mariage:"M", deces:"D"}[a.type] + "-2026-" + String(i + 101).padStart(5, "0"));

    // Recettes (6 mois)
    const recettes = [];
    for (let i = 0; i < 150; i++) {
      const nat = pick(NATURES), arr = 1 + Math.floor(r() * 4), age = r() * 175;
      const base = {"Droits de place (marchés)":[2000,25000],"Occupation du domaine public":[25000,300000],"Frais d'actes d'état civil":[1000,10000],"Permis de construire":[150000,1200000],"Taxe de voirie":[20000,250000],"Taxe sur la publicité":[50000,600000],"Location de salles":[50000,250000]}[nat];
      const p = person();
      recettes.push({id:"r" + i, quittance:"Q-26-" + String(5200 + i).padStart(6, "0"), nature:nat, arr, montant:Math.round((base[0] + r() * (base[1] - base[0])) / 500) * 500, payeur:nat === "Droits de place (marchés)" ? "Commerçant · " + p.nom : p.prenom + " " + p.nom, mode:pick(["Espèces","Espèces","Mobile money","Mobile money","Virement"]), agent:pick(["Agent de recouvrement 1","Agent de recouvrement 2","Guichet central"]), date:ago(age)});
    }

    // Personnel (échantillon de démonstration)
    const SERV = [["État civil","Agent d'état civil"],["Services techniques","Agent de voirie"],["Services techniques","Chef d'équipe assainissement"],["Finances","Agent de recouvrement"],["Secrétariat général","Secrétaire"],["Police municipale","Agent de police municipale"],["Domaine public & marchés","Placier"],["Ressources humaines","Gestionnaire RH"],["Hygiène & salubrité","Agent d'hygiène"]];
    const agents = [];
    for (let i = 0; i < 52; i++) {
      const [service, poste] = pick(SERV), p = person(), pieces = {};
      ["Acte de naissance","Pièce d'identité","Diplôme","Contrat / arrêté","RIB","Photo"].forEach(x => pieces[x] = r() < .78);
      agents.push({id:"g" + i, matricule:"PG-" + String(1040 + i * 7).padStart(5, "0"), ...p, service, poste, arr:r() < .55 ? 0 : 1 + Math.floor(r() * 4), categorie:pick(["A","B","B","C","C","C"]), entree:String(1996 + Math.floor(r() * 30)), statut:r() < .94 ? "Actif" : "En congé", pieces});
    }

    // Stocks
    const stocks = [
      {id:"k1", article:"Papier sécurisé pour actes d'état civil", unite:"rame", qte:6, seuil:10, service:"État civil", arr:0},
      {id:"k2", article:"Registres d'état civil (naissances)", unite:"registre", qte:14, seuil:5, service:"État civil", arr:0},
      {id:"k3", article:"Cartouches d'encre imprimantes", unite:"cartouche", qte:9, seuil:6, service:"État civil", arr:0},
      {id:"k4", article:"Papier sécurisé pour actes d'état civil", unite:"rame", qte:3, seuil:5, service:"État civil", arr:4},
      {id:"k5", article:"Sacs poubelles grande contenance", unite:"carton", qte:42, seuil:20, service:"Services techniques", arr:0},
      {id:"k6", article:"Gants et bottes de curage", unite:"paire", qte:18, seuil:25, service:"Services techniques", arr:0},
      {id:"k7", article:"Lampes d'éclairage public LED", unite:"lampe", qte:64, seuil:30, service:"Services techniques", arr:0},
      {id:"k8", article:"Carnets de quittances", unite:"carnet", qte:22, seuil:10, service:"Finances", arr:0},
    ];
    stocks.forEach(s => s.hist = [{date:ago(20), delta:s.qte + 12, motif:"Inventaire initial", by:"Magasin"}, {date:ago(6), delta:-12, motif:"Sortie pour le service", by:s.service}]);

    // Chantiers (dotations et budgets fictifs pour la démonstration)
    const chantiers = [
      {id:"c1", titre:"Curage du canal principal de Lip Matanda", arr:4, theme:"Assainissement", budget:42000000, engage:31500000, avancement:70, statut:"En cours", debut:ago(60).slice(0,10), fin:ago(-30).slice(0,10), entreprise:"Régie municipale", notes:[{date:ago(5), texte:"Deuxième tronçon désherbé, évacuation des déchets en cours."}]},
      {id:"c2", titre:"Regards d'assainissement – voie de Matiti 1 et 2", arr:4, theme:"Assainissement", budget:18000000, engage:18000000, avancement:100, statut:"Réalisé", debut:ago(240).slice(0,10), fin:ago(200).slice(0,10), entreprise:"Régie municipale", notes:[]},
      {id:"c3", titre:"Éclairage public – axe Matanda – Iguiri", arr:4, theme:"Éclairage", budget:65000000, engage:12000000, avancement:15, statut:"En cours", debut:ago(20).slice(0,10), fin:ago(-120).slice(0,10), entreprise:"Entreprise à désigner", notes:[]},
      {id:"c4", titre:"Aménagement et salubrité du marché de Camp Boiro", arr:4, theme:"Cadre de vie", budget:38000000, engage:0, avancement:0, statut:"Programmé", debut:ago(-30).slice(0,10), fin:ago(-150).slice(0,10), entreprise:"", notes:[]},
      {id:"c5", titre:"Voirie secondaire – quartier Grand Village", arr:1, theme:"Voirie", budget:120000000, engage:54000000, avancement:40, statut:"En cours", debut:ago(75).slice(0,10), fin:ago(-90).slice(0,10), entreprise:"Entreprise à désigner", notes:[]},
      {id:"c6", titre:"Curage des canaux – 2e arrondissement", arr:2, theme:"Assainissement", budget:45000000, engage:20000000, avancement:55, statut:"En cours", debut:ago(50).slice(0,10), fin:ago(-20).slice(0,10), entreprise:"Régie municipale", notes:[]},
      {id:"c7", titre:"Éclairage public – 3e arrondissement", arr:3, theme:"Éclairage", budget:60000000, engage:8000000, avancement:10, statut:"Programmé", debut:ago(-10).slice(0,10), fin:ago(-160).slice(0,10), entreprise:"", notes:[]},
      {id:"c8", titre:"Libération du domaine public – Grand Village", arr:1, theme:"Cadre de vie", budget:15000000, engage:15000000, avancement:100, statut:"Réalisé", debut:ago(270).slice(0,10), fin:ago(260).slice(0,10), entreprise:"Régie municipale", notes:[]},
    ];

    const at = (d, h, m = 0) => { const x = new Date(Date.now() + d * 864e5); x.setHours(h, m, 0, 0); return x.toISOString(); };
    const agenda = [
      {id:"e1", titre:"Audience – Association des commerçants de Camp Boiro", type:"Audience", date:at(2, 10), lieu:"Cabinet du maire", arr:0},
      {id:"e2", titre:"Visite de chantier – canal de Lip Matanda", type:"Terrain", date:at(4, 8, 30), lieu:"Lip Matanda", arr:4},
      {id:"e3", titre:"Réunion des quatre maires d'arrondissement", type:"Réunion", date:at(6, 15), lieu:"Hôtel de ville", arr:0},
      {id:"e4", titre:"Session du conseil municipal", type:"Conseil", date:at(13, 9), lieu:"Salle des délibérations", arr:0},
      {id:"e5", titre:"Point d'étape – digitalisation des recettes", type:"Réunion", date:at(3, 11), lieu:"Direction des finances", arr:0},
    ];
    const publications = [
      {id:"pb1", type:"Communiqué", titre:"Saison des pluies : participez à la propreté des canaux", texte:"La mairie rappelle qu'il est interdit de jeter des déchets dans les canaux. Signalez tout canal bouché depuis la rubrique « Démarches » du site : vos signalements sont transmis directement aux services techniques.", arr:0, publie:true, date:ago(3)},
      {id:"pb2", type:"Avis", titre:"Retrait des actes d'état civil", texte:"Les usagers dont la demande est indiquée « Prête » peuvent retirer leur document au guichet de l'état civil, munis de leur pièce d'identité et de leur numéro de dossier.", arr:0, publie:true, date:ago(6)},
      {id:"pb3", type:"Communiqué", titre:"4e arrondissement : sensibilisation à Lip Matanda", texte:"Les constructions sur l'emprise des canaux aggravent les inondations. Les équipes de la mairie d'arrondissement poursuivent leurs passages de sensibilisation dans le quartier.", arr:4, publie:true, date:ago(9)},
      {id:"pb4", type:"Recrutement", titre:"Brouillon – appel à candidatures (à valider)", texte:"Exemple de publication en attente de validation : elle n'apparaît pas encore sur le site public.", arr:0, publie:false, date:ago(1)},
    ];
    const contacts = [
      {id:"m1", nom:"Ghislain Ndjave", email:"g.ndjave@exemple.ga", tel:"", sujet:"Renseignement", message:"Bonjour, quels sont les jours de célébration des mariages à l'hôtel de ville ?", date:ago(1.3), lu:false},
      {id:"m2", nom:"Association des jeunes de Matanda", email:"ajm@exemple.ga", tel:"", sujet:"Partenariat", message:"Nous souhaitons organiser une journée de salubrité avec la mairie du 4e arrondissement.", date:ago(4), lu:true},
    ];
    const journal = [
      {id:"j1", date:ago(0.2), user:"Gisèle Ondo", action:"Alerte stock", detail:"Papier sécurisé pour actes : 6 rames restantes (seuil 10). Le cabinet a été averti automatiquement."},
      {id:"j2", date:ago(0.6), user:"Rodrigue Mabika", action:"Chantier mis à jour", detail:"Curage du canal principal de Lip Matanda : 70 %"},
      {id:"j3", date:ago(1.1), user:"Carine Boussougou", action:"Encaissement", detail:"Quittance Q-26-005349 · Droits de place (marchés)"},
    ];
    return {v:2, users, demandes, signalements, actes, agenda, recettes, agents, stocks, chantiers, publications, contacts, journal};
  }

  /* =========================================================
     MODE DÉMONSTRATION (localStorage)
     ========================================================= */
  const Demo = {
    load() { let d; try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} if (!d || d.v !== 2) { d = seed(); db = d; this.save(); } db = d; },
    save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} },
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
      const ref = col === "signalements" ? "SIG-" + yr + "-" + String(410 + db.signalements.length + 1).padStart(4, "0") : col === "demandes" ? "PG-" + yr + "-" + String(1180 + db.demandes.length + 1).padStart(5, "0") : null;
      const first = {demandes:"Nouvelle", signalements:"Nouveau"}[col];
      const n = {...d, id:uid(col[0]), date:now()};
      if (ref) Object.assign(n, {ref, statut:first, historique:[{date:now(), statut:first, note:col === "demandes" ? "Demande reçue en ligne." : "Signalement reçu.", pub:true}]});
      if (col === "contacts") n.lu = false;
      db[col].unshift(n); this.save(); return ref;
    },
    async suivi(ref) {
      this.load(); ref = String(ref).trim().toUpperCase();
      const o = [...db.demandes, ...db.signalements].find(x => x.ref === ref);
      return o ? {ref:o.ref, type:o.typeLabel, statut:o.statut, date:o.date, arr:o.arr, historique:o.historique.filter(h => h.pub)} : null;
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
    async suivi(ref) { await ready(); const r = await q(sb.rpc("suivi_dossier", {p_ref:String(ref).trim().toUpperCase()})); return r || null; },
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
    LIVE, ROLES, STATUTS, NATURES, COLS,
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
    // Formulaires publics
    submitDemande: d => A.submit("demandes", d),
    submitSignalement: d => A.submit("signalements", d),
    addContact: d => A.submit("contacts", d),
    suivi: ref => A.suivi(ref),
    publicationsPubliques: () => (db.publications || []).filter(p => p.publie).sort((a, b) => b.date.localeCompare(a.date)),
    // Comptes
    createUser: u => A.createUser(u),
    setPassword: (id, p) => A.setPassword(id, p),
    deleteUser: id => A.deleteUser(id),
    reset: () => A.reset(),
    subscribe: cb => A.subscribe(cb),
  };
})();
