/* Mairie de Port-Gentil — comportements du site public */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IMG = n => `assets/img/${n}.jpg`;
const escH = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fdate = d => new Date(d).toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"});
const arrL = n => !+n ? "Mairie centrale" : n + (+n === 1 ? "er" : "e") + " arrondissement";
const arrS = n => n + (+n === 1 ? "er" : "e");
const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } };

function toast(msg, type = "") {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.className = "toast " + type; t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("on"));
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 3400);
}

function modal(title, html) {
  let m = $("#modal");
  if (!m) {
    m = document.createElement("div"); m.id = "modal"; m.className = "modal";
    m.innerHTML = '<div class="box" role="dialog" aria-modal="true"><div class="mh"><h3></h3><button class="x" aria-label="Fermer">×</button></div><div class="mb"></div></div>';
    document.body.appendChild(m);
    m.addEventListener("click", e => { if ((e.target === m || e.target.closest(".x")) && !m.dataset.lock) m.classList.remove("on"); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !m.dataset.lock) m.classList.remove("on"); });
  }
  delete m.dataset.lock;
  $("h3", m).textContent = title; $(".mb", m).innerHTML = html; m.classList.add("on");
  return m;
}
const closeModal = () => { const m = $("#modal"); if (m) { delete m.dataset.lock; m.classList.remove("on"); } };

