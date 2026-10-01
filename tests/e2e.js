/* Test de bout en bout : node tests/e2e.js <url_base> [dossier_captures]  (puppeteer-core + Microsoft Edge)
   Parcours : demande en ligne avec pièce jointe + paiement Airtel Money → agent état civil passe « Prête »
   → l'usager télécharge son PDF → paiement au guichet → contact avec PJ → indicateurs (graphiques)
   → cloisonnement des arrondissements → tous les modules du cabinet → publication visible sur le site. */
const pp = require(process.env.PP || "puppeteer-core"), fs = require("fs"), path = require("path"), os = require("os");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const B = process.argv[2] || "http://127.0.0.1:8090/", OUT = process.argv[3] || "";
const W = ms => new Promise(r => setTimeout(r, ms)); let fails = 0;
const check = (l, ok, i = "") => { console.log((ok ? "OK  " : "ECHEC ") + l, i); if (!ok) fails++; };
(async () => {
  const DL = fs.mkdtempSync(path.join(os.tmpdir(), "pog-dl-"));
  const img = path.join(DL, "piece-identite.png");
  fs.writeFileSync(img, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR4nGNk+M/wn4GBgYGJAQoAAAD//wMAKQUDAZ0V6R0AAAAASUVORK5CYII=", "base64"));
  const b = await pp.launch({executablePath:EDGE, headless:"new"}), p = await b.newPage(), errs = [];
  const cdp = await p.target().createCDPSession(); await cdp.send("Page.setDownloadBehavior", {behavior:"allow", downloadPath:DL});
  p.on("pageerror", e => errs.push(e.message + " @ " + (e.stack || "").split(String.fromCharCode(10)).slice(1, 3).join(" "))); p.on("dialog", d => d.accept());
  await p.setViewport({width:1366, height:900});
  const txt = s => p.$eval(s, e => e.innerText).catch(() => "");
  const shot = async n => { if (OUT) await p.screenshot({path:OUT + "/" + n + ".png", fullPage:true}); };
  const waitFile = async re => { for (let i = 0; i < 30; i++) { const f = fs.readdirSync(DL).find(x => re.test(x) && !x.endsWith(".crdownload")); if (f) return f; await W(300); } return null; };
  const login = async (l, pw) => { await p.goto(B + "espace.html", {waitUntil:"networkidle0"}); await p.evaluate(() => sessionStorage.clear()); await p.type("#login", l); await p.type("#pwd", pw); await p.click("#login-form button"); await p.waitForNavigation(); await W(800); };

  // 1. Demande en ligne + pièce jointe + paiement Airtel Money
  await p.goto(B + "demarches.html?d=naissance#demande", {waitUntil:"networkidle0"});
  await p.select("#arr", "3"); await p.click("[data-next]");
  await p.type("#prenom", "Test"); await p.type("#nom", "Citoyen"); await p.type("#tel", "077112233"); await p.type("#quartier", "Grand Village");
  await p.evaluate(() => document.querySelectorAll(".fstep")[1].querySelector("[data-next]").click());
  const up = await p.$("#pj"); await up.uploadFile(img); await W(300);
  await p.evaluate(() => document.querySelectorAll(".fstep")[2].querySelector("[data-next]").click()); await W(200);
  check("étape paiement avec Airtel Money / carte / guichet", (await txt("#pay-step")).includes("Airtel Money") && (await txt("#pay-step")).includes("Payer à la mairie"));
  await shot("v2-paiement-etape");
  await p.evaluate(() => { document.querySelector(".fstep.on input[type=checkbox]").checked = true; }); await p.click("button[type=submit]"); await W(1200);
  await shot("v2-paiement-airtel");
  await p.$eval("#amn", e => e.value = ""); await p.type("#amn", "077112233"); await p.click("#pf button"); await W(500); await p.click("#ok"); await W(2000);
  check("paiement confirmé", (await txt("#modal")).includes("Paiement confirmé"));
  const ref = (await txt(".refbig")).trim(); check("numéro de dossier", /^PG-\d\d-\d{5}$/.test(ref), ref);
  await p.click("#dlr"); check("reçu PDF téléchargé", !!(await waitFile(/^recu-.*\.pdf$/)));
  // 2. Agent état civil : voit PJ + paiement, passe « Prête »
  await login("etat.civil", "agent2026");
  await p.goto(B + "agents.html#demandes"); await W(800);
  await p.type("[data-f=q]", ref); await W(300);
  check("liste : paiement Airtel visible", (await txt("#list")).includes("Payé · Airtel"));
  await p.click("#list [data-id]"); await W(400);
  check("fiche : pièce jointe visible", (await txt("#modal")).includes("piece-identite"));
  await p.select("#sf [name=statut]", "Prête"); await p.click("#sf button.btn-orange"); await W(800);
  // 3. Usager : suivi + téléchargement du document
  await p.goto(B + "demarches.html#suivi", {waitUntil:"networkidle0"}); await W(800);
  await p.$eval("#ref", e => e.value = ""); await p.$eval("#stel", e => e.value = "");
  await p.type("#ref", ref); await p.type("#stel", "077 11 22 33"); await p.click("#suivi-form button"); await W(800);
  await shot("v2-suivi");
  check("suivi : document prêt", (await txt("#suivi-out")).includes("Votre document est prêt"));
  await p.click("#dldoc"); check("document PDF téléchargé", !!(await waitFile(/extrait.*\.pdf$/)));
  await p.$eval("#stel", e => e.value = "000000"); await p.click("#suivi-form button"); await W(600);
  check("suivi refusé avec mauvais téléphone", !(await txt("#suivi-out")).includes("Historique"));
  // 4. Dossier à payer au guichet → encaissement par l'agent
  await login("arr1", "arr2026");
  await p.goto(B + "agents.html#demandes"); await W(800); await p.type("[data-f=q]", "PG-26-01235"); await W(300); await p.click("#list [data-id]"); await W(400);
  await p.click("#enc"); await W(1000);
  check("encaissement guichet + quittance", (await txt("#modal")).includes("QUITTANCE"));
  // 5. Contact avec pièce jointe
  await p.goto(B + "contact.html", {waitUntil:"networkidle0"});
  await p.type("#cnom", "Test Contact"); await p.type("#cmail", "t@exemple.ga"); await p.select("#cdest", "2"); await p.type("#cmsg", "Message avec PJ");
  const up2 = await p.$("#cpj"); await up2.uploadFile(img); await W(300); await p.click("#contact-form button[type=submit]"); await W(1200);
  check("contact envoyé avec PJ", (await txt(".toast")).includes("pièce"));
  await login("arr2", "arr2026"); await p.goto(B + "agents.html#contacts"); await W(800);
  check("arr2 reçoit le message et sa PJ", (await txt("#views")).includes("Message avec PJ") && (await txt("#views")).includes("piece-identite"));
  // 6. Indicateurs d'un maire d'arrondissement
  await p.goto(B + "agents.html#indicateurs"); await W(2500); await shot("v2-indicateurs-arr2");
  check("indicateurs arrondissement : 8 graphiques", await p.$$eval("canvas", c => c.filter(x => x.width > 0).length) === 8);
  // 7. Cabinet : indicateurs commune + comparatif + tous modules
  await p.goto(B + "espace.html?role=cabinet&demo=1", {waitUntil:"networkidle0"}); await p.waitForNavigation(); await W(900);
  await p.goto(B + "agents.html#indicateurs"); await W(2500); await shot("v2-indicateurs-maire");
  check("indicateurs maire : graphiques + comparatif", (await p.$$eval("canvas", c => c.length)) === 8 && (await txt("#cmp")).includes("4e arr."));
  for (const v of ["tableau","demandes","signalements","actes","agenda","recettes","agents","stocks","chantiers","publications","contacts","journal","compte"]) {
    await p.goto(B + "agents.html#" + v); await W(450); check("module " + v, (await txt("#views")).length > 50);
  }
  await p.goto(B + "agents.html#publications"); await W(500); await p.click("#new"); await W(300);
  await p.type("#pf [name=titre]", "Avis de test e2e"); await p.type("#pf [name=texte]", "Contenu"); await p.click("#pf button"); await W(800);
  await p.goto(B + "actualites.html", {waitUntil:"networkidle0"}); await W(500);
  check("publication visible sur le site", (await txt("#avis")).includes("Avis de test e2e"));
  // 8. Pages publiques : 4 arrondissements traités à égalité
  await p.goto(B + "arrondissements.html#arr3", {waitUntil:"networkidle0"}); await W(600);
  check("4 fiches arrondissement", (await p.$$eval(".arr-card", x => x.length)) === 4);
  check("focus 3e arrondissement", (await txt("#arr-focus")).includes("3e arrondissement"));
  await shot("v2-arrondissements");
  check("aucune erreur JS", !errs.length, errs.join(" | "));
  await p.setViewport({width:390, height:844, isMobile:true});
  for (const u of ["agents.html#indicateurs", "demarches.html", "arrondissements.html"]) { await p.goto(B + u, {waitUntil:"networkidle0"}); await W(1200); const sw = await p.evaluate(() => document.documentElement.scrollWidth); check("mobile sans débordement : " + u, sw <= 390, sw); }
  await shot("v2-mobile-arr");
  await b.close(); fs.rmSync(DL, {recursive:true, force:true});
  console.log(fails ? fails + " échec(s)" : "Tous les tests sont passés"); process.exit(fails ? 1 : 0);
})();
