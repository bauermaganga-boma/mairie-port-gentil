/* Test mobile : boutons « Retour » toujours visibles + touche retour du téléphone.
   Usage : node tests/mobile-retour.js <url_base> [dossier_captures] */
const pp = require(process.env.PP || "puppeteer-core");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const B = process.argv[2] || "http://127.0.0.1:8090/", OUT = process.argv[3] || "";
const W = ms => new Promise(r => setTimeout(r, ms)); let fails = 0;
const check = (l, ok, i = "") => { console.log((ok ? "OK  " : "ECHEC ") + l, i); if (!ok) fails++; };
(async () => {
  const b = await pp.launch({executablePath:EDGE, headless:"new"}), p = await b.newPage(), errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.setViewport({width:390, height:844, isMobile:true, hasTouch:true});
  const vis = sel => p.$eval(sel, e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.top >= -1 && r.top < innerHeight; }).catch(() => false);
  const shot = async n => { if (OUT) await p.screenshot({path:OUT + "/" + n + ".png"}); };

  // 1. Menu principal
  await p.goto(B + "index.html", {waitUntil:"networkidle0"});
  check("accueil : pas de bouton retour d'en-tête", !(await vis(".hback")));
  await p.click(".burger"); await W(500);
  check("menu ouvert : bouton Retour visible en haut", await vis(".nav-back"));
  check("menu ouvert : ☰ devenu ✕", await p.$eval(".burger", e => e.classList.contains("on")));
  await shot("m-menu");
  await p.click(".nav-back"); await W(400);
  check("bouton Retour ferme le menu", !(await p.$eval("#nav", e => e.classList.contains("open"))));
  await p.click(".burger"); await W(400); await p.goBack(); await W(500);
  check("touche retour du téléphone ferme le menu", !(await p.$eval("#nav", e => e.classList.contains("open"))) && p.url().includes("index.html"));
  // menu ouvert puis défilement : la barre reste en haut
  await p.click(".burger"); await W(300); await p.evaluate(() => document.getElementById("nav").scrollTop = 400); await W(200);
  check("barre Retour du menu reste figée en haut", await vis(".nav-back")); await p.click(".nav-back"); await W(300);

  // 2. Page intérieure : bouton retour d'en-tête
  await p.click(".burger"); await W(300); await Promise.all([p.waitForNavigation(), p.evaluate(() => [...document.querySelectorAll("#nav a")].find(a => a.textContent.includes("Démarches")).click())]); await W(600);
  check("page Démarches : bouton ← dans l'en-tête", await vis(".hback"));
  await p.evaluate(() => scrollTo(0, 1500)); await W(300);
  check("bouton ← reste visible après défilement", await vis(".hback"));
  // fenêtre plein écran
  await p.evaluate(() => document.querySelector("[data-dem]").click()); await W(500);
  check("fenêtre : bouton Retour visible", await vis(".mback"));
  check("fenêtre plein écran sur mobile", await p.$eval("#modal .box", e => e.getBoundingClientRect().height >= innerHeight - 2));
  await shot("m-fenetre");
  await p.evaluate(() => document.querySelector("#modal .box").scrollTop = 600); await W(200);
  check("bouton Retour reste en haut de la fenêtre au défilement", await vis(".mback"));
  await p.click(".mback"); await W(300);
  check("bouton Retour ferme la fenêtre", !(await p.$eval("#modal", e => e.classList.contains("on"))));
  await p.evaluate(() => document.querySelector("[data-dem]").click()); await W(400); await p.goBack(); await W(500);
  check("touche retour ferme la fenêtre sans quitter la page", !(await p.$eval("#modal", e => e.classList.contains("on"))) && p.url().includes("demarches.html"));
  await Promise.all([p.waitForNavigation(), p.click(".hback")]); await W(500);
  check("bouton ← de l'en-tête revient à la page précédente", p.url().includes("index.html"));

  // 3. Galerie
  await p.goto(B + "actualites.html", {waitUntil:"networkidle0"}); await p.evaluate(() => document.querySelector("#gallery figure").click()); await W(500);
  check("galerie : bouton Retour visible", await vis(".lb-back")); await shot("m-galerie");
  await p.goBack(); await W(400);
  check("touche retour ferme la galerie", !(await p.$eval(".lightbox", e => e.classList.contains("on"))) && p.url().includes("actualites.html"));

  // 4. Back-office
  await p.goto(B + "espace.html", {waitUntil:"networkidle0"}); await p.evaluate(() => sessionStorage.clear());
  await p.type("#login", "arr2"); await p.type("#pwd", "arr2026"); await Promise.all([p.waitForNavigation(), p.click("#login-form button")]); await W(1200);
  check("BO tableau : pas de Retour au premier écran", !(await vis("#vback")));
  await p.evaluate(() => location.hash = "demandes"); await W(800);
  check("BO Demandes : bouton Retour visible", await vis("#vback"));
  await p.evaluate(() => scrollTo(0, 1200)); await W(300);
  check("BO : bouton Retour figé en haut au défilement", await vis("#vback")); await shot("m-bo-retour");
  await p.click("#vback"); await W(800);
  check("BO Retour → écran précédent (tableau de bord)", (await p.$eval("#vt", e => e.textContent)) === "Tableau de bord");
  await p.click("#sbt"); await W(500);
  check("BO menu latéral : « Fermer le menu » visible", await vis("#sbback")); await shot("m-bo-menu");
  await p.click("#sbback"); await W(400);
  check("BO : Fermer le menu", !(await p.$eval("#sb", e => e.classList.contains("open"))));
  await p.click("#sbt"); await W(300); await p.goBack(); await W(500);
  check("BO : touche retour ferme le menu latéral", !(await p.$eval("#sb", e => e.classList.contains("open"))) && p.url().includes("agents.html"));
  await p.evaluate(() => location.hash = "demandes"); await W(800); await p.click("#list [data-id]"); await W(500);
  check("BO fiche : bouton Retour visible", await vis(".mback"));
  await p.goBack(); await W(500);
  check("BO : touche retour ferme la fiche et reste sur Demandes", !(await p.$eval("#modal", e => e.classList.contains("on"))) && (await p.$eval("#vt", e => e.textContent)) === "Demandes");
  check("aucune erreur JS", !errs.length, errs.join(" | "));
  await b.close(); console.log(fails ? fails + " échec(s)" : "Tous les tests mobiles sont passés"); process.exit(fails ? 1 : 0);
})();