/* ---------- Chargement de bibliothèques (à la demande) ---------- */
const _scripts = {};
function loadScript(src) {
  return _scripts[src] || (_scripts[src] = new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Chargement impossible, vérifiez votre connexion.")); document.head.appendChild(s); }));
}

/* ---------- Documents authentifiés : badge ---------- */
function acteBadge(a, big) {
  if (!a) return "";
  const ok = a.statut === "Authentifié", bad = a.statut === "Rejeté";
  return `<div class="auth-badge ${ok ? "ok" : bad ? "bad" : "wait"} ${big ? "big" : ""}"><span class="shield">${ok ? ICONS.shieldok : ICONS.shield}</span><span><b>${typeDocL(a.type)} n° ${escH(a.numAff || a.num)} — ${ok ? "Authentifié" : bad ? "Non conforme" : "À authentifier"}</b><small>${ok ? `Original vérifié${a.authDate ? " le " + fdate(a.authDate) : ""}${a.source === "registre" ? " (registre numérique de la commune)" : ""} : il ne vous sera plus demandé. Vos duplicatas, renouvellements et légalisations se font en ligne, vous passez seulement récupérer.` : bad ? "Le document présenté n'a pas été reconnu : rapprochez-vous du service de l'état civil." : "Première fois : présentez l'original UNE SEULE FOIS au guichet. Ensuite, ce numéro sera reconnu pour toutes vos démarches."}</small></span></div>`;
}

/* ---------- Pièces jointes : photos compressées, PDF limités ---------- */
const PJ_MAX = 3, PDF_MAX = 900 * 1024;
const fileToDataURL = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
async function compressImage(f) {
  const url = await fileToDataURL(f), img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const k = Math.min(1, 1400 / Math.max(img.width, img.height)), c = document.createElement("canvas");
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", .72);
}
async function readFiles(input) {
  const files = [...(input && input.files || [])];
  if (files.length > PJ_MAX) throw new Error(`${PJ_MAX} fichiers maximum.`);
  const out = [];
  for (const f of files) {
    if (/^image\//.test(f.type)) out.push({nom:f.name.replace(/\.\w+$/, "") + ".jpg", type:"image/jpeg", data:await compressImage(f)});
    else if (f.type === "application/pdf") { if (f.size > PDF_MAX) throw new Error(`« ${f.name} » dépasse 900 Ko : envoyez une photo ou un PDF plus léger.`); out.push({nom:f.name, type:f.type, data:await fileToDataURL(f)}); }
    else throw new Error(`« ${f.name} » : seuls les photos et les PDF sont acceptés.`);
  }
  out.forEach(x => x.taille = Math.round(x.data.length * .75 / 1024));
  return out;
}
function bindFileList(input, box) {
  if (!input || !box) return;
  input.addEventListener("change", () => {
    const fs = [...input.files];
    if (fs.length > PJ_MAX) { toast(`${PJ_MAX} fichiers maximum.`, "err"); input.value = ""; }
    box.innerHTML = [...input.files].map(f => `<span class="pjchip">${ICONS.file}${escH(f.name)} <small>${Math.round(f.size / 1024)} Ko</small></span>`).join("");
  });
}
const pjLinks = list => (list || []).map(p => `<a class="pjchip" href="${p.data}" download="${escH(p.nom)}">${ICONS.file}${escH(p.nom)} <small>${p.taille || ""} Ko</small></a>`).join("");

/* ---------- Documents PDF (document délivré, reçu de paiement) ---------- */
const DOC_TITRES = {"naissance":"EXTRAIT D'ACTE DE NAISSANCE","decl-naissance":"ACTE DE NAISSANCE","deces":"COPIE D'ACTE DE DÉCÈS","copie-mariage":"COPIE D'ACTE DE MARIAGE","residence":"CERTIFICAT DE RÉSIDENCE","permis":"PERMIS DE CONSTRUIRE","domaine":"AUTORISATION D'OCCUPATION DU DOMAINE PUBLIC","place":"AUTORISATION D'EMPLACEMENT AU MARCHÉ"};
const verifCode = ref => { let h = 7; for (const c of ref) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h.toString(36).toUpperCase().padStart(7, "0").slice(-7); };
const pdfMoney = n => Math.round(n || 0).toLocaleString("fr-FR").replace(/ | /g, " ") + " FCFA";
async function newPdf() {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const doc = new window.jspdf.jsPDF({unit:"mm", format:"a4"});
  // En-tête aux couleurs de la ville
  doc.setFillColor(7, 50, 90); doc.rect(0, 0, 210, 34, "F");
  doc.setFillColor(10, 138, 85); doc.rect(0, 34, 70, 2, "F"); doc.setFillColor(242, 194, 48); doc.rect(70, 34, 70, 2, "F"); doc.setFillColor(20, 119, 181); doc.rect(140, 34, 70, 2, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("RÉPUBLIQUE GABONAISE", 105, 10, {align:"center"});
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text("Union – Travail – Justice", 105, 14.5, {align:"center"});
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.text("MAIRIE DE PORT-GENTIL", 105, 24, {align:"center"});
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.text("Province de l'Ogooué-Maritime", 105, 29.5, {align:"center"});
  // Filigrane
  doc.setTextColor(232, 236, 242); doc.setFont("helvetica", "bold"); doc.setFontSize(54);
  doc.text("DÉMONSTRATION", 105, 175, {align:"center", angle:35});
  doc.setTextColor(15, 28, 51);
  return doc;
}
function pdfRows(doc, y, rows) {
  doc.setFontSize(10.5);
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal"); doc.setTextColor(91, 107, 133); doc.text(k, 25, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(7, 50, 90); doc.text(doc.splitTextToSize(String(v), 105), 85, y);
    doc.setDrawColor(220, 226, 235); doc.line(25, y + 3, 185, y + 3); y += 10;
  });
  doc.setTextColor(15, 28, 51); return y;
}
function pdfFoot(doc, code) {
  doc.setDrawColor(7, 50, 90); doc.setLineWidth(.6); doc.circle(160, 245, 15); doc.setLineWidth(.2); doc.circle(160, 245, 12.5);
  doc.setFontSize(6.5); doc.setTextColor(7, 50, 90); doc.text("MAIRIE DE", 160, 243, {align:"center"}); doc.text("PORT-GENTIL", 160, 247, {align:"center"});
  doc.setFontSize(9); doc.setTextColor(15, 28, 51); doc.text("L'officier d'état civil / Le maire", 160, 266, {align:"center"});
  doc.setFontSize(8); doc.setTextColor(91, 107, 133);
  doc.text(`Code de vérification : ${code}  ·  à contrôler sur le site de la mairie, rubrique « Suivre mon dossier »`, 105, 282, {align:"center"});
  doc.text("Document de démonstration généré en ligne — sans valeur légale.", 105, 287, {align:"center"});
}
async function downloadDocument(r) {
  if (r.document && r.document.type === "fichier" && r.document.data) {
    const a = document.createElement("a"); a.href = r.document.data; a.download = r.document.nom || (r.ref + ".pdf"); a.click(); return;
  }
  const doc = await newPdf(), titre = DOC_TITRES[r.typeId] || (r.type || "").toUpperCase(), ben = `${r.prenom} ${(r.nom || "").toUpperCase()}`;
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(7, 50, 90); doc.text(titre, 105, 54, {align:"center"});
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(91, 107, 133); doc.text(`${arrL(r.arr)} · Dossier ${r.ref}`, 105, 61, {align:"center"});
  const intro = {
    residence:`Le maire de la commune de Port-Gentil certifie que ${ben} réside sur le territoire de la commune, au quartier ${r.quartier || "—"} (${arrL(r.arr)}).`,
    permis:`Le maire de la commune de Port-Gentil autorise ${ben} à réaliser les travaux décrits dans le dossier ${r.ref}, sous réserve du respect des règles d'urbanisme en vigueur.`,
    domaine:`Le maire de la commune de Port-Gentil autorise ${ben} à occuper temporairement le domaine public au quartier ${r.quartier || "—"}, dans les conditions fixées par la mairie.`,
    place:`Le maire de la commune de Port-Gentil attribue à ${ben} un emplacement dans un marché municipal, dans les conditions fixées par le règlement des marchés.`,
  }[r.typeId] || `Délivré à ${ben}, conformément aux mentions portées au registre d'état civil de la commune de Port-Gentil.`;
  doc.setFontSize(11); doc.setTextColor(15, 28, 51); doc.text(doc.splitTextToSize(intro, 160), 25, 76);
  const docNo = "DOC-" + r.ref.replace(/^PG-/, "");
  pdfRows(doc, 100, [["N° du document", docNo], ...(r.acte ? [[typeDocL(r.acte.type) + " n°", (r.acte.numAff || r.acte.num) + (r.acte.statut === "Authentifié" ? "  (authentifié)" : "")]] : []), ["Bénéficiaire", ben], ["Quartier", r.quartier || "—"], ["Arrondissement", arrL(r.arr)], ["N° de dossier", r.ref], ["Demande déposée le", fdate(r.date)], ["Délivré le", fdate((r.document && r.document.date) || new Date())], ["Code de vérification", verifCode(r.ref)]]);
  doc.setFontSize(10); doc.text(`Fait à Port-Gentil, le ${fdate((r.document && r.document.date) || new Date())}.`, 25, 206);
  pdfFoot(doc, verifCode(r.ref));
  doc.save(`${titre.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}-${r.ref}.pdf`);
}
async function downloadRecu(r) {
  const p = r.paiement || {}, doc = await newPdf();
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(7, 50, 90); doc.text("REÇU DE PAIEMENT", 105, 54, {align:"center"});
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(91, 107, 133); doc.text(`Quittance ${p.quittance || "—"}`, 105, 61, {align:"center"});
  const y = pdfRows(doc, 80, [["Démarche", r.type], ["N° de dossier", r.ref], ["Payé par", `${r.prenom} ${r.nom}`], ["Date du paiement", p.date ? new Date(p.date).toLocaleString("fr-FR") : "—"], ["Moyen de paiement", p.mode || "—"], ["Référence de transaction", p.transaction || "Guichet"], ["Arrondissement", arrL(r.arr)]]);
  doc.setFillColor(226, 245, 236); doc.roundedRect(25, y + 4, 160, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(10, 138, 85); doc.text(`Montant réglé : ${pdfMoney(r.montant)}`, 105, y + 15.5, {align:"center"});
  pdfFoot(doc, verifCode(r.ref + (p.quittance || "")));
  doc.save(`recu-${p.quittance || r.ref}.pdf`);
}

/* ---------- Paiement en ligne (simulation de démonstration) ---------- */
function payFlow(r, tel) {
  return new Promise(resolve => {
    const m = modal("Paiement en ligne · " + fcfa(r.montant), `
      <p class="lead-p" style="margin-bottom:1rem">${escH(r.type)} — dossier <b>${r.ref}</b></p>
      <div class="paytabs">${PAIEMENT.modes.map((x, i) => `<button type="button" class="paytab ${i ? "" : "on"}" data-m="${x.id}" style="--c:${x.c}"><span class="plogo ${x.id}">${x.id === "airtel" ? "airtel<br>money" : "VISA · MC"}</span><span><b>${x.l}</b><small>${x.s}</small></span></button>`).join("")}</div>
      <div id="paybody"></div>
      <p class="demo-pay">${ICONS.lock} Mode démonstration : aucun débit réel. En production, le paiement passe par la plateforme sécurisée d'un prestataire agréé (Airtel Money, banque) et la mairie ne voit jamais les données de carte.</p>`);
    const body = $("#paybody", m);
    const done = async mode => {
      body.innerHTML = `<div class="paywait"><span class="spin"></span><p>Validation du paiement…</p></div>`;
      try { const res = await Store.pay(r.ref, tel, mode); await new Promise(x => setTimeout(x, 900)); resolve(res); }
      catch (e) { body.innerHTML = `<p class="alert-box">${ICONS.alert}<span>${escH(e.message)}</span></p>`; delete m.dataset.lock; }
    };
    const show = id => {
      $$(".paytab", m).forEach(b => b.classList.toggle("on", b.dataset.m === id));
      if (id === "airtel") {
        body.innerHTML = `<form class="form" id="pf"><div class="field"><label for="amn">Numéro Airtel Money</label><input id="amn" name="num" type="tel" required pattern="0?[7][4-7][0-9\\s]{6,9}" placeholder="074 00 00 00" value="${escH(/^0?7[4-7]/.test(tel.replace(/\D/g, "")) ? tel : "")}"></div>
          <p style="font-size:.86rem;color:var(--muted)">Vous allez recevoir une demande de paiement sur votre téléphone. Validez-la avec votre code secret Airtel Money (ne le communiquez jamais à personne, pas même à la mairie).</p>
          <button class="btn btn-orange" style="justify-content:center">Payer ${fcfa(r.montant)}</button></form>`;
        $("#pf", m).onsubmit = e => {
          e.preventDefault(); m.dataset.lock = 1;
          body.innerHTML = `<div class="paywait"><span class="spin"></span><p><b>Demande envoyée au ${escH(e.target.num.value)}</b><br>Validez le paiement sur votre téléphone…</p><button type="button" class="btn btn-navy btn-sm" id="ok">J'ai validé sur mon téléphone</button></div>`;
          const t = setTimeout(() => done("Airtel Money"), 4500); $("#ok", m).onclick = () => { clearTimeout(t); done("Airtel Money"); };
        };
      } else {
        body.innerHTML = `<div class="cbmock"><div class="cbh">${ICONS.lock} Page de paiement sécurisée du prestataire <small>(simulation)</small></div>
          <div class="field"><label>Numéro de carte (carte de test)</label><input value="4242 4242 4242 4242" readonly></div>
          <div class="row"><div class="field"><label>Expiration</label><input value="12/29" readonly></div><div class="field"><label>Cryptogramme</label><input value="•••" readonly></div></div>
          <button class="btn btn-orange" id="cbpay" style="justify-content:center;width:100%">Payer ${fcfa(r.montant)}</button></div>`;
        $("#cbpay", m).onclick = () => { m.dataset.lock = 1; body.innerHTML = `<div class="paywait"><span class="spin"></span><p><b>Authentification 3-D Secure</b><br>Confirmation auprès de votre banque…</p></div>`; setTimeout(() => done("Carte bancaire"), 2200); };
      }
    };
    $$(".paytab", m).forEach(b => b.onclick = () => show(b.dataset.m));
    show("airtel");
  });
}
function paidModal(r) {
  modal("Paiement confirmé ✅", `<p class="lead-p">Merci ! Votre paiement de <b>${fcfa(r.montant)}</b> par <b>${escH(r.paiement.mode)}</b> est enregistré.</p>
    <div class="panel" style="margin:1.2rem 0;box-shadow:none;text-align:center"><small style="color:var(--muted)">Numéro de dossier</small><div class="refbig">${r.ref}</div><small style="color:var(--muted)">Quittance ${r.paiement.quittance}</small></div>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn btn-orange" id="dlr">${ICONS.dl} Télécharger le reçu (PDF)</button><a class="btn btn-navy" href="demarches.html#suivi" id="gos">${ICONS.search} Suivre mon dossier</a></div>
    <p style="color:var(--muted);font-size:.88rem;margin-top:1rem">Dès que le service aura préparé votre document, vous pourrez le télécharger depuis « Suivre mon dossier ».</p>`);
  $("#dlr").onclick = () => downloadRecu(r).catch(e => toast(e.message, "err"));
  $("#gos").onclick = () => { closeModal(); if (location.pathname.endsWith("demarches.html")) setTimeout(() => window.__suivi && window.__suivi(r.ref), 50); };
}

/* ---------- En-tête & pied de page ---------- */
function renderChrome() {
  const page = document.body.dataset.page;
  const links = [["index","Accueil"],["mairie","La Mairie"],["arrondissements","Arrondissements"],["demarches","Démarches"],["projets","Projets"],["actualites","Actualités"],["contact","Contact"]];
  const tel = MAIRIE.tels[0];
  const h = $("#site-header");
  if (h) h.outerHTML = `
  <div class="progress"></div>
  <div class="topbar"><div class="wrap">
    <div class="tb-l"><span>${ICONS.pin}Hôtel de ville · Port-Gentil, Ogooué-Maritime</span>${tel ? `<a href="tel:+241${tel.replace(/\s/g,"").slice(1)}">${ICONS.phone}${tel}</a>` : ""}${MAIRIE.email ? `<a href="mailto:${MAIRIE.email}">${ICONS.mail}${MAIRIE.email}</a>` : ""}<a href="${MAIRIE.facebook}" target="_blank" rel="noopener">${ICONS.fb}Ville de Port-Gentil</a></div>
    <div class="tb-r"><a href="demarches.html#suivi">${ICONS.search}Suivre mon dossier</a><a href="espace.html">${ICONS.lock}Espace agents</a></div>
  </div></div>
  <header class="header"><div class="wrap">
    <a class="brand" href="index.html"><img src="assets/img/logo-pog.svg" alt="Emblème de la Mairie de Port-Gentil"><span><b>Mairie de<br>Port-Gentil</b><small>Capitale économique du Gabon</small></span></a>
    <nav class="nav" id="nav">${links.map(([k,l]) => `<a href="${k}.html" class="${k===page?"active":""}">${l}</a>`).join("")}<a class="nav-agent" href="espace.html">${ICONS.lock} Espace agents</a><a class="btn btn-orange" href="demarches.html#demande">Démarches en ligne</a></nav>
    <button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div></header>`;

  const f = $("#site-footer");
  if (f) f.outerHTML = `
  <footer class="footer"><div class="wrap"><div class="grid">
    <div>
      <a class="logo-w" href="index.html"><img src="assets/img/logo-pog.svg" alt="Mairie de Port-Gentil"><span>Mairie de<br>Port-Gentil</span></a>
      <p>La commune de Port-Gentil, chef-lieu de l'Ogooué-Maritime, sur l'île Mandji : une mairie centrale et quatre mairies d'arrondissement au service des habitants.</p>
      <div class="socials">
        <a href="${MAIRIE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.fb}</a>
        ${MAIRIE.whatsapp ? `<a href="https://wa.me/${MAIRIE.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.wa}</a>` : ""}
        <a href="contact.html" aria-label="Écrire à la mairie">${ICONS.mail}</a>
      </div>
    </div>
    <div><h4>La commune</h4><ul>
      <li><a href="mairie.html">Le maire & le conseil</a></li>${ARRONDISSEMENTS.map(a => `<li><a href="arrondissements.html#arr${a.n}">Mairie du ${a.t}</a></li>`).join("")}<li><a href="projets.html">Projets & chantiers</a></li><li><a href="actualites.html">Actualités & avis</a></li>
    </ul></div>
    <div><h4>Démarches</h4><ul>
      <li><a href="demarches.html?c=etat-civil">État civil</a></li><li><a href="demarches.html?d=mariage#demande">Mariage</a></li><li><a href="demarches.html?c=urbanisme">Urbanisme & domaine public</a></li><li><a href="demarches.html?d=signalement#demande">Signaler un problème</a></li><li><a href="demarches.html#suivi">Suivre, payer, télécharger</a></li><li><a href="contact.html">Écrire à la mairie</a></li>
    </ul></div>
    <div><h4>Espace numérique</h4>
      <ul><li><a href="espace.html?role=cabinet">Cabinet du maire</a></li><li><a href="espace.html?role=services">Services municipaux</a></li><li><a href="espace.html?role=arrondissement">Mairies d'arrondissement</a></li></ul>
      <div class="staff-box"><b>Vous êtes agent municipal ?</b><p>Accédez au back-office pour traiter les demandes, encaisser, tenir les registres et suivre vos indicateurs.</p><a class="btn btn-orange btn-sm" href="espace.html">${ICONS.lock} Accès agents</a></div>
    </div>
  </div>
  <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${MAIRIE.nom} · ${MAIRIE.adresse}</span><span class="paylogos"><span class="plogo airtel">airtel money</span><span class="plogo carte">VISA · MC</span> Paiement en ligne sécurisé</span></div>
  <div class="foot-credit">© ${new Date().getFullYear()} Tous droits réservés · Site conçu et développé par <b>Rouana</b></div>
  </div></footer>
  ${MAIRIE.whatsapp ? `<a class="wa" href="https://wa.me/${MAIRIE.whatsapp}?text=${encodeURIComponent("Bonjour, je souhaite un renseignement auprès de la Mairie de Port-Gentil.")}" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp">${ICONS.wa}</a>`
    : `<a class="wa fab-sig" href="demarches.html?d=signalement#demande" aria-label="Signaler un problème">${ICONS.alert}<span>Signaler</span></a>`}
  <button class="totop" aria-label="Haut de page">↑</button>`;
}

function initChrome() {
  const header = $(".header"), prog = $(".progress"), top = $(".totop");
  const onScroll = () => {
    const y = scrollY, H = document.documentElement.scrollHeight - innerHeight;
    header && header.classList.toggle("scrolled", y > 30);
    if (prog) prog.style.width = (H > 0 ? (y / H) * 100 : 0) + "%";
    top && top.classList.toggle("on", y > 600);
  };
  addEventListener("scroll", onScroll, {passive:true}); onScroll();
  top && top.addEventListener("click", () => scrollTo({top:0, behavior:"smooth"}));
  const b = $(".burger"), nav = $("#nav");
  b && b.addEventListener("click", () => { const o = nav.classList.toggle("open"); b.setAttribute("aria-expanded", o); });
}

/* ---------- Animations ---------- */
function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), {threshold:.12});
  $$(".rv:not(.in)").forEach(el => io.observe(el));
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting || e.target.dataset.done) return; co.unobserve(e.target); e.target.dataset.done = 1;
    const el = e.target, to = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1600;
    const step = t => { const p = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - p, 3)); el.textContent = (dec ? v.toFixed(dec).replace(".", ",") : Math.round(v).toLocaleString("fr-FR")) + (el.dataset.suffix || ""); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), {threshold:.1});
  $$("[data-count]:not([data-done])").forEach(el => co.observe(el));
}

function initHero() {
  const figs = $$(".hero-slides figure"); if (!figs.length) return;
  const dots = $(".hero-dots"); let i = 0, h;
  dots.innerHTML = figs.map((_, k) => `<button aria-label="Diapositive ${k+1}" class="${k?"":"on"}"></button>`).join("");
  const go = k => { figs[i].classList.remove("on"); dots.children[i].classList.remove("on"); i = (k + figs.length) % figs.length; figs[i].classList.add("on"); dots.children[i].classList.add("on"); };
  const play = () => { clearInterval(h); h = setInterval(() => go(i + 1), 6500); };
  [...dots.children].forEach((d, k) => d.addEventListener("click", () => { go(k); play(); }));
  play();
}

/* ---------- Démarches ---------- */
function demCard(d) {
  const c = CAT_DEM[d.cat];
  return `<article class="fcard dcard rv" data-cat="${d.cat}" style="--c:${c.c}"><span class="tag" style="background:color-mix(in srgb,${c.c} 12%,#fff);color:${c.c}">${c.l}</span>
    <div class="ic">${ICONS[d.ic]}</div><h3>${d.t}</h3><p>${d.d}</p>
    <div class="dmeta"><span class="price ${d.prix ? "" : "free"}">${fcfa(d.prix)}</span>${d.doc ? `<span class="dl">${ICONS.dl} Téléchargeable</span>` : ""}</div>${d.acte ? `<p class="dauth">${ICONS.shieldok}<span>100 % en ligne si votre acte est authentifié</span></p>` : ""}
    <div class="dact"><button class="more" data-dem="${d.id}">Pièces à prévoir</button><a class="btn btn-orange btn-sm" href="demarches.html?d=${d.id}#demande">${d.signal ? "Signaler" : "Faire la demande"}</a></div></article>`;
}
function initDemarches() {
  const box = $("#dem-grid"); if (!box) return;
  const limit = +box.dataset.limit || 0, tabs = $("#dem-tabs");
  const render = cat => {
    let list = DEMARCHES.filter(d => cat === "tout" || d.cat === cat); if (limit) list = list.slice(0, limit);
    box.innerHTML = list.map(demCard).join("");
    requestAnimationFrame(() => $$(".rv", box).forEach((el, k) => setTimeout(() => el.classList.add("in"), k * 40)));
  };
  if (tabs) {
    const counts = {tout:DEMARCHES.length}; DEMARCHES.forEach(d => counts[d.cat] = (counts[d.cat] || 0) + 1);
    const opts = [["tout","Toutes"], ...Object.entries(CAT_DEM).map(([k, v]) => [k, v.l])];
    tabs.innerHTML = opts.map(([k, l]) => `<button class="tab" data-n="${k}">${l}<span class="n">${counts[k] || 0}</span></button>`).join("");
    const set = k => { $$(".tab", tabs).forEach(t => t.classList.toggle("on", t.dataset.n === k)); render(k); };
    tabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) set(t.dataset.n); });
    const st = new URLSearchParams(location.search).get("c"); set(CAT_DEM[st] ? st : "tout");
  } else render("tout");
  box.addEventListener("click", e => {
    const b = e.target.closest("[data-dem]"); if (!b) return;
    const d = DEMARCHES.find(x => x.id === b.dataset.dem);
    modal(d.t, `<p class="chip info" style="margin-bottom:1rem">${CAT_DEM[d.cat].l} · Service : ${d.service}</p><p class="lead-p">${d.d}</p>
      <div class="kv" style="margin-top:1rem"><div><small>Tarif</small><b>${fcfa(d.prix)}</b></div><div><small>Paiement</small><b>${d.prix ? "En ligne ou à la mairie" : "—"}</b></div><div><small>Document</small><b>${d.doc ? "Téléchargeable en PDF" : "Retrait au guichet"}</b></div></div>
      <h4 style="margin:1rem 0 .6rem;color:var(--navy)">À prévoir (vous pouvez les joindre en ligne)</h4><ul class="checks" style="margin:0 0 1rem">${d.pieces.map(p => `<li>${p}</li>`).join("")}</ul>
      <p style="color:var(--muted);font-size:.84rem">${PAIEMENT.note} Liste indicative : le service peut demander une pièce complémentaire.</p>
      <div style="display:flex;gap:.6rem;margin-top:1.4rem;flex-wrap:wrap"><a class="btn btn-orange" href="demarches.html?d=${d.id}#demande">${d.signal ? "Signaler maintenant" : "Faire la demande en ligne"}</a></div>`);
  });
}

function initDemandeForm() {
  const form = $("#demande-form"); if (!form) return;
  const sel = $("[name=type]", form), sig = $("#sig-fields", form), std = $("#std-fields", form), ts = $("[name=sigtype]", form), qList = $("#quartiers");
  sel.innerHTML = '<option value="">— Choisir une démarche —</option>' + Object.entries(CAT_DEM).map(([k, c]) => `<optgroup label="${c.l}">${DEMARCHES.filter(d => d.cat === k).map(d => `<option value="${d.id}">${d.t}${d.prix ? " — " + fcfa(d.prix) : ""}</option>`).join("")}</optgroup>`).join("");
  ts.innerHTML = TYPES_SIGNAL.map(([k, l]) => `<option value="${k}">${l}</option>`).join("");
  qList.innerHTML = QUARTIERS.map(q => `<option value="${q}">`).join("");
  bindFileList($("#pj", form), $("#pj-list", form));
  const cur = () => DEMARCHES.find(x => x.id === sel.value);
  const af = $("#acte-fields", form), ta = $("#typeActe", form);
  if (ta) ta.innerHTML = TYPES_DOC.map(([k, l]) => `<option value="${k}">${l}</option>`).join("");
  const verif = async () => {
    const d = cur(), res = $("#acte-res", form), num = $("#numActe", form).value, nom = $("#nomActe", form).value || $("#nom", form).value;
    if (!num.trim()) { res.innerHTML = ""; return null; }
    const type = d.acte === "tout" ? ta.value : d.acte;
    res.innerHTML = '<p class="empty" style="padding:.6rem">Vérification…</p>';
    let a = null; try { a = await Store.verifDoc(num, nom, type); } catch (e) {}
    res.innerHTML = a ? acteBadge({...a, num}) : acteBadge({numAff:num, type, statut:"En attente"}) + '<small class="imgnote">Numéro pas encore connu de la plateforme : il sera inscrit avec votre demande.</small>';
    return a;
  };
  if (af) { $("#verif", form).onclick = verif; $("#numActe", form).addEventListener("change", verif); }
  const sync = () => {
    const d = cur(), isSig = !!(d && d.signal);
    if (af) {
      af.hidden = !(d && d.acte); $("#numActe", form).required = !!(d && d.acte); $("#acte-res", form).innerHTML = "";
      if (d && d.acte) { $("#ta-field", form).hidden = d.acte !== "tout"; $("#acte-label", form).textContent = d.acte === "tout" ? "Numéro du document" : "Numéro de votre " + typeDocL(d.acte).toLowerCase(); }
    }
    sig.hidden = !isSig; std.hidden = isSig;
    $$("input,select,textarea", sig).forEach(i => i.required = isSig && i.dataset.req === "1");
    $("#dem-info").innerHTML = d ? `<b>${d.t}</b> — ${d.d}<br><small>À prévoir : ${d.pieces.join(" · ")}</small><div class="dmeta" style="margin-top:.6rem"><span class="price ${d.prix ? "" : "free"}">${fcfa(d.prix)}</span>${d.doc ? `<span class="dl">${ICONS.dl} Document téléchargeable en PDF</span>` : ""}</div>` : "";
    $("#pj-label").textContent = isSig ? "Photos du problème (facultatif, 3 maximum)" : "Pièces justificatives (facultatif : photos ou PDF, 3 maximum)";
    const pay = $("#pay-step");
    if (!d) return;
    pay.innerHTML = d.prix ? `<p class="lead-p">Montant de la démarche : <b class="price">${fcfa(d.prix)}</b></p>
      <div class="paychoice">${PAIEMENT.modes.map((m, i) => `<label class="pc"><input type="radio" name="payer" value="${m.id}" ${i ? "" : "checked"}><span class="plogo ${m.id}">${m.id === "airtel" ? "airtel<br>money" : "VISA · MC"}</span><span><b>Payer maintenant · ${m.l}</b><small>${m.s} — votre document sera téléchargeable dès qu'il est prêt</small></span></label>`).join("")}
      <label class="pc"><input type="radio" name="payer" value="guichet"><span class="plogo guichet">${ICONS.building}</span><span><b>Payer à la mairie</b><small>${PAIEMENT.guichet}. Vous pourrez aussi payer en ligne plus tard depuis le suivi.</small></span></label></div>
      <p style="font-size:.8rem;color:var(--muted)">${PAIEMENT.note}</p>`
      : `<div class="alert-box ok">${ICONS.check}<span>Cette démarche est <b>gratuite</b> : aucun paiement n'est demandé.</span></div>`;
  };
  sel.addEventListener("change", sync);
  const pre = new URLSearchParams(location.search).get("d"); if (pre && DEMARCHES.some(d => d.id === pre)) sel.value = pre;
  sync();
  const steps = $$(".fstep", form), bars = $$(".steps span", form); let s = 0;
  const show = k => { s = k; steps.forEach((x, j) => x.classList.toggle("on", j === k)); bars.forEach((b, j) => b.classList.toggle("on", j <= k)); };
  const valid = () => { const bad = $$("[required]", steps[s]).find(i => !i.closest("[hidden]") && !i.checkValidity()); if (bad) { bad.reportValidity(); return false; } return true; };
  form.addEventListener("click", e => {
    if (e.target.closest("[data-next]") && valid()) show(s + 1);
    if (e.target.closest("[data-prev]")) show(s - 1);
  });
  form.addEventListener("submit", async e => {
    e.preventDefault(); if (!valid()) return;
    const f = Object.fromEntries(new FormData(form)), d = cur();
    const btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Envoi…";
    const reset = () => { btn.disabled = false; btn.textContent = "Valider ma demande"; };
    let ref, pj;
    try { pj = await readFiles($("#pj", form)); } catch (err) { reset(); return toast(err.message, "err"); }
    const online = d.prix && f.payer && f.payer !== "guichet";
    try {
      if (d.signal) {
        const t = TYPES_SIGNAL.find(x => x[0] === f.sigtype);
        ref = await Store.submitSignalement({type:f.sigtype, typeLabel:t[1], arr:+f.arr, quartier:f.quartier, lieu:f.lieu, description:f.description, prenom:f.prenom, nom:f.nom, tel:f.tel, priorite:"Normale", pj});
      } else {
        ref = await Store.submitDemande({...(d.acte && f.numActe ? {numActe:f.numActe, nomActe:f.nomActe || f.nom, typeActe:d.acte === "tout" ? f.typeActe : d.acte} : {}), type:d.id, typeLabel:d.t, service:d.service, arr:+f.arr, prenom:f.prenom, nom:f.nom, tel:f.tel, email:f.email, quartier:f.quartier, details:f.details, montant:d.prix || 0, paiement:d.prix ? {choix:online ? "en ligne" : "guichet", statut:"À régler"} : {statut:"Gratuit"}, pj, document:null});
      }
    } catch (err) { reset(); return toast("Envoi impossible : " + err.message, "err"); }
    reset(); ss("pog_suivi", JSON.stringify({ref, tel:f.tel}));
    const sent = d.acte && f.numActe ? await Store.suivi(ref, f.tel) : null;
    form.reset(); sel.value = ""; $("#pj-list").innerHTML = ""; sync(); show(0);
    if (online) {
      const r = await Store.suivi(ref, f.tel);
      const mode = PAIEMENT.modes.find(m => m.id === f.payer);
      setTimeout(() => $$(".paytab").find(b => b.dataset.m === mode.id)?.click(), 30);
      const paid = await payFlow(r, f.tel); paidModal(paid); return;
    }
    modal(d.signal ? "Signalement transmis ✅" : "Demande enregistrée ✅", `<p class="lead-p">Merci <b>${escH(f.prenom)}</b> ! ${d.signal ? "Votre signalement a été transmis aux services techniques." : `Votre demande « <b>${d.t}</b> » a été transmise au service ${d.service} (${arrL(f.arr)}).`}${pj.length ? ` ${pj.length} pièce(s) jointe(s) reçue(s).` : ""}</p>
      <div class="panel" style="margin:1.2rem 0;box-shadow:none;text-align:center"><small style="color:var(--muted)">Votre numéro de dossier</small><div class="refbig">${ref}</div><small style="color:var(--muted)">Notez-le avec votre numéro de téléphone : ils vous permettent de suivre${d.prix ? ", payer" : ""} et télécharger.</small></div>
      ${sent && sent.acte ? acteBadge(sent.acte) : ""}
      ${d.prix ? `<p class="alert-box warn">${ICONS.wallet}<span>Montant à régler : <b>${fcfa(d.prix)}</b> — à la mairie, ou en ligne à tout moment depuis le suivi.</span></p>` : ""}
      <a class="btn btn-navy" href="demarches.html#suivi" id="gos">${ICONS.search} Suivre mon dossier</a>`);
    $("#gos").onclick = () => { closeModal(); setTimeout(() => window.__suivi && window.__suivi(ref), 50); };
  });
  show(0);
}

function initSuivi() {
  const form = $("#suivi-form"); if (!form) return;
  const out = $("#suivi-out");
  const render = r => {
    const done = /Remise|Résolu|Prête/.test(r.statut), bad = /Rejet|manquante/.test(r.statut);
    const dem = DEMARCHES.find(x => x.id === r.typeId) || {};
    const p = r.paiement || {}, paid = p.statut === "Payé" || p.statut === "Gratuit" || !r.montant;
    const ready = /Prête|Remise/.test(r.statut) && r.document;
    let payBox = "", docBox = "";
    if (r.montant && p.statut !== "Payé") payBox = `<div class="sbox warn"><div><b>${ICONS.wallet} Montant à régler : ${fcfa(r.montant)}</b><small>Payez en ligne maintenant ou au guichet de la mairie.</small></div><div class="mini-btns">${PAIEMENT.modes.map(m => `<button class="btn btn-orange btn-sm" data-pay="${m.id}">${m.l}</button>`).join("")}</div></div>`;
    else if (r.montant) payBox = `<div class="sbox ok"><div><b>${ICONS.check} Payé : ${fcfa(r.montant)}</b><small>${escH(p.mode || "")} · ${p.date ? fdate(p.date) : ""} · quittance ${escH(p.quittance || "")}</small></div><button class="btn btn-line btn-sm" id="dlrecu">${ICONS.dl} Reçu (PDF)</button></div>`;
    if (dem.doc || (r.document && r.document.type === "fichier")) {
      if (ready && paid) docBox = `<div class="sbox doc"><div><b>${ICONS.file} Votre document est prêt</b><small>${escH(DOC_TITRES[r.typeId] || r.type)} — délivré le ${fdate(r.document.date || r.date)}</small></div><button class="btn btn-orange btn-sm" id="dldoc">${ICONS.dl} Télécharger (PDF)</button></div>`;
      else if (ready) docBox = `<div class="sbox"><div><b>${ICONS.file} Votre document est prêt</b><small>Réglez ${fcfa(r.montant)} pour le télécharger, ou retirez-le au guichet.</small></div></div>`;
      else if (!/Rejet/.test(r.statut)) docBox = `<div class="sbox"><div><b>${ICONS.clock} Document en préparation</b><small>Il sera téléchargeable ici dès que le service l'aura validé.</small></div></div>`;
    } else if (/Prête/.test(r.statut)) docBox = `<div class="sbox"><div><b>${ICONS.building} À retirer au guichet</b><small>Présentez-vous avec votre pièce d'identité et votre numéro de dossier.</small></div></div>`;
    out.innerHTML = `<div class="suivi-card"><div class="sh"><div><small>Dossier ${r.ref} · ${arrL(r.arr)}</small><h3>${escH(r.type)}</h3><small>Déposé le ${fdate(r.date)} par ${escH(r.prenom)} ${escH(r.nom)}</small></div><span class="chip ${done ? "ok" : bad ? "warn" : "info"}">${r.statut}</span></div>
      ${r.acte ? acteBadge(r.acte) : ""}${payBox}${docBox}
      <h4 style="color:var(--navy);margin:1.4rem 0 1rem">Historique</h4>
      <div class="timeline">${r.historique.slice().reverse().map(h => `<div class="tl"><b>${fdate(h.date)}</b><h4>${h.statut}</h4><p>${escH(h.note)}</p></div>`).join("")}</div></div>`;
    $$("[data-pay]", out).forEach(b => b.onclick = async () => { const tel = form.tel.value; setTimeout(() => $$(".paytab").find(x => x.dataset.m === b.dataset.pay)?.click(), 30); const res = await payFlow(r, tel); paidModal(res); render(res); });
    const dr = $("#dlrecu", out); if (dr) dr.onclick = () => downloadRecu(r).catch(e => toast(e.message, "err"));
    const dd = $("#dldoc", out); if (dd) dd.onclick = async () => { dd.disabled = true; try { await downloadDocument(r); toast("Document téléchargé.", "ok"); Store.markDownloaded(r.ref, form.tel.value); } catch (e) { toast(e.message, "err"); } dd.disabled = false; };
  };
  const run = async (ref, tel) => {
    out.innerHTML = `<p class="empty">Recherche…</p>`;
    let r = null; try { r = await Store.suivi(ref, tel); } catch (e) { out.innerHTML = `<p class="empty">Service momentanément indisponible.</p>`; return; }
    if (!r) { out.innerHTML = `<div class="empty">${ICONS.search}<p>Aucun dossier ne correspond à ce numéro et à ce téléphone.<br>Vérifiez la saisie (ex. PG-26-01234 ou SIG-26-0410).</p></div>`; return; }
    render(r);
  };
  form.addEventListener("submit", e => { e.preventDefault(); run(form.ref.value, form.tel.value); });
  let last = null; try { last = JSON.parse(ss("pog_suivi") || "null"); } catch (e) {}
  window.__suivi = ref => { if (last || (last = JSON.parse(ss("pog_suivi") || "null"))) { form.ref.value = last.ref; form.tel.value = last.tel; } $("#suivi").scrollIntoView({behavior:"smooth"}); run(form.ref.value, form.tel.value); };
  if (last) { form.ref.value = last.ref; form.tel.value = last.tel; if (location.hash === "#suivi") run(last.ref, last.tel); }
}

/* ---------- Arrondissements ---------- */
function arrCard(a, k) {
  return `<article class="arr-card rv d${k % 3}" id="arr${a.n}">
    <div class="an"><b>${a.n}<sup>${a.n === 1 ? "er" : "e"}</sup></b><span>arrondissement</span></div>
    <div class="ab"><h3>Mairie du ${a.t}</h3><p class="am">${ICONS.users} ${a.maire ? `Maire : <b>${a.maire}</b>` : `Maire d'arrondissement : <i>informations en cours de mise à jour</i>`}</p><p>${a.d}</p>
    <div class="qs">${a.reperes.map(q => `<span>${q}</span>`).join("")}</div>
    <div class="aa"><a class="btn btn-sm btn-navy" href="arrondissements.html#arr${a.n}" data-focus="${a.n}">Voir l'arrondissement</a><a class="btn btn-sm btn-line" href="demarches.html?d=signalement#demande">Signaler</a>${a.fb ? `<a class="btn btn-sm btn-line" href="${a.fb}" target="_blank" rel="noopener">${ICONS.fb} Facebook</a>` : ""}</div></div></article>`;
}
function initArr() {
  const box = $("#arr-grid");
  if (box) box.innerHTML = ARRONDISSEMENTS.map(arrCard).join("");
  const home = $("#arr-home");
  if (home) home.innerHTML = ARRONDISSEMENTS.map((a, k) => `<a class="arr-mini rv d${k % 3}" href="arrondissements.html#arr${a.n}"><span class="n">${a.n}<sup>${a.n === 1 ? "er" : "e"}</sup></span><span><b>Mairie du ${a.t}</b><small>${a.reperes.slice(0, 3).join(" · ")}</small></span>${ICONS.arrow}</a>`).join("");
  const fx = $("#arr-focus"); if (!fx) return;
  const tabs = $("#arr-tabs");
  tabs.innerHTML = ARRONDISSEMENTS.map(a => `<button class="tab" data-n="${a.n}">${a.n}<sup>${a.n === 1 ? "er" : "e"}</sup>&nbsp;arrondissement</button>`).join("");
  const set = n => {
    const a = ARRONDISSEMENTS.find(x => x.n === n);
    $$(".tab", tabs).forEach(t => t.classList.toggle("on", +t.dataset.n === n));
    const proj = PROJETS.filter(p => p.arr === n || (p.arrs || []).includes(n));
    fx.innerHTML = `<div class="focus">
      <div class="fimg"><img src="${IMG(a.img)}" alt="" loading="lazy"><span class="badge"><b>250 M</b> FCFA de dotation 2026</span></div>
      <div><span class="eyebrow">Mairie du ${a.t}</span><h2>${a.maire ? a.maire : "Le " + a.t}</h2><p class="lead-p">${a.d}</p>
        <h4>Actions récentes</h4><div class="timeline">${a.actions.map(x => `<div class="tl"><b>${fdate(x.date)}</b><p style="color:var(--ink)">${x.t}</p><a class="src" href="${x.url}" target="_blank" rel="noopener">${x.src} ${ICONS.ext}</a></div>`).join("")}</div>
        <h4>Comme dans chaque arrondissement</h4><ul class="checks">${COMMUN_ARR.map(c => `<li>${c}</li>`).join("")}</ul>
        ${proj.length ? `<h4>Projets</h4><div class="qs">${proj.map(p => `<span>${p.t}</span>`).join("")}</div>` : ""}
        <div class="aa" style="margin-top:1.2rem"><a class="btn btn-orange" href="demarches.html#demande">Démarches en ligne</a><a class="btn btn-line" href="demarches.html?d=audience#demande">Demander une audience</a>${a.fb ? `<a class="btn btn-line" href="${a.fb}" target="_blank" rel="noopener">${ICONS.fb} Facebook</a>` : ""}</div>
      </div></div>`;
  };
  tabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) { set(+t.dataset.n); history.replaceState(null, "", "#arr" + t.dataset.n); } });
  document.addEventListener("click", e => { const f = e.target.closest("[data-focus]"); if (f) { e.preventDefault(); set(+f.dataset.focus); history.replaceState(null, "", "#arr" + f.dataset.focus); $("#focus-sec").scrollIntoView({behavior:"smooth"}); } });
  const h = +(location.hash.match(/arr(\d)/) || [])[1];
  set(h >= 1 && h <= 4 ? h : 1);
  if (h) setTimeout(() => $("#focus-sec").scrollIntoView(), 300);
}

