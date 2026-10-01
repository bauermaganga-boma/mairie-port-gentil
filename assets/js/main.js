/* Mairie de Port-Gentil — comportements du site public */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IMG = n => `assets/img/${n}.jpg`;
const escH = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fdate = d => new Date(d).toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"});
const arrL = n => !n ? "Mairie centrale" : n + (n === 1 ? "er" : "e") + " arrondissement";

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
    m.addEventListener("click", e => { if (e.target === m || e.target.closest(".x")) m.classList.remove("on"); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") m.classList.remove("on"); });
  }
  $("h3", m).textContent = title; $(".mb", m).innerHTML = html; m.classList.add("on");
  return m;
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
      <li><a href="mairie.html">Le maire & le conseil</a></li><li><a href="arrondissements.html">Les 4 arrondissements</a></li><li><a href="projets.html">Projets & chantiers</a></li><li><a href="actualites.html">Actualités & avis</a></li><li><a href="contact.html">Contact</a></li>
    </ul></div>
    <div><h4>Démarches</h4><ul>
      <li><a href="demarches.html?c=etat-civil">État civil</a></li><li><a href="demarches.html?d=mariage#demande">Mariage</a></li><li><a href="demarches.html?c=urbanisme">Urbanisme & domaine public</a></li><li><a href="demarches.html?d=signalement#demande">Signaler un problème</a></li><li><a href="demarches.html#suivi">Suivre mon dossier</a></li>
    </ul></div>
    <div><h4>Espace numérique</h4>
      <ul><li><a href="espace.html?role=cabinet">Cabinet du maire</a></li><li><a href="espace.html?role=services">Services municipaux</a></li><li><a href="espace.html?role=arrondissement">Mairies d'arrondissement</a></li></ul>
      <div class="staff-box"><b>Vous êtes agent municipal ?</b><p>Accédez au back-office pour traiter les demandes, tenir les registres et suivre les chantiers.</p><a class="btn btn-orange btn-sm" href="espace.html">${ICONS.lock} Accès agents</a></div>
    </div>
  </div>
  <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${MAIRIE.nom} · ${MAIRIE.adresse}</span><span>Commune de Port-Gentil · Ogooué-Maritime · Gabon</span></div>
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
  $$(".rv").forEach(el => io.observe(el));
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
      <h4 style="margin:1.3rem 0 .6rem;color:var(--navy)">À prévoir</h4><ul class="checks" style="margin:0 0 1rem">${d.pieces.map(p => `<li>${p}</li>`).join("")}</ul>
      <p style="color:var(--muted);font-size:.86rem">Liste indicative : le service peut vous demander une pièce complémentaire. Vous serez informé(e) à chaque étape grâce à votre numéro de dossier.</p>
      <div style="display:flex;gap:.6rem;margin-top:1.4rem;flex-wrap:wrap"><a class="btn btn-orange" href="demarches.html?d=${d.id}#demande">${d.signal ? "Signaler maintenant" : "Faire la demande en ligne"}</a></div>`);
  });
}

function initDemandeForm() {
  const form = $("#demande-form"); if (!form) return;
  const sel = $("[name=type]", form), sig = $("#sig-fields", form), std = $("#std-fields", form), ts = $("[name=sigtype]", form), qList = $("#quartiers");
  sel.innerHTML = '<option value="">— Choisir une démarche —</option>' + Object.entries(CAT_DEM).map(([k, c]) => `<optgroup label="${c.l}">${DEMARCHES.filter(d => d.cat === k).map(d => `<option value="${d.id}">${d.t}</option>`).join("")}</optgroup>`).join("");
  ts.innerHTML = TYPES_SIGNAL.map(([k, l]) => `<option value="${k}">${l}</option>`).join("");
  qList.innerHTML = ARRONDISSEMENTS.flatMap(a => a.quartiers).map(q => `<option value="${q}">`).join("");
  const sync = () => {
    const d = DEMARCHES.find(x => x.id === sel.value), isSig = !!(d && d.signal);
    sig.hidden = !isSig; std.hidden = isSig;
    $$("input,select,textarea", sig).forEach(i => i.required = isSig && i.dataset.req === "1");
    $("#dem-info").innerHTML = d ? `<b>${d.t}</b> — ${d.d}<br><small>À prévoir : ${d.pieces.join(" · ")}</small>` : "";
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
    const f = Object.fromEntries(new FormData(form)), d = DEMARCHES.find(x => x.id === f.type);
    const btn = $("button[type=submit]", form); btn.disabled = true;
    let ref;
    try {
      if (d.signal) {
        const t = TYPES_SIGNAL.find(x => x[0] === f.sigtype);
        ref = await Store.submitSignalement({type:f.sigtype, typeLabel:t[1], arr:+f.arr, quartier:f.quartier, lieu:f.lieu, description:f.description, prenom:f.prenom, nom:f.nom, tel:f.tel, priorite:"Normale"});
      } else {
        ref = await Store.submitDemande({type:d.id, typeLabel:d.t, service:d.service, arr:+f.arr, prenom:f.prenom, nom:f.nom, tel:f.tel, email:f.email, quartier:f.quartier, details:f.details});
      }
    } catch (err) { btn.disabled = false; return toast("Envoi impossible : " + err.message, "err"); }
    btn.disabled = false; form.reset(); sel.value = ""; sync(); show(0);
    modal(d.signal ? "Signalement transmis ✅" : "Demande enregistrée ✅", `<p class="lead-p">Merci <b>${escH(f.prenom)}</b> ! ${d.signal ? "Votre signalement a été transmis aux services techniques." : `Votre demande « <b>${d.t}</b> » a été transmise au service ${d.service}.`}</p>
      <div class="panel" style="margin:1.2rem 0;box-shadow:none;text-align:center"><small style="color:var(--muted)">Votre numéro de dossier</small><div class="refbig">${ref}</div><small style="color:var(--muted)">Notez-le : il vous permet de suivre l'avancement.</small></div>
      <a class="btn btn-navy" href="demarches.html?ref=${ref}#suivi">${ICONS.search} Suivre mon dossier</a>`);
  });
  show(0);
}

function initSuivi() {
  const form = $("#suivi-form"); if (!form) return;
  const out = $("#suivi-out");
  const run = async ref => {
    out.innerHTML = `<p class="empty">Recherche…</p>`;
    let r = null; try { r = await Store.suivi(ref); } catch (e) { out.innerHTML = `<p class="empty">Service momentanément indisponible.</p>`; return; }
    if (!r) { out.innerHTML = `<div class="empty">${ICONS.search}<p>Aucun dossier ne correspond au numéro <b>${escH(ref)}</b>.<br>Vérifiez la saisie (ex. PG-26-01234 ou SIG-26-0410).</p></div>`; return; }
    const done = /Remise|Résolu|Prête/.test(r.statut), bad = /Rejet|manquante/.test(r.statut);
    out.innerHTML = `<div class="suivi-card"><div class="sh"><div><small>Dossier ${r.ref} · ${arrL(r.arr)}</small><h3>${escH(r.type)}</h3><small>Déposé le ${fdate(r.date)}</small></div><span class="chip ${done ? "ok" : bad ? "warn" : "info"}">${r.statut}</span></div>
      <div class="timeline">${r.historique.slice().reverse().map(h => `<div class="tl"><b>${fdate(h.date)}</b><h4>${h.statut}</h4><p>${escH(h.note)}</p></div>`).join("")}</div></div>`;
  };
  form.addEventListener("submit", e => { e.preventDefault(); run(form.ref.value); });
  const pre = new URLSearchParams(location.search).get("ref"); if (pre) { form.ref.value = pre; run(pre); }
}

/* ---------- Projets ---------- */
function projCard(p) {
  const cls = {"Réalisé":"ok","En cours":"info","Lancé":"info","Programmé":"warn","À l'étude":"neu"}[p.st];
  return `<article class="ncard pcard rv" data-th="${p.th}" data-arr="${p.arr}"><div class="ph"><img src="${IMG(p.img)}" alt="${escH(p.t)}" loading="lazy"><span class="cat">${THEMES[p.th]}</span></div>
    <div class="bd"><div style="display:flex;gap:.4rem;flex-wrap:wrap"><span class="chip ${cls}">${p.st}</span><span class="chip neu">${p.arr ? arrL(p.arr) : "Toute la commune"}</span></div><h3>${p.t}</h3><p>${p.d}</p>${p.note ? `<small class="imgnote">${p.note}</small>` : ""}</div></article>`;
}
function initProjets() {
  const box = $("#proj-grid"); if (!box) return;
  const limit = +box.dataset.limit || 0, tabs = $("#proj-tabs");
  const render = th => {
    let list = PROJETS.filter(p => th === "tout" || p.th === th || (th === "arr4" && p.arr === 4)); if (limit) list = list.slice(0, limit);
    box.innerHTML = list.map(projCard).join("");
    requestAnimationFrame(() => $$(".rv", box).forEach((el, k) => setTimeout(() => el.classList.add("in"), k * 50)));
  };
  if (tabs) {
    tabs.innerHTML = [["tout","Tous"], ...Object.entries(THEMES), ["arr4","4e arrondissement"]].map(([k, l]) => `<button class="tab" data-n="${k}">${l}</button>`).join("");
    const set = k => { $$(".tab", tabs).forEach(t => t.classList.toggle("on", t.dataset.n === k)); render(k); };
    tabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) set(t.dataset.n); });
    set("tout");
  } else render("tout");
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

/* ---------- Arrondissements ---------- */
function initArr() {
  const box = $("#arr-grid"); if (!box) return;
  box.innerHTML = ARRONDISSEMENTS.map((a, k) => `<article class="arr-card rv d${k%3} ${a.quartiers.length ? "full" : ""}" id="arr${a.n}">
    <div class="an"><b>${a.n}<sup>${a.n === 1 ? "er" : "e"}</sup></b><span>arrondissement</span></div>
    <div class="ab"><h3>Mairie du ${a.t}</h3>${a.maire ? `<p class="am">${ICONS.users} Maire : <b>${a.maire}</b></p>` : ""}<p>${a.d}</p>
    ${a.quartiers.length ? `<div class="qs">${a.quartiers.map(q => `<span>${q}</span>`).join("")}</div>` : ""}
    <div class="aa"><a class="btn btn-sm btn-navy" href="demarches.html#demande">Démarches</a><a class="btn btn-sm btn-line" href="demarches.html?d=signalement#demande">Signaler un problème</a>${a.fb ? `<a class="btn btn-sm btn-line" href="${a.fb}" target="_blank" rel="noopener">${ICONS.fb} Facebook</a>` : ""}</div></div></article>`).join("");
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

/* ---------- Contact ---------- */
function initContact() {
  const form = $("#contact-form"); if (!form) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = $("button[type=submit]", form); btn.disabled = true;
    try { await Store.addContact(Object.fromEntries(new FormData(form))); form.reset(); toast("Message envoyé ! Il a été transmis au secrétariat de la mairie.", "ok"); }
    catch (err) { toast("Envoi impossible : " + err.message, "err"); }
    btn.disabled = false;
  });
  const ci = $("#contact-info");
  if (ci) {
    const items = [[ICONS.pin, "Adresse", MAIRIE.adresse]];
    MAIRIE.tels.forEach(t => items.push([ICONS.phone, "Téléphone", `<a href="tel:+241${t.replace(/\s/g,"").slice(1)}">${t}</a>`]));
    if (MAIRIE.email) items.push([ICONS.mail, "E-mail", `<a href="mailto:${MAIRIE.email}">${MAIRIE.email}</a>`]);
    if (MAIRIE.horaires) items.push([ICONS.clock, "Horaires", MAIRIE.horaires]);
    items.push([ICONS.fb, "Facebook", `<a href="${MAIRIE.facebook}" target="_blank" rel="noopener">Ville de Port-Gentil</a>`]);
    items.push([ICONS.cal, "Rencontrer le maire", `<a href="demarches.html?d=audience#demande">Demander une audience en ligne</a>`]);
    items.push([ICONS.search, "Suivre une demande", `<a href="demarches.html#suivi">Avec votre numéro de dossier</a>`]);
    ci.innerHTML = items.map(([ic, b, s]) => `<div class="citem"><span class="ic">${ic}</span><span><b>${b}</b><span>${s}</span></span></div>`).join("");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome(); initChrome(); initHero(); initDemarches(); initDemandeForm(); initSuivi(); initProjets(); initNews(); initGallery(); initArr(); initAccess(); initContact();
  initReveal(); initAvis();
});
