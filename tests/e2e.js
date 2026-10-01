/* Test de bout en bout : node tests/e2e.js <url_base> (puppeteer-core + Edge) */
const pp = require(process.env.PP || "puppeteer-core");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const B = process.argv[2] || "http://127.0.0.1:8090/", OUT = process.argv[3] || "";
const W = ms => new Promise(r => setTimeout(r, ms)); let fails = 0;
const check = (l, ok, i = "") => { console.log((ok ? "OK  " : "ECHEC ") + l, i); if (!ok) fails++; };
(async () => {
  const b = await pp.launch({executablePath:EDGE, headless:"new"}), p = await b.newPage(), errs = [];
  p.on("pageerror", e => errs.push(e.message + " @ " + (e.stack || "").split(String.fromCharCode(10)).slice(1, 3).join(" "))); p.on("dialog", d => d.accept());
  await p.setViewport({width:1366, height:900});
  const txt = s => p.$eval(s, e => e.innerText).catch(() => "");
  const shot = async n => { if (OUT) await p.screenshot({path:OUT + "/" + n + ".png", fullPage:true}); };
  // 1. Demande en ligne
  await p.goto(B + "demarches.html?d=naissance#demande", {waitUntil:"networkidle0"});
  await p.select("#arr", "4"); await p.click("[data-next]");
  await p.type("#prenom", "Test"); await p.type("#nom", "Citoyen"); await p.type("#tel", "077112233"); await p.type("#quartier", "Matanda");
  await p.evaluate(() => document.querySelectorAll(".fstep")[1].querySelector("[data-next]").click());
  await p.evaluate(() => { document.querySelector(".fstep.on input[type=checkbox]").checked = true; }); await p.click("button[type=submit]"); await W(1200);
  const ref = (await txt(".refbig")).trim(); check("demande enregistrée", /^PG-\d\d-\d{5}$/.test(ref), ref);
  // 2. Signalement
  await p.goto(B + "demarches.html?d=signalement#demande", {waitUntil:"networkidle0"});
  await p.select("#arr", "4"); await p.click("[data-next]");
  await p.type("#prenom", "Test"); await p.type("#nom", "Riverain"); await p.type("#tel", "066112233"); await p.type("#quartier", "Lip Matanda");
  await p.evaluate(() => document.querySelectorAll(".fstep")[1].querySelector("[data-next]").click());
  await p.type("#lieu", "Derrière l'école"); await p.type("#description", "Canal bouché");
  await p.evaluate(() => { document.querySelector(".fstep.on input[type=checkbox]").checked = true; }); await p.click("button[type=submit]"); await W(1200);
  const sref = (await txt(".refbig")).trim(); check("signalement enregistré", /^SIG-/.test(sref), sref);
  // 3. Agent état civil traite la demande
  await p.goto(B + "espace.html", {waitUntil:"networkidle0"}); await p.evaluate(() => sessionStorage.clear());
  await p.type("#login", "etat.civil"); await p.type("#pwd", "agent2026"); await p.click("#login-form button"); await p.waitForNavigation(); await W(800);
  check("tableau de bord état civil", (await txt("#views")).includes("demandes en cours")); await shot("bo-etatcivil-tableau");
  await p.goto(B + "agents.html#demandes"); await W(800);
  await p.type("[data-f=q]", ref); await W(300); await p.click("#list [data-id]"); await W(400);
  await p.select("#sf [name=statut]", "Prête"); await p.click("#sf button.btn-orange"); await W(800);
  check("demande passée à Prête", (await txt("#list")).includes("Prête"));
  // stock : sortie sous le seuil -> alerte
  await p.goto(B + "agents.html#stocks"); await W(700); await shot("bo-stocks");
  await p.click("[data-mv=out]"); await W(300); await p.type("#mf [name=q]", "2"); await p.click("#mf button"); await W(1200);
  check("alerte stock journalisée", (await p.evaluate(() => JSON.parse(localStorage.pog_db_v2).journal[0].action)) === "Alerte stock");
  // registre
  await p.goto(B + "agents.html#actes"); await W(700); await p.click("#new"); await W(300);
  await p.type("#af [name=nom]", "Essono"); await p.type("#af [name=prenoms]", "Bébé"); await p.click("#af button"); await W(1000);
  check("acte enregistré + extrait", (await txt("#modal")).includes("EXTRAIT"));
  // 4. Suivi public
  await p.goto(B + "demarches.html?ref=" + ref + "#suivi", {waitUntil:"networkidle0"}); await W(800);
  check("suivi public à jour", (await txt("#suivi-out")).includes("Prête"));
  // 5. Arrondissement 4 voit le signalement, pas ceux des autres
  await p.goto(B + "espace.html?role=arrondissement", {waitUntil:"networkidle0"});
  await p.type("#login", "arr4"); await p.type("#pwd", "arr2026"); await p.click("#login-form button"); await p.waitForNavigation(); await W(800);
  await p.goto(B + "agents.html#signalements"); await W(800);
  const st = await txt("#list"); check("arr4 voit son signalement", st.includes(sref)); check("arr4 ne voit que le 4e", !/[123](er|e) arr\./.test(st));
  // 6. Cabinet : tous les modules
  await p.goto(B + "espace.html?role=cabinet&demo=1", {waitUntil:"networkidle0"}); await p.waitForNavigation(); await W(900);
  await shot("bo-maire-tableau");
  for (const v of ["demandes","signalements","actes","agenda","recettes","agents","stocks","chantiers","publications","contacts","journal","compte"]) {
    await p.goto(B + "agents.html#" + v); await W(500);
    const ok = (await txt("#views")).length > 50; check("module " + v, ok); if (["recettes","chantiers","agents","agenda"].includes(v)) await shot("bo-" + v);
  }
  // publication -> site public
  await p.goto(B + "agents.html#publications"); await W(500); await p.click("#new"); await W(300);
  await p.type("#pf [name=titre]", "Avis de test e2e"); await p.type("#pf [name=texte]", "Contenu"); await p.click("#pf button"); await W(800);
  await p.goto(B + "actualites.html", {waitUntil:"networkidle0"}); await W(500);
  check("publication visible sur le site", (await txt("#avis")).includes("Avis de test e2e"));
  check("aucune erreur JS", !errs.length, errs.join(" | "));
  // mobile back-office
  await p.setViewport({width:390, height:844, isMobile:true}); await p.goto(B + "agents.html#tableau"); await W(800); await shot("bo-mobile");
  const sw = await p.evaluate(() => document.documentElement.scrollWidth); check("pas de débordement mobile BO", sw <= 390, sw);
  await b.close(); console.log(fails ? fails + " échec(s)" : "Tous les tests sont passés"); process.exit(fails ? 1 : 0);
})();