/* ---------- Vérifier un document authentifié ---------- */
function initAuthCheck() {
  const form = $("#auth-form"); if (!form) return;
  $("[name=type]", form).innerHTML = TYPES_DOC.map(([k, l]) => `<option value="${k}">${l}</option>`).join("");
  form.addEventListener("submit", async e => {
    e.preventDefault(); const out = $("#auth-out");
    out.innerHTML = '<p class="empty">Vérification…</p>';
    let a = null; try { a = await Store.verifDoc(form.num.value, form.nom.value, form.type.value); } catch (err) {}
    out.innerHTML = a ? acteBadge(a, true) + `<p class="imgnote" style="margin-top:.6rem">Titulaire : <b>${escH(a.titulaire)}</b></p>`
      : `<div class="auth-badge wait big"><span class="shield">${ICONS.shield}</span><span><b>Numéro non encore authentifié</b><small>Faites votre prochaine démarche en ligne en indiquant ce numéro, puis présentez l'original une seule fois au guichet de votre mairie d'arrondissement.</small></span></div>`;
  });
}

/* ---------- Projets ---------- */
function projCard(p) {
  const cls = {"Réalisé":"ok","En cours":"info","Lancé":"info","Programmé":"warn","À l'étude":"neu"}[p.st];
  const where = p.arrs ? p.arrs.map(arrS).join(" & ") + " arrondissements" : p.arr ? arrL(p.arr) : "Toute la commune";
  return `<article class="ncard pcard rv"><div class="ph"><img src="${IMG(p.img)}" alt="${escH(p.t)}" loading="lazy"><span class="cat">${THEMES[p.th]}</span></div>
    <div class="bd"><div style="display:flex;gap:.4rem;flex-wrap:wrap"><span class="chip ${cls}">${p.st}</span><span class="chip neu">${where}</span></div><h3>${p.t}</h3><p>${p.d}</p>${p.note ? `<small class="imgnote">${p.note}</small>` : ""}</div></article>`;
}
function initProjets() {
  const box = $("#proj-grid"); if (!box) return;
  const limit = +box.dataset.limit || 0, tabs = $("#proj-tabs"), atabs = $("#proj-arr");
  let th = "tout", ar = 0;
  const render = () => {
    let list = PROJETS.filter(p => (th === "tout" || p.th === th) && (!ar || p.arr === 0 || p.arr === ar || (p.arrs || []).includes(ar)));
    if (limit) list = list.slice(0, limit);
    box.innerHTML = list.length ? list.map(projCard).join("") : `<p class="empty">Aucun projet pour ce filtre.</p>`;
    requestAnimationFrame(() => $$(".rv", box).forEach((el, k) => setTimeout(() => el.classList.add("in"), k * 50)));
  };
  if (tabs) {
    tabs.innerHTML = [["tout","Tous les thèmes"], ...Object.entries(THEMES)].map(([k, l]) => `<button class="tab ${k === "tout" ? "on" : ""}" data-n="${k}">${l}</button>`).join("");
    tabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (!t) return; th = t.dataset.n; $$(".tab", tabs).forEach(x => x.classList.toggle("on", x === t)); render(); });
  }
  if (atabs) {
    atabs.innerHTML = [[0, "Toute la commune"], ...ARRONDISSEMENTS.map(a => [a.n, a.t])].map(([k, l]) => `<button class="tab ${k ? "" : "on"}" data-a="${k}">${l}</button>`).join("");
    atabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (!t) return; ar = +t.dataset.a; $$(".tab", atabs).forEach(x => x.classList.toggle("on", x === t)); render(); });
  }
  render();
}

/* ---------- Actualités, avis, galerie ---------- */
function newsCard(a, k) {
  return `<article class="ncard rv d${k%3}"><div class="ph"><img src="${IMG(a.img)}" alt="${escH(a.t)}" loading="lazy"><span class="cat">${a.cat}</span></div><div class="bd"><small class="ndate">${ICONS.cal}${fdate(a.date)}</small><h3>${a.t}</h3><p>${a.d}</p><a class="src" href="${a.url}" target="_blank" rel="noopener">Source : ${a.src} ${ICONS.ext}</a></div></article>`;
}
function initNews() {
  const box = $("#news"); if (!box) return;
  const n = +box.dataset.limit || ACTUS.length;
  box.innerHTML = ACTUS.slice(0, n).map(newsCard).join("");
}
async function initAvis() {
  const box = $("#avis"); if (!box) return;
  try { await Store.initPublic(); } catch (e) {}
  const list = Store.publicationsPubliques().slice(0, +box.dataset.limit || 20);
  const cls = {"Communiqué":"info","Avis":"warn","Marché public":"ok","Recrutement":"ok","Actualité":"neu"};
  box.innerHTML = list.length ? list.map(p => `<article class="avis rv"><div class="ah"><span class="chip ${cls[p.type] || "neu"}">${p.type}</span><small>${fdate(p.date)} · ${arrL(+p.arr)}</small></div><h3>${escH(p.titre)}</h3><p>${escH(p.texte)}</p></article>`).join("")
    : `<p class="empty">Aucun avis publié pour le moment.</p>`;
  initReveal();
}
function initGallery() {
  const g = $("#gallery"); if (!g) return;
  const cats = {mairie:"La mairie", chantiers:"Chantiers", terrain:"Sur le terrain", evenements:"Événements"};
  g.innerHTML = GALERIE.map((p, k) => `<figure data-cat="${p.cat}" data-i="${k}"><img src="${IMG(p.img)}" alt="${p.t}" loading="lazy"><figcaption><small>${cats[p.cat]}</small>${p.t}</figcaption></figure>`).join("");
  const f = $("#gallery-filters");
  if (f) {
    f.innerHTML = `<button class="tab on" data-c="all">Tout</button>` + Object.entries(cats).map(([k,v]) => `<button class="tab" data-c="${k}">${v}</button>`).join("");
    f.addEventListener("click", e => { const b = e.target.closest(".tab"); if (!b) return; $$(".tab", f).forEach(x => x.classList.toggle("on", x === b)); $$("figure", g).forEach(fig => fig.classList.toggle("hide", b.dataset.c !== "all" && fig.dataset.cat !== b.dataset.c)); });
  }
  const lb = document.createElement("div"); lb.className = "lightbox";
  lb.innerHTML = '<button class="lb-x" aria-label="Fermer">×</button><button class="lb-p" aria-label="Précédente">‹</button><img alt=""><button class="lb-n" aria-label="Suivante">›</button><p></p>';
  document.body.appendChild(lb);
  let cur = 0;
  const vis = () => $$("figure:not(.hide)", g).map(x => +x.dataset.i);
  const show = i => { cur = i; $("img", lb).src = IMG(GALERIE[i].img); $("p", lb).textContent = GALERIE[i].t; lb.classList.add("on"); };
  const nav = d => { const v = vis(); show(v[(v.indexOf(cur) + d + v.length) % v.length]); };
  g.addEventListener("click", e => { const fig = e.target.closest("figure"); if (fig) show(+fig.dataset.i); });
  lb.addEventListener("click", e => { if (e.target.matches(".lb-x") || e.target === lb) lb.classList.remove("on"); if (e.target.matches(".lb-p")) nav(-1); if (e.target.matches(".lb-n")) nav(1); });
  document.addEventListener("keydown", e => { if (!lb.classList.contains("on")) return; if (e.key === "Escape") lb.classList.remove("on"); if (e.key === "ArrowLeft") nav(-1); if (e.key === "ArrowRight") nav(1); });
}

/* ---------- Espace numérique : accès rapides (accueil) ---------- */
function initAccess() {
  const showDemo = (window.ESM_CONFIG || {}).showDemo !== false;
  const link = e => `espace.html?role=${e.role}${showDemo ? "&demo=1" : ""}`;
  const q = $("#quick-access");
  if (q) q.innerHTML = `<span class="ql">${ICONS.lock} Espace numérique</span>` + ESPACES.map(e => `<a href="${link(e)}" class="qbtn">${ICONS[e.ic]}${e.t}</a>`).join("");
  const c = $("#access-cards");
  if (c) c.innerHTML = ESPACES.map((e, i) => `<article class="acard rv d${i}" style="--c:${e.c}">
      <div class="ah"><span class="aic">${ICONS[e.ic]}</span><span><h3>${e.t}</h3><small>${e.s}</small></span></div>
      <ul>${e.pts.map(p => `<li>${p}</li>`).join("")}</ul>
      ${showDemo ? `<div class="creds"><small>Compte de démonstration · ${e.demo.nom}</small><div><span>Identifiant <b>${e.demo.login}</b></span><span>Mot de passe <b>${e.demo.pwd}</b></span></div></div>` : ""}
      <a class="btn btn-sm acta" href="${link(e)}">${showDemo ? "Tester l'espace" : "Accéder à mon espace"} ${ICONS.arrow}</a>
    </article>`).join("");
}

/* ---------- Contact (avec pièces jointes) ---------- */
function initContact() {
  const form = $("#contact-form"); if (!form) return;
  bindFileList($("#cpj", form), $("#cpj-list", form));
  const dest = $("[name=arr]", form);
  if (dest) dest.innerHTML = `<option value="0">Mairie centrale (hôtel de ville)</option>` + ARRONDISSEMENTS.map(a => `<option value="${a.n}">Mairie du ${a.t}</option>`).join("");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Envoi…";
    try {
      const pj = await readFiles($("#cpj", form)), d = Object.fromEntries(new FormData(form)); delete d.pj; d.arr = +d.arr || 0; d.pj = pj;
      await Store.addContact(d); form.reset(); $("#cpj-list", form).innerHTML = "";
      toast(`Message envoyé${pj.length ? " avec " + pj.length + " pièce(s) jointe(s)" : ""} ! Il a été transmis à la mairie.`, "ok");
    } catch (err) { toast("Envoi impossible : " + err.message, "err"); }
    btn.disabled = false; btn.textContent = "Envoyer";
  });
  const ci = $("#contact-info");
  if (ci) {
    const items = [[ICONS.pin, "Adresse", MAIRIE.adresse]];
    MAIRIE.tels.forEach(t => items.push([ICONS.phone, "Téléphone", `<a href="tel:+241${t.replace(/\s/g,"").slice(1)}">${t}</a>`]));
    if (MAIRIE.email) items.push([ICONS.mail, "E-mail", `<a href="mailto:${MAIRIE.email}">${MAIRIE.email}</a>`]);
    if (MAIRIE.horaires) items.push([ICONS.clock, "Horaires", MAIRIE.horaires]);
    items.push([ICONS.fb, "Facebook", `<a href="${MAIRIE.facebook}" target="_blank" rel="noopener">Ville de Port-Gentil</a>`]);
    items.push([ICONS.map, "Mairies d'arrondissement", `<a href="arrondissements.html">1er, 2e, 3e et 4e arrondissements</a>`]);
    items.push([ICONS.cal, "Rencontrer le maire", `<a href="demarches.html?d=audience#demande">Demander une audience en ligne</a>`]);
    items.push([ICONS.search, "Suivre, payer, télécharger", `<a href="demarches.html#suivi">Avec votre numéro de dossier</a>`]);
    ci.innerHTML = items.map(([ic, b, s]) => `<div class="citem"><span class="ic">${ic}</span><span><b>${b}</b><span>${s}</span></span></div>`).join("");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome(); initChrome(); initHero(); initDemarches(); initDemandeForm(); initSuivi(); initAuthCheck(); initProjets(); initNews(); initGallery(); initArr(); initAccess(); initContact();
  initReveal(); initAvis();
});
