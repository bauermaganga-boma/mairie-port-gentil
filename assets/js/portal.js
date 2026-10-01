/* Mairie de Port-Gentil — Espace numérique des agents (back-office) */
const P = (() => {
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money = n => Math.round(n || 0).toLocaleString("fr-FR").replace(/ | /g, " ") + " FCFA";
  const mshort = n => n >= 1e9 ? (n / 1e9).toFixed(2).replace(".", ",") + " Md" : n >= 1e6 ? (n / 1e6).toFixed(1).replace(".", ",") + " M" : Math.round(n).toLocaleString("fr-FR");
  const date = d => d ? new Date(d).toLocaleDateString("fr-FR", {day:"numeric", month:"short", year:"numeric"}) : "—";
  const dtime = d => new Date(d).toLocaleString("fr-FR", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"});
  const ago = d => { const s = (Date.now() - new Date(d)) / 1000; if (s < 0) return "à venir"; if (s < 60) return "à l'instant"; if (s < 3600) return `il y a ${Math.floor(s/60)} min`; if (s < 86400) return `il y a ${Math.floor(s/3600)} h`; if (s < 30*86400) return `il y a ${Math.floor(s/86400)} j`; return date(d); };
  const days = d => (Date.now() - new Date(d)) / 864e5;
  const ini = u => (((u.prenom || "")[0] || "") + ((u.nom || "")[0] || "")).toUpperCase();
  const arrL = n => !+n ? "Centrale" : n + (+n === 1 ? "er" : "e") + " arr.";
  const empty = (t, ic = "inbox") => `<div class="empty">${ICONS[ic]}<p>${t}</p></div>`;
  const opt = (list, cur) => list.map(x => { const [v, l] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(v)}" ${String(v) === String(cur) ? "selected" : ""}>${esc(l)}</option>`; }).join("");
  const ARR_OPTS = [["0","Mairie centrale"],["1","1er arrondissement"],["2","2e arrondissement"],["3","3e arrondissement"],["4","4e arrondissement"]];
  const stChip = s => { const c = {"Nouvelle":"bad","Nouveau":"bad","En traitement":"info","Pris en charge":"info","En intervention":"info","Pièce manquante":"warn","Prête":"ok","Remise":"neu","Résolu":"ok","Rejetée":"neu","En cours":"info","Programmé":"warn","Réalisé":"ok","À l'étude":"neu","Suspendu":"bad","Lancé":"info"}[s] || "neu"; return `<span class="chip ${c}">${esc(s)}</span>`; };
  async function act(fn, okMsg) { try { const r = await fn(); if (okMsg) toast(okMsg, "ok"); return r ?? true; } catch (e) { toast(e.message || "Une erreur est survenue.", "err"); return false; } }
  const kpis = list => `<div class="kpis">${list.map(([ic, cls, v, l]) => `<div class="kpi"><span class="ic ${cls}">${ICONS[ic]}</span><span><b>${v}</b><span>${l}</span></span></div>`).join("")}</div>`;
  const tbl = (head, rows, emptyMsg = "Aucun élément") => rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>` : empty(emptyMsg);
  const hbars = (pairs, fmt = v => v) => { const max = Math.max(1, ...pairs.map(p => p[1])); return `<div class="hbars">${pairs.map(([l, v]) => `<div class="r"><span title="${esc(l)}">${esc(l)}</span><div class="prog"><i style="width:${v / max * 100}%"></i></div><b>${fmt(v)}</b></div>`).join("")}</div>`; };
  const vbars = (pairs, fmt) => { const max = Math.max(1, ...pairs.map(p => p[1])); return `<div class="bars flat">${pairs.map(([l, v]) => `<div class="b"><em>${fmt(v)}</em><i style="height:${Math.max(3, v / max * 100)}%"></i><small>${l}</small></div>`).join("")}</div>`; };
  function csv(name, head, rows) {
    const c = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const blob = new Blob(["﻿" + [head, ...rows].map(r => r.map(c).join(";")).join("\n")], {type:"text/csv;charset=utf-8"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name + ".csv"; a.click();
  }
  function printHTML(title, html) {
    const w = window.open("", "_blank"); if (!w) return toast("Autorisez les fenêtres pour imprimer.", "err");
    w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title><link rel="stylesheet" href="assets/css/style.css"><style>body{background:#fff;padding:2rem}</style></head><body>${html}<script>setTimeout(()=>print(),400)<\/script></body></html>`);
    w.document.close();
  }
  const filterBar = (fields, onChange, root) => { root.querySelectorAll("[data-f]").forEach(i => i.addEventListener(i.tagName === "INPUT" ? "input" : "change", onChange)); };

  let me, NAV, VIEWS, cur, route;
  const charts = [];
  const F = {}; // filtres mémorisés par module

  async function boot() {
    const views = document.getElementById("views");
    views.innerHTML = `<div class="empty"><p>Chargement de votre espace…</p></div>`;
    let u = null;
    try { u = await Store.init(); } catch (e) { views.innerHTML = empty("Connexion à la base impossible. Vérifiez votre connexion internet puis rechargez la page."); return; }
    if (!u) { location.replace("espace.html"); return; }
    me = u;
    const n = document.querySelector(".notice");
    if (n) n.textContent = Store.LIVE ? "Connecté à la base de données de la mairie — les modifications sont partagées en temps réel avec tous les services." : "Mode démonstration : les données (personnes, montants, dossiers) sont fictives et enregistrées dans ce navigateur. En production, la même interface est branchée sur une base de données sécurisée partagée par tous les services.";
    start();
    Store.subscribe(col => { if (col === "demandes" || col === "signalements") toast("Nouvelle activité reçue du site public."); route(false); });
  }

  function shell() {
    const sb = document.getElementById("sb");
    const draw = () => {
      sb.innerHTML = `<div class="sb-brand"><img src="assets/img/logo-pog.svg" alt=""><span><b>Mairie de Port-Gentil</b><small>${esc(me.arr ? arrL(me.arr).replace("arr.", "arrondissement") : Store.ROLES[me.role].l)}</small></span></div>` +
        NAV.map(n => { const b = n.badge ? n.badge() : 0; return `<a href="#${n.id}" data-v="${n.id}" class="${n.id === cur ? "on" : ""}">${ICONS[n.ic]}${n.l}${b ? `<span class="pill">${b}</span>` : ""}</a>`; }).join("") +
        `<div class="sb-foot"><a href="index.html">${ICONS.home}Retour au site</a><button class="lnk" id="logout">${ICONS.out}Déconnexion</button></div>`;
      document.getElementById("logout").onclick = async () => { await Store.logout(); location.href = "espace.html"; };
    };
    P.redrawNav = draw;
    document.getElementById("who").innerHTML = `<span class="av">${ini(me)}</span><span><b>${esc(me.prenom + " " + me.nom)}</b><small>${esc(me.titre || Store.ROLES[me.role].l)}</small></span>`;
    document.getElementById("sbt").onclick = e => { e.stopPropagation(); sb.classList.toggle("open"); };
    document.querySelector(".app-main").addEventListener("click", () => sb.classList.remove("open"));
    const quit = document.getElementById("quit");
    if (quit) quit.onclick = async () => { quit.disabled = true; await Store.logout().catch(() => {}); location.href = "index.html"; };
    route = (top = true) => {
      if (document.querySelector("#modal.on")) return; // ne pas fermer une fiche ouverte
      const id = location.hash.slice(1);
      cur = NAV.some(n => n.id === id) ? id : NAV[0].id;
      const n = NAV.find(x => x.id === cur), y = scrollY;
      document.getElementById("vt").textContent = n.l; document.getElementById("vs").textContent = n.s || "";
      while (charts.length) charts.pop().destroy();
      document.getElementById("views").innerHTML = `<div class="view on" id="v-${cur}"></div>`;
      VIEWS[cur](document.getElementById("v-" + cur));
      draw(); sb.classList.remove("open"); scrollTo(0, top ? 0 : y);
    };
    P.route = route;
    addEventListener("hashchange", () => route()); route();
  }
  const closeModal = () => { const m = document.getElementById("modal"); if (m) m.classList.remove("on"); };
  const refresh = () => { closeModal(); route(false); };

  /* =========================================================
     APPLICATION
     ========================================================= */
  function start() {
    const L = c => Store.list(c);
    const open = s => !/Remise|Rejetée|Résolu|Prête/.test(s);
    const thisMonth = d => { const a = new Date(d), b = new Date(); return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear(); };
    const lowStocks = () => L("stocks").filter(s => s.qte <= s.seuil);

    const ALL = [
      {id:"tableau", l:"Tableau de bord", ic:"gauge", s:"Vue d'ensemble en temps réel"},
      {id:"indicateurs", l:"Indicateurs", ic:"chart", s:"Camemberts et courbes de pilotage — maire central et maires d'arrondissement"},
      {id:"demandes", l:"Demandes", ic:"inbox", s:"Démarches reçues en ligne et au guichet", badge:() => L("demandes").filter(d => d.statut === "Nouvelle").length},
      {id:"signalements", l:"Signalements", ic:"alert", s:"Problèmes signalés par les habitants", badge:() => L("signalements").filter(d => d.statut === "Nouveau").length},
      {id:"actes", l:"Registre d'état civil", ic:"book", s:"Naissances, mariages et décès enregistrés numériquement"},
      {id:"agenda", l:"Agenda & audiences", ic:"cal", s:"Rendez-vous du maire, réunions, visites de terrain"},
      {id:"recettes", l:"Recettes", ic:"wallet", s:"Encaissements, quittances et suivi des recettes municipales"},
      {id:"agents", l:"Personnel", ic:"users", s:"Dossiers des agents municipaux et pièces manquantes"},
      {id:"stocks", l:"Stocks", ic:"box", s:"Fournitures sensibles avec alertes automatiques", badge:() => lowStocks().length},
      {id:"chantiers", l:"Chantiers", ic:"crane", s:"Suivi des projets, budgets et avancement"},
      {id:"publications", l:"Publications du site", ic:"mega", s:"Avis, communiqués, marchés publics et recrutements affichés sur le site"},
      {id:"contacts", l:"Messages reçus", ic:"mail", s:"Messages et pièces jointes envoyés depuis le site", badge:() => Store.list("contacts").filter(c => !c.lu).length},
      {id:"journal", l:"Journal d'activité", ic:"clock", s:"Traçabilité : qui a fait quoi, et quand"},
      {id:"comptes", l:"Comptes agents", ic:"lock", s:"Créer et gérer les accès par service et par arrondissement"},
      {id:"compte", l:"Mon compte", ic:"edit", s:"Profil et mot de passe"},
    ];
    NAV = ALL.filter(n => n.id === "comptes" ? me.role === "sg" : Store.can(n.id));

    VIEWS = {
      /* ---------------- Tableau de bord ---------------- */
      tableau(el) {
        const dem = L("demandes"), sig = L("signalements"), rec = L("recettes"), ch = L("chantiers");
        const late = dem.filter(d => open(d.statut) && days(d.date) > 7), hot = sig.filter(s => s.priorite === "Haute" && s.statut !== "Résolu");
        const recM = rec.filter(r => days(r.date) <= 30).reduce((a, r) => a + r.montant, 0);
        const chC = ch.filter(c => c.statut === "En cours");
        const k = [];
        if (Store.can("demandes")) k.push(["inbox","ic-b", dem.filter(d => open(d.statut)).length, "demandes en cours"]);
        if (Store.can("signalements")) k.push(["alert","ic-o", sig.filter(s => s.statut !== "Résolu").length, "signalements ouverts"]);
        if (Store.can("recettes")) k.push(["wallet","ic-g", mshort(recM), "FCFA encaissés sur 30 jours"]);
        if (Store.can("chantiers")) k.push(["crane","ic-y", chC.length, "chantiers en cours"]);
        if (Store.can("actes") && k.length < 4) k.push(["book","ic-b", L("actes").length, "actes au registre numérique"]);
        if (Store.can("agents")) { const a = L("agents"), inc = a.filter(x => Object.values(x.pieces).some(v => !v)).length; k.push(["users","ic-b", a.length, "agents suivis"], ["file","ic-o", Math.round(inc / a.length * 100) + " %", "dossiers incomplets"]); }
        const alerts = [];
        if (Store.can("stocks")) lowStocks().forEach(s => alerts.push(["bad", `Stock bas : <b>${esc(s.article)}</b> — ${s.qte} ${s.unite}(s) restant(s), seuil ${s.seuil} (${arrL(s.arr)}).`]));
        if (Store.can("demandes") && late.length) alerts.push(["warn", `<b>${late.length} demande(s)</b> en attente depuis plus de 7 jours.`]);
        if (Store.can("signalements") && hot.length) alerts.push(["warn", `<b>${hot.length} signalement(s) prioritaire(s)</b> non résolu(s) (canaux, voirie).`]);
        const off = new Date().getDate() <= 7 ? 1 : 0, months = [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i - off); return d; });
        const recByM = months.map(m => [m.toLocaleDateString("fr-FR", {month:"short"}), rec.filter(r => { const d = new Date(r.date); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear(); }).reduce((a, r) => a + r.montant, 0)]);
        const byArr = [1,2,3,4].map(a => [arrL(a), dem.filter(d => +d.arr === a).length + sig.filter(s => +s.arr === a).length]);
        const journal = Store.list("journal").slice(0, 7);
        el.innerHTML = kpis(k.slice(0, 4)) +
          (alerts.length ? `<div class="card"><h2>Alertes ${Store.LIVE ? "" : '<small style="font-weight:500;color:var(--muted);font-size:.8rem">remontées automatiquement</small>'}</h2>${alerts.map(([c, t]) => `<div class="alert-box ${c === "warn" ? "warn" : ""}">${ICONS.alert}<span>${t}</span></div>`).join("")}</div>` : `<div class="alert-box ok">${ICONS.check}<span>Aucune alerte : tout est sous contrôle.</span></div>`) +
          `<div class="bo-grid">
            ${Store.can("recettes") ? `<div class="card"><h2>Recettes des 6 derniers mois</h2>${vbars(recByM, mshort)}</div>` : ""}
            ${Store.can("demandes") && !me.arr ? `<div class="card"><h2>Demandes & signalements par arrondissement</h2>${hbars(byArr)}</div>` : ""}
            ${Store.can("demandes") ? `<div class="card"><h2>Dernières demandes <a class="btn btn-line btn-sm" href="#demandes">Tout voir</a></h2>${tbl(["Dossier","Démarche","Statut"], dem.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map(d => `<tr><td><b>${d.ref}</b><br><small style="color:var(--muted)">${ago(d.date)}</small></td><td>${esc(d.typeLabel)}</td><td>${stChip(d.statut)}</td></tr>`))}</div>` : ""}
            ${Store.can("signalements") ? `<div class="card"><h2>Signalements récents <a class="btn btn-line btn-sm" href="#signalements">Tout voir</a></h2>${tbl(["Réf.","Problème","Lieu","Statut"], sig.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map(s => `<tr><td><b>${s.ref}</b></td><td>${esc(s.typeLabel)}</td><td>${esc(s.quartier)}</td><td>${stChip(s.statut)}</td></tr>`))}</div>` : ""}
            ${Store.can("chantiers") ? `<div class="card"><h2>Avancement des chantiers <a class="btn btn-line btn-sm" href="#chantiers">Tout voir</a></h2>${hbars(ch.filter(c => c.statut !== "Réalisé").slice(0, 6).map(c => [c.titre, c.avancement]), v => v + " %")}</div>` : ""}
            ${Store.can("agenda") ? `<div class="card"><h2>Prochains rendez-vous <a class="btn btn-line btn-sm" href="#agenda">Agenda</a></h2>${calList(L("agenda").filter(e => new Date(e.date) > Date.now() - 864e5).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4))}</div>` : ""}
            ${Store.can("journal") || Store.ROLES[me.role].mods === "*" ? `<div class="card"><h2>Activité récente <a class="btn btn-line btn-sm" href="#journal">Journal</a></h2>${journal.length ? `<div class="hist">${journal.map(j => `<div><small>${ago(j.date)} · ${esc(j.user)}</small><b>${esc(j.action)}</b> — ${esc(j.detail)}</div>`).join("")}</div>` : empty("Aucune activité")}</div>` : ""}
          </div>`;
      },

      /* ---------------- Indicateurs de gestion (camemberts & courbes) ---------------- */
      indicateurs(el) {
        const f = F.ind || (F.ind = {per:6, arr:me.arr ? String(me.arr) : "0"});
        const A = me.arr ? me.arr : +f.arr;
        const off = new Date().getDate() <= 7 ? 1 : 0; // mois en cours trop récent : on s'arrête au dernier mois complet
        const months = [...Array(f.per)].map((_, i) => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); d.setMonth(d.getMonth() - f.per + 1 + i - off); return d; });
        const from = months[0].getTime(), inPer = x => new Date(x.date).getTime() >= from;
        const sameM = (d, m) => { d = new Date(d); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear(); };
        const mLabel = m => m.toLocaleDateString("fr-FR", {month:"short"}) + (f.per > 6 ? " " + String(m.getFullYear()).slice(2) : "");
        const all = c => Store.db()[c].filter(x => !A || +x.arr === A);
        const allArr = (c, a) => Store.db()[c].filter(x => +x.arr === a);
        const doneAt = d => { const h = (d.historique || []).find(x => /Prête|Remise|Rejetée|Résolu/.test(x.statut)); return h ? h.date : null; };
        const delay = list => { const v = list.map(d => { const t = doneAt(d); return t ? (new Date(t) - new Date(d.date)) / 864e5 : null; }).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
        const stats = a => {
          const dem = (a == null ? all("demandes") : allArr("demandes", a)).filter(inPer), sig = (a == null ? all("signalements") : allArr("signalements", a)).filter(inPer), rec = (a == null ? all("recettes") : allArr("recettes", a)).filter(inPer), ch = a == null ? all("chantiers") : allArr("chantiers", a);
          const tot = rec.reduce((s, r) => s + r.montant, 0), onl = rec.filter(r => /Airtel|Carte/.test(r.mode)).reduce((s, r) => s + r.montant, 0);
          return {dem, sig, rec, ch, nDem:dem.length, traitees:dem.length ? dem.filter(d => doneAt(d)).length / dem.length * 100 : 0, delai:delay(dem), recettes:tot, online:tot ? onl / tot * 100 : 0,
            resolus:sig.length ? sig.filter(s => s.statut === "Résolu").length / sig.length * 100 : 0, avct:ch.length ? ch.reduce((s, c) => s + c.avancement, 0) / ch.length : 0, engage:ch.reduce((s, c) => s + c.engage, 0)};
        };
        const S = stats(null), one = n => n == null ? "—" : n.toFixed(1).replace(".", ",");
        const scopeTitle = A ? arrL(A).replace("arr.", "arrondissement") : "Toute la commune";
        el.innerHTML = `<div class="card ind-bar"><div class="toolbar" style="margin:0">
            <div class="field"><label>Période</label><select data-f="per">${opt([["3","3 derniers mois"],["6","6 derniers mois"],["12","12 derniers mois"]], f.per)}</select></div>
            ${me.arr ? `<div class="field"><label>Périmètre</label><input value="${esc(scopeTitle)}" disabled></div>` : `<div class="field"><label>Périmètre</label><select data-f="arr">${opt([["0","Toute la commune (maire central)"], ...ARR_OPTS.slice(1).map(([v, l]) => [v, "Mairie du " + l])], f.arr)}</select></div>`}
            <div class="field" style="flex:0 0 auto"><label>&nbsp;</label><button class="btn btn-line btn-sm" id="pdfind" style="height:42px">${ICONS.print} Imprimer</button></div></div></div>` +
          kpis([["inbox","ic-b", S.nDem, "demandes reçues"],["clock","ic-y", one(S.delai) + " j", "délai moyen de traitement"],["check","ic-g", Math.round(S.traitees) + " %", "demandes traitées"],["wallet","ic-g", mshort(S.recettes), "FCFA encaissés"]]) +
          kpis([["phone","ic-o", Math.round(S.online) + " %", "des recettes payées en ligne"],["alert","ic-o", S.sig.length, "signalements reçus"],["wave","ic-b", Math.round(S.resolus) + " %", "signalements résolus"],["crane","ic-y", Math.round(S.avct) + " %", "avancement moyen des chantiers"]]) +
          `<div class="bo-grid">
            <div class="card"><h2>Demandes reçues et traitées par mois</h2><div class="chart"><canvas id="c1"></canvas></div></div>
            <div class="card"><h2>${A ? "Recettes mensuelles" : "Recettes mensuelles par arrondissement"}</h2><div class="chart"><canvas id="c2"></canvas></div></div>
            <div class="card"><h2>Demandes par statut</h2><div class="chart pie"><canvas id="c3"></canvas></div></div>
            <div class="card"><h2>Recettes par moyen de paiement</h2><div class="chart pie"><canvas id="c4"></canvas></div></div>
            <div class="card"><h2>Recettes par nature</h2><div class="chart pie"><canvas id="c5"></canvas></div></div>
            <div class="card"><h2>Signalements par type</h2><div class="chart pie"><canvas id="c6"></canvas></div></div>
            <div class="card"><h2>${A ? "Délai moyen par démarche (jours)" : "Délai moyen de traitement par arrondissement (jours)"}</h2><div class="chart"><canvas id="c7"></canvas></div></div>
            <div class="card"><h2>Dotation 2026 engagée ${A ? "" : "par arrondissement"}</h2><div class="chart ${A ? "pie" : ""}"><canvas id="c8"></canvas></div></div>
          </div>
          ${A ? "" : `<div class="card"><h2>Tableau comparatif des arrondissements <button class="btn btn-line btn-sm" id="expind">${ICONS.dl} Export</button></h2><div id="cmp"></div><p style="color:var(--muted);font-size:.8rem;margin-top:.6rem">En vert : meilleur résultat de la période. Données de démonstration fictives.</p></div>`}`;
        filterBar(null, e => { f[e.target.dataset.f] = e.target.dataset.f === "per" ? +e.target.value : e.target.value; route(false); }, el);
        el.querySelector("#pdfind").onclick = () => print();
        // Tableau comparatif
        if (!A) {
          const rows = [1,2,3,4].map(a => ({a, ...stats(a)}));
          const best = (k, low) => { const v = rows.map(r => r[k]).filter(x => x != null); return low ? Math.min(...v) : Math.max(...v); };
          const cell = (r, k, txt, low) => `<td class="${r[k] != null && r[k] === best(k, low) ? "best" : ""}">${txt}</td>`;
          el.querySelector("#cmp").innerHTML = tbl(["Arrondissement","Demandes","Délai moyen","Traitées","Recettes","Payé en ligne","Signalements résolus","Chantiers (avct)","Dotation engagée"], rows.map(r => `<tr><td><b>Mairie du ${arrL(r.a).replace("arr.", "arr.")}</b></td>${cell(r, "nDem", r.nDem)}${cell(r, "delai", one(r.delai) + " j", true)}${cell(r, "traitees", Math.round(r.traitees) + " %")}${cell(r, "recettes", mshort(r.recettes))}${cell(r, "online", Math.round(r.online) + " %")}${cell(r, "resolus", Math.round(r.resolus) + " %")}${cell(r, "avct", Math.round(r.avct) + " %")}<td>${mshort(r.engage)} / 250 M</td></tr>`));
          el.querySelector("#expind").onclick = () => csv("indicateurs-arrondissements", ["Arrondissement","Demandes","Délai moyen (j)","Traitées %","Recettes FCFA","Payé en ligne %","Signalements résolus %","Avancement chantiers %","Dotation engagée FCFA"], rows.map(r => [arrL(r.a), r.nDem, one(r.delai), Math.round(r.traitees), r.recettes, Math.round(r.online), Math.round(r.resolus), Math.round(r.avct), r.engage]));
        }
        // Graphiques
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js").then(() => {
          if (!document.getElementById("c1")) return;
          const C = window.Chart; C.defaults.font.family = "Inter, system-ui, sans-serif"; C.defaults.color = "#5b6b85"; C.defaults.plugins.legend.labels.boxWidth = 12;
          const PAL = ["#07325a","#0a8a55","#f2c230","#1477b5","#c0392b","#5b3fb3","#22a2d6","#e67e22"], ARRC = {1:"#1477b5", 2:"#0a8a55", 3:"#f2c230", 4:"#c0392b"};
          const mk = (id, cfg) => charts.push(new C(document.getElementById(id), {...cfg, options:{maintainAspectRatio:false, responsive:true, ...(cfg.options || {})}}));
          const pie = (id, labels, data, colors) => mk(id, {type:"doughnut", data:{labels, datasets:[{data, backgroundColor:colors || PAL, borderWidth:2, borderColor:"#fff"}]}, options:{cutout:"55%", plugins:{legend:{position:"right"}, tooltip:{callbacks:{label:c => { const t = c.dataset.data.reduce((a, b) => a + b, 0); return ` ${c.label} : ${c.raw > 9999 ? mshort(c.raw) : c.raw} (${t ? Math.round(c.raw / t * 100) : 0} %)`; }}}}}});
          const line = (id, sets, money) => mk(id, {type:"line", data:{labels:months.map(mLabel), datasets:sets.map(s => ({tension:.35, fill:sets.length === 1, pointRadius:3, borderWidth:2.5, ...s, backgroundColor:sets.length === 1 ? s.borderColor + "22" : s.borderColor}))}, options:{interaction:{mode:"index", intersect:false}, plugins:{legend:{position:"bottom"}, tooltip:{callbacks:{label:c => ` ${c.dataset.label} : ${money ? mshort(c.raw) + " FCFA" : c.raw}`}}}, scales:{y:{beginAtZero:true, ticks:{callback:v => money ? mshort(v) : v}}, x:{grid:{display:false}}}}});
          // 1. Demandes reçues / traitées
          line("c1", [{label:"Reçues", data:months.map(m => S.dem.filter(d => sameM(d.date, m)).length), borderColor:"#1477b5"}, {label:"Traitées", data:months.map(m => all("demandes").filter(d => doneAt(d) && sameM(doneAt(d), m)).length), borderColor:"#0a8a55"}]);
          // 2. Recettes mensuelles
          const recM = list => months.map(m => list.filter(r => sameM(r.date, m)).reduce((s, r) => s + r.montant, 0));
          line("c2", A ? [{label:"Recettes", data:recM(S.rec), borderColor:"#0a8a55"}] : [1,2,3,4].map(a => ({label:arrL(a), data:recM(S.rec.filter(r => +r.arr === a)), borderColor:ARRC[a]})), true);
          // 3. Demandes par statut
          const sts = Store.STATUTS.demandes; pie("c3", sts, sts.map(s => S.dem.filter(d => d.statut === s).length), ["#c0392b","#1477b5","#e67e22","#0a8a55","#07325a","#9aa5b8"]);
          // 4. Moyens de paiement
          pie("c4", Store.MODES, Store.MODES.map(mo => S.rec.filter(r => r.mode === mo).reduce((s, r) => s + r.montant, 0)), ["#07325a","#e40000","#1477b5","#9aa5b8"]);
          // 5. Nature des recettes
          const nat = Store.NATURES.map(n => [n, S.rec.filter(r => r.nature === n).reduce((s, r) => s + r.montant, 0)]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
          pie("c5", nat.map(x => x[0]), nat.map(x => x[1]));
          // 6. Signalements par type
          pie("c6", TYPES_SIGNAL.map(t => t[1]), TYPES_SIGNAL.map(t => S.sig.filter(s => s.type === t[0]).length), ["#1477b5","#07325a","#f2c230","#e67e22","#c0392b","#9aa5b8"]);
          // 7. Délais
          const bar = (id, labels, data, colors, money) => mk(id, {type:"bar", data:{labels, datasets:[{data, backgroundColor:colors, borderRadius:6}]}, options:{plugins:{legend:{display:false}, tooltip:{callbacks:{label:c => " " + (money ? mshort(c.raw) + " FCFA" : one(c.raw) + " jours")}}}, scales:{y:{beginAtZero:true, ticks:{callback:v => money ? mshort(v) : v}}, x:{grid:{display:false}}}}});
          if (A) { const ty = DEMARCHES.filter(d => !d.signal).map(d => [d.t.replace(/ \(.*\)/, "").slice(0, 22), delay(S.dem.filter(x => x.type === d.id))]).filter(x => x[1] != null); bar("c7", ty.map(x => x[0]), ty.map(x => +x[1].toFixed(1)), "#1477b5"); }
          else bar("c7", [1,2,3,4].map(arrL), [1,2,3,4].map(a => +(delay(S.dem.filter(d => +d.arr === a)) || 0).toFixed(1)), [1,2,3,4].map(a => ARRC[a]));
          // 8. Dotation
          if (A) { const e = Math.min(250e6, S.ch.reduce((s, c) => s + c.engage, 0)); pie("c8", ["Engagé","Disponible"], [e, 250e6 - e], ["#0a8a55","#dfe6ef"]); }
          else bar("c8", [1,2,3,4].map(arrL), [1,2,3,4].map(a => allArr("chantiers", a).reduce((s, c) => s + c.engage, 0)), [1,2,3,4].map(a => ARRC[a]), true);
        }).catch(e => toast(e.message, "err"));
      },

      /* ---------------- Demandes ---------------- */
      demandes(el) { dossiers(el, "demandes"); },
      signalements(el) { dossiers(el, "signalements"); },

      /* ---------------- Registre d'état civil ---------------- */
      actes(el) {
        const f = F.actes || (F.actes = {type:"", arr:"", q:""});
        const TY = {naissance:"Naissance", mariage:"Mariage", deces:"Décès"};
        const draw = () => {
          const all = L("actes");
          const list = all.filter(a => (!f.type || a.type === f.type) && (!f.arr || String(a.arr) === f.arr) && (!f.q || (a.num + " " + a.nom + " " + a.prenoms).toLowerCase().includes(f.q.toLowerCase()))).sort((a, b) => b.date.localeCompare(a.date));
          el.querySelector("#list").innerHTML = tbl(["N° d'acte","Type","Nom & prénoms","Date de l'événement","Arrondissement",""], list.slice(0, 200).map(a => `<tr class="clk" data-id="${a.id}"><td><b>${a.num}</b></td><td>${TY[a.type]}</td><td>${esc(a.nom)} ${esc(a.prenoms)}${a.conjoint ? ` <small style="color:var(--muted)">& ${esc(a.conjoint)}</small>` : ""}</td><td>${date(a.dateEvt)}</td><td>${arrL(a.arr)}</td><td><button class="btn btn-line btn-sm">${ICONS.print} Extrait</button></td></tr>`), "Aucun acte trouvé");
          el.querySelector("#cnt").textContent = list.length + " acte(s)";
        };
        const all = L("actes");
        el.innerHTML = kpis([["baby","ic-b", all.filter(a => a.type === "naissance").length, "naissances enregistrées"],["ring","ic-o", all.filter(a => a.type === "mariage").length, "mariages enregistrés"],["file","ic-y", all.filter(a => a.type === "deces").length, "décès enregistrés"],["search","ic-g", "1 s", "pour retrouver un acte"]]) +
          `<div class="card"><h2><span>Registre numérique <small id="cnt" style="color:var(--muted);font-weight:500;font-size:.8rem"></small></span><span class="mini-btns"><button class="btn btn-orange btn-sm" id="new">${ICONS.plus} Enregistrer un acte</button><button class="btn btn-line btn-sm" id="exp">${ICONS.dl} Export</button></span></h2>
          <div class="toolbar"><div class="field"><label>Rechercher</label><input data-f="q" placeholder="Nom, prénom ou n° d'acte" value="${esc(f.q)}"></div><div class="field"><label>Type</label><select data-f="type"><option value="">Tous</option>${opt(Object.entries(TY), f.type)}</select></div>${me.arr ? "" : `<div class="field"><label>Arrondissement</label><select data-f="arr"><option value="">Tous</option>${opt(ARR_OPTS.slice(1), f.arr)}</select></div>`}</div><div id="list"></div></div>`;
        filterBar(null, e => { f[e.target.dataset.f] = e.target.value; draw(); }, el);
        el.querySelector("#list").addEventListener("click", e => { const tr = e.target.closest("[data-id]"); if (tr) acteView(Store.db().actes.find(a => a.id === tr.dataset.id)); });
        el.querySelector("#exp").onclick = () => csv("registre-etat-civil", ["N°","Type","Nom","Prénoms","Date","Lieu","Arrondissement"], L("actes").map(a => [a.num, TY[a.type], a.nom, a.prenoms, a.dateEvt, a.lieu, arrL(a.arr)]));
        el.querySelector("#new").onclick = () => {
          modal("Enregistrer un acte", `<form class="form" id="af">
            <div class="row"><div class="field"><label>Type d'acte</label><select name="type">${opt(Object.entries(TY))}</select></div><div class="field"><label>Arrondissement</label><select name="arr" ${me.arr ? "disabled" : ""}>${opt(ARR_OPTS.slice(1), me.arr || 1)}</select></div></div>
            <div class="row"><div class="field"><label>Nom</label><input name="nom" required></div><div class="field"><label>Prénom(s)</label><input name="prenoms" required></div></div>
            <div class="row"><div class="field"><label>Date de l'événement</label><input name="dateEvt" type="date" required value="${new Date().toISOString().slice(0, 10)}"></div><div class="field"><label>Sexe</label><select name="sexe">${opt([["M","Masculin"],["F","Féminin"]])}</select></div></div>
            <div class="field"><label>Lieu</label><input name="lieu" value="Port-Gentil"></div>
            <div class="row" data-for="naissance"><div class="field"><label>Père</label><input name="pere"></div><div class="field"><label>Mère</label><input name="mere"></div></div>
            <div class="field" data-for="mariage" hidden><label>Conjoint(e)</label><input name="conjoint"></div>
            <button class="btn btn-orange">${ICONS.save} Enregistrer au registre</button></form>`);
          const fm = document.getElementById("af"), sync = () => fm.querySelectorAll("[data-for]").forEach(x => x.hidden = x.dataset.for !== fm.type.value);
          fm.type.onchange = sync; sync();
          fm.onsubmit = async e => {
            e.preventDefault(); const d = Object.fromEntries(new FormData(fm)); d.arr = me.arr || +d.arr;
            const n = Store.db().actes.length + 101, num = {naissance:"N", mariage:"M", deces:"D"}[d.type] + "-" + new Date().getFullYear() + "-" + String(n).padStart(5, "0");
            const a = await act(() => Store.add("actes", {...d, num, officier:"Officier d'état civil — " + arrL(d.arr).replace("arr.", "arrondissement")}), "Acte " + num + " enregistré.");
            if (a) { Store.log("Acte enregistré", num + " · " + d.nom + " " + d.prenoms); refresh(); acteView(a); }
          };
        };
        draw();
      },

      /* ---------------- Agenda ---------------- */
      agenda(el) {
        const ev = L("agenda").slice().sort((a, b) => a.date.localeCompare(b.date));
        const up = ev.filter(e => new Date(e.date) > Date.now() - 864e5), past = ev.filter(e => new Date(e.date) <= Date.now() - 864e5).reverse();
        const aud = L("demandes").filter(d => d.type === "audience" && /Nouvelle|En traitement/.test(d.statut));
        el.innerHTML = `<div class="cols"><div><div class="card"><h2>À venir <button class="btn btn-orange btn-sm" id="new">${ICONS.plus} Ajouter</button></h2>${calList(up, true)}</div>
          <div class="card"><h2>Passés</h2>${calList(past.slice(0, 6))}</div></div>
          <div class="card"><h2>Demandes d'audience à planifier</h2>${aud.length ? aud.map(d => `<div class="post"><div class="top"><h4>${esc(d.prenom)} ${esc(d.nom)}</h4>${stChip(d.statut)}</div><p>${esc(d.details || "Objet non précisé")}</p><small>${d.ref} · ${esc(d.quartier)} · ${arrL(d.arr)} · ${ago(d.date)}</small><div style="margin-top:.5rem"><button class="btn btn-navy btn-sm" data-plan="${d.id}">${ICONS.cal} Planifier</button></div></div>`).join("") : empty("Aucune demande d'audience en attente", "cal")}</div></div>`;
        const form = (d) => {
          modal(d ? "Planifier l'audience" : "Nouveau rendez-vous", `<form class="form" id="ef">
            <div class="field"><label>Intitulé</label><input name="titre" required value="${d ? esc("Audience – " + d.prenom + " " + d.nom) : ""}"></div>
            <div class="row"><div class="field"><label>Date et heure</label><input name="date" type="datetime-local" required></div><div class="field"><label>Type</label><select name="type">${opt(["Audience","Réunion","Terrain","Conseil","Cérémonie"], d ? "Audience" : "")}</select></div></div>
            <div class="row"><div class="field"><label>Lieu</label><input name="lieu" value="${d ? "Cabinet du maire" : ""}"></div><div class="field"><label>Arrondissement</label><select name="arr">${opt(ARR_OPTS, me.arr || 0)}</select></div></div>
            <button class="btn btn-orange">${ICONS.save} Enregistrer</button></form>`);
          const fm = document.getElementById("ef");
          fm.onsubmit = async e => {
            e.preventDefault(); const v = Object.fromEntries(new FormData(fm)); v.date = new Date(v.date).toISOString(); v.arr = +v.arr;
            if (!await act(() => Store.add("agenda", v), "Rendez-vous ajouté à l'agenda.")) return;
            if (d) { const h = d.historique.concat([{date:new Date().toISOString(), statut:"Prête", note:`Audience fixée le ${dtime(v.date)} (${v.lieu}). Merci de vous présenter 15 minutes avant.`, pub:true}]); await act(() => Store.update("demandes", d.id, {statut:"Prête", historique:h})); }
            Store.log("Agenda", v.titre + " · " + dtime(v.date)); refresh();
          };
        };
        el.querySelector("#new").onclick = () => form(null);
        el.querySelectorAll("[data-plan]").forEach(b => b.onclick = () => form(Store.db().demandes.find(d => d.id === b.dataset.plan)));
        el.querySelectorAll("[data-delev]").forEach(b => b.onclick = async () => { if (confirm("Supprimer ce rendez-vous ?") && await act(() => Store.remove("agenda", b.dataset.delev), "Rendez-vous supprimé.")) refresh(); });
      },

      /* ---------------- Recettes ---------------- */
      recettes(el) {
        const f = F.rec || (F.rec = {nature:"", arr:"", per:"30"});
        const all = L("recettes");
        const inPer = r => f.per === "tout" ? true : f.per === "mois" ? thisMonth(r.date) : days(r.date) <= ({"30":30, "90":90, "180":180}[f.per] || 9999);
        const list = all.filter(r => inPer(r) && (!f.nature || r.nature === f.nature) && (!f.arr || String(r.arr) === f.arr)).sort((a, b) => b.date.localeCompare(a.date));
        const tot = list.reduce((a, r) => a + r.montant, 0), yr = all.filter(r => new Date(r.date).getFullYear() === new Date().getFullYear()).reduce((a, r) => a + r.montant, 0);
        const mm = list.filter(r => /Airtel|Carte/.test(r.mode)).reduce((a, r) => a + r.montant, 0);
        const byNat = Store.NATURES.map(n => [n, list.filter(r => r.nature === n).reduce((a, r) => a + r.montant, 0)]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
        const byArr = [1,2,3,4].map(a => [arrL(a), list.filter(r => +r.arr === a).reduce((s, r) => s + r.montant, 0)]);
        el.innerHTML = kpis([["wallet","ic-g", mshort(tot), "FCFA sur la période"],["chart","ic-b", mshort(yr), "FCFA depuis janvier"],["file","ic-y", list.length, "quittances émises"],["phone","ic-o", tot ? Math.round(mm / tot * 100) + " %" : "—", "payé en ligne (Airtel, carte)"]]) +
          `<div class="cols"><div class="card"><h2>Encaissements <span class="mini-btns"><button class="btn btn-orange btn-sm" id="new">${ICONS.plus} Nouvel encaissement</button><button class="btn btn-line btn-sm" id="exp">${ICONS.dl} Export</button></span></h2>
            <div class="toolbar"><div class="field"><label>Période</label><select data-f="per">${opt([["mois","Mois en cours"],["30","30 derniers jours"],["90","3 derniers mois"],["180","6 derniers mois"],["tout","Tout"]], f.per)}</select></div><div class="field"><label>Nature</label><select data-f="nature"><option value="">Toutes</option>${opt(Store.NATURES, f.nature)}</select></div>${me.arr ? "" : `<div class="field"><label>Arrondissement</label><select data-f="arr"><option value="">Tous</option>${opt(ARR_OPTS.slice(1), f.arr)}</select></div>`}</div>
            ${tbl(["Quittance","Date","Nature","Payeur","Arr.","Mode","Montant"], list.slice(0, 150).map(r => `<tr class="clk" data-id="${r.id}"><td><b>${r.quittance}</b></td><td>${date(r.date)}</td><td>${esc(r.nature)}</td><td>${esc(r.payeur)}</td><td>${arrL(r.arr)}</td><td>${esc(r.mode)}</td><td style="text-align:right;font-weight:700;white-space:nowrap">${money(r.montant)}</td></tr>`), "Aucun encaissement sur la période")}</div>
            <div><div class="card"><h2>Par nature</h2>${byNat.length ? hbars(byNat, mshort) : empty("—")}</div>${me.arr ? "" : `<div class="card"><h2>Par arrondissement</h2>${hbars(byArr, mshort)}</div>`}</div></div>`;
        filterBar(null, e => { f[e.target.dataset.f] = e.target.value; route(false); }, el);
        el.querySelector("#exp").onclick = () => csv("recettes", ["Quittance","Date","Nature","Payeur","Arrondissement","Mode","Montant"], list.map(r => [r.quittance, date(r.date), r.nature, r.payeur, arrL(r.arr), r.mode, r.montant]));
        el.querySelectorAll("[data-id]").forEach(tr => tr.onclick = () => quittance(Store.db().recettes.find(r => r.id === tr.dataset.id)));
        el.querySelector("#new").onclick = () => {
          modal("Nouvel encaissement", `<form class="form" id="rf">
            <div class="row"><div class="field"><label>Nature de la recette</label><select name="nature">${opt(Store.NATURES)}</select></div><div class="field"><label>Arrondissement</label><select name="arr" ${me.arr ? "disabled" : ""}>${opt(ARR_OPTS.slice(1), me.arr || 1)}</select></div></div>
            <div class="row"><div class="field"><label>Montant (FCFA)</label><input name="montant" type="number" min="100" step="100" required></div><div class="field"><label>Mode de paiement</label><select name="mode">${opt(Store.MODES.concat(["Chèque"]))}</select></div></div>
            <div class="field"><label>Payeur (nom ou commerce)</label><input name="payeur" required></div>
            <button class="btn btn-orange">${ICONS.save} Enregistrer et éditer la quittance</button></form>`);
          const fm = document.getElementById("rf");
          fm.onsubmit = async e => {
            e.preventDefault(); const d = Object.fromEntries(new FormData(fm)); d.arr = me.arr || +d.arr; d.montant = +d.montant;
            d.quittance = "Q-" + String(new Date().getFullYear()).slice(2) + "-" + String(5200 + Store.db().recettes.length + 1).padStart(6, "0"); d.agent = me.prenom + " " + me.nom;
            const r = await act(() => Store.add("recettes", d), "Encaissement enregistré.");
            if (r) { Store.log("Encaissement", d.quittance + " · " + d.nature + " · " + money(d.montant)); refresh(); quittance(r); }
          };
        };
      },

      /* ---------------- Personnel ---------------- */
      agents(el) {
        const f = F.ag || (F.ag = {service:"", inc:"", q:""});
        const all = L("agents"), services = [...new Set(all.map(a => a.service))].sort();
        const missing = a => Object.entries(a.pieces).filter(([, v]) => !v).map(([k]) => k);
        const list = all.filter(a => (!f.service || a.service === f.service) && (!f.inc || missing(a).length) && (!f.q || (a.nom + " " + a.prenom + " " + a.matricule).toLowerCase().includes(f.q.toLowerCase()))).sort((a, b) => a.nom.localeCompare(b.nom));
        const inc = all.filter(a => missing(a).length).length;
        el.innerHTML = kpis([["users","ic-b", all.length, "agents (échantillon de démo)"],["check","ic-g", all.length - inc, "dossiers complets"],["file","ic-o", inc, "dossiers incomplets"],["gauge","ic-y", Math.round((all.length - inc) / Math.max(1, all.length) * 100) + " %", "taux de complétude"]]) +
          `<div class="card"><h2>Dossiers du personnel <span class="mini-btns"><button class="btn btn-orange btn-sm" id="new">${ICONS.plus} Ajouter un agent</button><button class="btn btn-line btn-sm" id="exp">${ICONS.dl} Export</button></span></h2>
          <div class="toolbar"><div class="field"><label>Rechercher</label><input data-f="q" placeholder="Nom ou matricule" value="${esc(f.q)}"></div><div class="field"><label>Service</label><select data-f="service"><option value="">Tous</option>${opt(services, f.service)}</select></div><div class="field"><label>Dossier</label><select data-f="inc">${opt([["","Tous"],["1","Incomplets uniquement"]], f.inc)}</select></div></div>
          ${tbl(["Matricule","Agent","Service / poste","Affectation","Cat.","Pièces"], list.map(a => { const m = missing(a); return `<tr class="clk" data-id="${a.id}"><td><b>${a.matricule}</b></td><td>${esc(a.nom)} ${esc(a.prenom)}${a.statut !== "Actif" ? ` <span class="chip warn">${a.statut}</span>` : ""}</td><td>${esc(a.service)}<br><small style="color:var(--muted)">${esc(a.poste)}</small></td><td>${arrL(a.arr)}</td><td>${a.categorie}</td><td>${m.length ? `<span class="chip warn" title="${esc(m.join(", "))}">${m.length} manquante(s)</span>` : `<span class="chip ok">Complet</span>`}</td></tr>`; }), "Aucun agent")}</div>`;
        filterBar(null, e => { f[e.target.dataset.f] = e.target.value; route(false); }, el);
        const q = el.querySelector("[data-f=q]"); if (f.q) { q.focus(); q.setSelectionRange(f.q.length, f.q.length); }
        el.querySelector("#exp").onclick = () => csv("personnel", ["Matricule","Nom","Prénom","Service","Poste","Affectation","Catégorie","Pièces manquantes"], all.map(a => [a.matricule, a.nom, a.prenom, a.service, a.poste, arrL(a.arr), a.categorie, missing(a).join(", ")]));
        const edit = a => {
          const isNew = !a; a = a || {matricule:"PG-" + String(1400 + all.length).padStart(5, "0"), nom:"", prenom:"", service:services[0], poste:"", arr:0, categorie:"C", entree:String(new Date().getFullYear()), statut:"Actif", pieces:{"Acte de naissance":false,"Pièce d'identité":false,"Diplôme":false,"Contrat / arrêté":false,"RIB":false,"Photo":false}};
          modal(isNew ? "Nouvel agent" : "Dossier de " + a.prenom + " " + a.nom, `<form class="form" id="gf">
            <div class="row"><div class="field"><label>Nom</label><input name="nom" required value="${esc(a.nom)}"></div><div class="field"><label>Prénom</label><input name="prenom" required value="${esc(a.prenom)}"></div></div>
            <div class="row"><div class="field"><label>Matricule</label><input name="matricule" required value="${esc(a.matricule)}"></div><div class="field"><label>Service</label><input name="service" list="svc" required value="${esc(a.service)}"><datalist id="svc">${services.map(s => `<option value="${esc(s)}">`).join("")}</datalist></div></div>
            <div class="row"><div class="field"><label>Poste</label><input name="poste" value="${esc(a.poste)}"></div><div class="field"><label>Affectation</label><select name="arr">${opt(ARR_OPTS, a.arr)}</select></div></div>
            <div class="row"><div class="field"><label>Catégorie</label><select name="categorie">${opt(["A","B","C"], a.categorie)}</select></div><div class="field"><label>Situation</label><select name="statut">${opt(["Actif","En congé","Détaché","Retraité"], a.statut)}</select></div></div>
            <div class="field"><label>Pièces du dossier</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem">${Object.entries(a.pieces).map(([k, v]) => `<label style="display:flex;gap:.5rem;align-items:center;font-size:.88rem"><input type="checkbox" name="p:${esc(k)}" ${v ? "checked" : ""}> ${esc(k)}</label>`).join("")}</div></div>
            <div style="display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn btn-orange">${ICONS.save} Enregistrer</button>${isNew ? "" : `<button type="button" class="btn btn-line" id="gdel">Supprimer</button>`}</div></form>`);
          const fm = document.getElementById("gf");
          fm.onsubmit = async e => {
            e.preventDefault(); const fd = new FormData(fm), d = {pieces:{}};
            for (const [k, v] of fd) if (!k.startsWith("p:")) d[k] = v;
            Object.keys(a.pieces).forEach(k => d.pieces[k] = fd.has("p:" + k)); d.arr = +d.arr;
            if (await act(() => isNew ? Store.add("agents", {...d, entree:a.entree}) : Store.update("agents", a.id, d), "Dossier enregistré.")) { Store.log(isNew ? "Agent ajouté" : "Dossier agent mis à jour", d.matricule + " · " + d.nom + " " + d.prenom); refresh(); }
          };
          const del = document.getElementById("gdel"); if (del) del.onclick = async () => { if (confirm("Supprimer ce dossier ?") && await act(() => Store.remove("agents", a.id), "Dossier supprimé.")) refresh(); };
        };
        el.querySelector("#new").onclick = () => edit(null);
        el.querySelectorAll("[data-id]").forEach(tr => tr.onclick = () => edit(Store.db().agents.find(a => a.id === tr.dataset.id)));
      },

      /* ---------------- Stocks ---------------- */
      stocks(el) {
        const list = L("stocks").slice().sort((a, b) => (a.qte / a.seuil) - (b.qte / b.seuil));
        const low = list.filter(s => s.qte <= s.seuil);
        el.innerHTML = (low.length ? low.map(s => `<div class="alert-box">${ICONS.alert}<span><b>${esc(s.article)}</b> (${arrL(s.arr)}) : ${s.qte} ${s.unite}(s) restant(s) pour un seuil de ${s.seuil}. Le cabinet du maire est alerté automatiquement.</span></div>`).join("") : `<div class="alert-box ok">${ICONS.check}<span>Tous les stocks sont au-dessus de leur seuil d'alerte.</span></div>`) +
          `<div class="card"><h2>Inventaire <button class="btn btn-orange btn-sm" id="new">${ICONS.plus} Nouvel article</button></h2>
          ${tbl(["Article","Service","Lieu","Quantité","Seuil","Niveau",""], list.map(s => `<tr><td><b>${esc(s.article)}</b></td><td>${esc(s.service)}</td><td>${arrL(s.arr)}</td><td><b>${s.qte}</b> ${esc(s.unite)}(s)</td><td>${s.seuil}</td><td style="min-width:120px"><div class="prog ${s.qte <= s.seuil ? "low" : ""}"><i style="width:${Math.min(100, s.qte / (s.seuil * 3) * 100)}%"></i></div></td><td><div class="mini-btns"><button class="btn btn-line btn-sm" data-mv="in" data-id="${s.id}">+ Entrée</button><button class="btn btn-line btn-sm" data-mv="out" data-id="${s.id}">− Sortie</button><button class="btn btn-line btn-sm" data-h="${s.id}">Historique</button></div></td></tr>`), "Aucun article")}</div>`;
        el.querySelectorAll("[data-mv]").forEach(b => b.onclick = () => {
          const s = Store.db().stocks.find(x => x.id === b.dataset.id), inn = b.dataset.mv === "in";
          modal((inn ? "Entrée en stock — " : "Sortie de stock — ") + s.article, `<form class="form" id="mf"><div class="row"><div class="field"><label>Quantité (${esc(s.unite)}s)</label><input name="q" type="number" min="1" ${inn ? "" : `max="${s.qte}"`} required></div><div class="field"><label>Motif</label><input name="motif" required value="${inn ? "Livraison fournisseur" : "Sortie pour le service"}"></div></div><button class="btn btn-orange">${ICONS.save} Valider</button></form>`);
          document.getElementById("mf").onsubmit = async e => {
            e.preventDefault(); const q = +e.target.q.value, delta = inn ? q : -q, nq = s.qte + delta;
            const hist = (s.hist || []).concat([{date:new Date().toISOString(), delta, motif:e.target.motif.value, by:me.prenom + " " + me.nom}]);
            if (!await act(() => Store.update("stocks", s.id, {qte:nq, hist}), "Stock mis à jour : " + nq + " " + s.unite + "(s).")) return;
            if (!inn && nq <= s.seuil) { await Store.log("Alerte stock", `${s.article} : ${nq} ${s.unite}(s) restant(s) (seuil ${s.seuil}). Le cabinet a été averti automatiquement.`); setTimeout(() => toast("⚠ Seuil d'alerte atteint : le cabinet du maire a été averti.", "err"), 600); }
            refresh();
          };
        });
        el.querySelectorAll("[data-h]").forEach(b => b.onclick = () => { const s = Store.db().stocks.find(x => x.id === b.dataset.h); modal("Mouvements — " + s.article, (s.hist || []).length ? `<div class="hist">${s.hist.slice().reverse().map(h => `<div><small>${dtime(h.date)} · ${esc(h.by)}</small><b style="color:${h.delta < 0 ? "var(--bad)" : "var(--ok)"}">${h.delta > 0 ? "+" : ""}${h.delta}</b> — ${esc(h.motif)}</div>`).join("")}</div>` : empty("Aucun mouvement")); });
        el.querySelector("#new").onclick = () => {
          modal("Nouvel article", `<form class="form" id="nf"><div class="field"><label>Article</label><input name="article" required></div><div class="row"><div class="field"><label>Unité</label><input name="unite" required value="unité"></div><div class="field"><label>Service</label><input name="service" required value="${esc(Store.ROLES[me.role].l)}"></div></div><div class="row"><div class="field"><label>Quantité initiale</label><input name="qte" type="number" min="0" required></div><div class="field"><label>Seuil d'alerte</label><input name="seuil" type="number" min="0" required></div></div><div class="field"><label>Lieu</label><select name="arr" ${me.arr ? "disabled" : ""}>${opt(ARR_OPTS, me.arr || 0)}</select></div><button class="btn btn-orange">${ICONS.save} Ajouter</button></form>`);
          document.getElementById("nf").onsubmit = async e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); d.qte = +d.qte; d.seuil = +d.seuil; d.arr = me.arr || +d.arr; d.hist = [{date:new Date().toISOString(), delta:d.qte, motif:"Inventaire initial", by:me.prenom + " " + me.nom}]; if (await act(() => Store.add("stocks", d), "Article ajouté.")) refresh(); };
        };
      },

      /* ---------------- Chantiers ---------------- */
      chantiers(el) {
        const list = L("chantiers").slice().sort((a, b) => (a.statut === "Réalisé") - (b.statut === "Réalisé") || b.avancement - a.avancement);
        const bud = list.reduce((a, c) => a + c.budget, 0), eng = list.reduce((a, c) => a + c.engage, 0);
        const arrs = me.arr ? [me.arr] : [1,2,3,4];
        el.innerHTML = kpis([["crane","ic-b", list.filter(c => c.statut === "En cours").length, "chantiers en cours"],["check","ic-g", list.filter(c => c.statut === "Réalisé").length, "chantiers réalisés"],["wallet","ic-y", mshort(bud), "FCFA programmés"],["chart","ic-o", bud ? Math.round(eng / bud * 100) + " %" : "—", "du budget engagé"]]) +
          `<div class="card"><h2>Dotation 2026 : 250 M FCFA par arrondissement</h2>${`<div class="hbars">${arrs.map(a => { const v = list.filter(c => +c.arr === a).reduce((s, c) => s + c.engage, 0); return `<div class="r"><span>${arrL(a)} · engagé</span><div class="prog"><i style="width:${Math.min(100, v / 2.5e6)}%"></i></div><b>${mshort(v)} / 250 M</b></div>`; }).join("")}</div>`}</div>
          <div class="card"><h2>Projets & chantiers <button class="btn btn-orange btn-sm" id="new">${ICONS.plus} Nouveau chantier</button></h2>
          ${tbl(["Chantier","Arr.","Statut","Avancement","Budget","Engagé"], list.map(c => `<tr class="clk" data-id="${c.id}"><td><b>${esc(c.titre)}</b><br><small style="color:var(--muted)">${esc(c.theme)} · ${esc(c.entreprise || "Prestataire à désigner")}</small></td><td>${arrL(c.arr)}</td><td>${stChip(c.statut)}</td><td style="min-width:130px"><div style="display:flex;gap:.5rem;align-items:center"><div class="prog" style="flex:1"><i style="width:${c.avancement}%"></i></div><b style="font-size:.8rem">${c.avancement} %</b></div></td><td style="white-space:nowrap">${mshort(c.budget)}</td><td style="white-space:nowrap">${mshort(c.engage)}</td></tr>`), "Aucun chantier")}</div>`;
        const edit = c => {
          const isNew = !c; c = c || {titre:"", arr:me.arr || 1, theme:"Assainissement", budget:0, engage:0, avancement:0, statut:"Programmé", debut:"", fin:"", entreprise:"", notes:[]};
          modal(isNew ? "Nouveau chantier" : c.titre, `<form class="form" id="cf">
            <div class="field"><label>Intitulé</label><input name="titre" required value="${esc(c.titre)}"></div>
            <div class="row"><div class="field"><label>Arrondissement</label><select name="arr" ${me.arr ? "disabled" : ""}>${opt(ARR_OPTS, c.arr)}</select></div><div class="field"><label>Thème</label><select name="theme">${opt(["Assainissement","Voirie","Éclairage","Cadre de vie","Logement","Équipement","Social"], c.theme)}</select></div></div>
            <div class="row"><div class="field"><label>Budget (FCFA)</label><input name="budget" type="number" min="0" value="${c.budget}"></div><div class="field"><label>Montant engagé (FCFA)</label><input name="engage" type="number" min="0" value="${c.engage}"></div></div>
            <div class="row"><div class="field"><label>Statut</label><select name="statut">${opt(Store.STATUTS.chantiers, c.statut)}</select></div><div class="field"><label>Avancement : <b id="avv">${c.avancement} %</b></label><input name="avancement" type="range" min="0" max="100" step="5" value="${c.avancement}" style="padding:0"></div></div>
            <div class="row"><div class="field"><label>Début</label><input name="debut" type="date" value="${esc(c.debut)}"></div><div class="field"><label>Fin prévue</label><input name="fin" type="date" value="${esc(c.fin)}"></div></div>
            <div class="field"><label>Entreprise / régie</label><input name="entreprise" value="${esc(c.entreprise)}"></div>
            <div class="field"><label>Ajouter une note de suivi</label><input name="note" placeholder="Ex. deuxième tronçon terminé"></div>
            ${c.notes && c.notes.length ? `<div class="hist">${c.notes.slice().reverse().map(n => `<div><small>${date(n.date)}</small>${esc(n.texte)}</div>`).join("")}</div>` : ""}
            <div style="display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn btn-orange">${ICONS.save} Enregistrer</button>${isNew ? "" : `<button type="button" class="btn btn-line" id="cdel">Supprimer</button>`}</div></form>`);
          const fm = document.getElementById("cf");
          fm.avancement.oninput = () => document.getElementById("avv").textContent = fm.avancement.value + " %";
          fm.onsubmit = async e => {
            e.preventDefault(); const d = Object.fromEntries(new FormData(fm)); const note = d.note; delete d.note;
            d.arr = me.arr || +d.arr; d.budget = +d.budget; d.engage = +d.engage; d.avancement = +d.avancement;
            d.notes = (c.notes || []).concat(note ? [{date:new Date().toISOString(), texte:note}] : []);
            if (await act(() => isNew ? Store.add("chantiers", d) : Store.update("chantiers", c.id, d), "Chantier enregistré.")) { Store.log(isNew ? "Chantier créé" : "Chantier mis à jour", d.titre + " : " + d.avancement + " %"); refresh(); }
          };
          const del = document.getElementById("cdel"); if (del) del.onclick = async () => { if (confirm("Supprimer ce chantier ?") && await act(() => Store.remove("chantiers", c.id), "Chantier supprimé.")) refresh(); };
        };
        el.querySelector("#new").onclick = () => edit(null);
        el.querySelectorAll("[data-id]").forEach(tr => tr.onclick = () => edit(Store.db().chantiers.find(c => c.id === tr.dataset.id)));
      },

      /* ---------------- Publications ---------------- */
      publications(el) {
        const list = L("publications").slice().sort((a, b) => b.date.localeCompare(a.date));
        el.innerHTML = `<div class="card"><h2>Publications <button class="btn btn-orange btn-sm" id="new">${ICONS.plus} Nouvelle publication</button></h2>
          <p style="color:var(--muted);font-size:.88rem;margin-bottom:1rem">Les publications marquées « En ligne » apparaissent immédiatement sur la page d'accueil et la page Actualités du site.</p>
          <div class="feed">${list.length ? list.map(p => `<div class="post ${p.publie ? "" : "devoir"}"><div class="top"><h4>${esc(p.titre)}</h4><span class="chip ${p.publie ? "ok" : "warn"}">${p.publie ? "En ligne" : "Brouillon"}</span></div><p>${esc(p.texte)}</p><small>${esc(p.type)} · ${arrL(p.arr)} · ${date(p.date)}</small>
            <div class="mini-btns" style="margin-top:.5rem"><button class="btn btn-line btn-sm" data-tog="${p.id}">${p.publie ? "Retirer du site" : "Publier sur le site"}</button><button class="btn btn-line btn-sm" data-ed="${p.id}">Modifier</button><button class="btn btn-line btn-sm" data-del="${p.id}">Supprimer</button></div></div>`).join("") : empty("Aucune publication", "mega")}</div></div>`;
        const edit = p => {
          const isNew = !p; p = p || {type:"Communiqué", titre:"", texte:"", arr:me.arr || 0, publie:true};
          modal(isNew ? "Nouvelle publication" : "Modifier la publication", `<form class="form" id="pf"><div class="row"><div class="field"><label>Type</label><select name="type">${opt(["Communiqué","Avis","Marché public","Recrutement","Actualité"], p.type)}</select></div><div class="field"><label>Émetteur</label><select name="arr" ${me.arr ? "disabled" : ""}>${opt(ARR_OPTS, p.arr)}</select></div></div>
            <div class="field"><label>Titre</label><input name="titre" required maxlength="140" value="${esc(p.titre)}"></div><div class="field"><label>Texte</label><textarea name="texte" required>${esc(p.texte)}</textarea></div>
            <label style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" name="publie" ${p.publie ? "checked" : ""}> Publier immédiatement sur le site</label><button class="btn btn-orange">${ICONS.save} Enregistrer</button></form>`);
          document.getElementById("pf").onsubmit = async e => {
            e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); d.publie = !!d.publie; d.arr = me.arr || +d.arr;
            if (await act(() => isNew ? Store.add("publications", d) : Store.update("publications", p.id, d), d.publie ? "Publié sur le site." : "Brouillon enregistré.")) { Store.log("Publication", d.titre); refresh(); }
          };
        };
        el.querySelector("#new").onclick = () => edit(null);
        el.querySelectorAll("[data-ed]").forEach(b => b.onclick = () => edit(Store.db().publications.find(p => p.id === b.dataset.ed)));
        el.querySelectorAll("[data-tog]").forEach(b => b.onclick = async () => { const p = Store.db().publications.find(x => x.id === b.dataset.tog); if (await act(() => Store.update("publications", p.id, {publie:!p.publie}), p.publie ? "Publication retirée du site." : "Publié sur le site.")) refresh(); });
        el.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => { if (confirm("Supprimer cette publication ?") && await act(() => Store.remove("publications", b.dataset.del), "Publication supprimée.")) refresh(); });
      },

      /* ---------------- Messages du site ---------------- */
      contacts(el) {
        const list = Store.list("contacts").slice().sort((a, b) => b.date.localeCompare(a.date));
        el.innerHTML = `<div class="card"><h2>Messages reçus via le site</h2><div class="feed">${list.length ? list.map(c => `<div class="post ${c.lu ? "" : "urgent"}"><div class="top"><h4>${esc(c.sujet)} — ${esc(c.nom)}</h4>${c.lu ? `<span class="chip neu">Lu</span>` : `<span class="chip bad">Nouveau</span>`}</div><p>${esc(c.message)}</p>${(c.pj || []).length ? `<div class="pjlist" style="margin:.4rem 0">${c.pj.map(x => `<a class="pjchip" href="${x.data}" download="${esc(x.nom)}" target="_blank">${ICONS.file}${esc(x.nom)} <small>${x.taille || ""} Ko</small></a>`).join("")}</div>` : ""}<small>À : ${+c.arr ? "Mairie du " + arrL(c.arr) : "Mairie centrale"} · ${esc(c.email)}${c.tel ? " · " + esc(c.tel) : ""} · ${ago(c.date)}</small>
          <div class="mini-btns" style="margin-top:.5rem">${c.email ? `<a class="btn btn-navy btn-sm" href="mailto:${esc(c.email)}?subject=${encodeURIComponent("Re : " + c.sujet)}">${ICONS.mail} Répondre</a>` : ""}${c.lu ? "" : `<button class="btn btn-line btn-sm" data-lu="${c.id}">Marquer comme lu</button>`}<button class="btn btn-line btn-sm" data-del="${c.id}">Supprimer</button></div></div>`).join("") : empty("Aucun message", "mail")}</div></div>`;
        el.querySelectorAll("[data-lu]").forEach(b => b.onclick = async () => { if (await act(() => Store.update("contacts", b.dataset.lu, {lu:true}))) refresh(); });
        el.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => { if (confirm("Supprimer ce message ?") && await act(() => Store.remove("contacts", b.dataset.del), "Message supprimé.")) refresh(); });
      },

      /* ---------------- Journal ---------------- */
      journal(el) {
        const list = Store.list("journal").slice().sort((a, b) => b.date.localeCompare(a.date));
        el.innerHTML = `<div class="card"><h2>Journal d'activité <button class="btn btn-line btn-sm" id="exp">${ICONS.dl} Export</button></h2><p style="color:var(--muted);font-size:.88rem;margin-bottom:1rem">Chaque action importante est horodatée et signée : une réponse directe au besoin de traçabilité relevé par l'audit de mai 2026.</p>
          ${tbl(["Date","Agent","Action","Détail"], list.slice(0, 300).map(j => `<tr><td style="white-space:nowrap">${dtime(j.date)}</td><td>${esc(j.user)}</td><td><b>${esc(j.action)}</b></td><td>${esc(j.detail)}</td></tr>`), "Aucune activité enregistrée")}</div>`;
        el.querySelector("#exp").onclick = () => csv("journal-activite", ["Date","Agent","Action","Détail"], list.map(j => [dtime(j.date), j.user, j.action, j.detail]));
      },

      /* ---------------- Comptes ---------------- */
      comptes(el) {
        const users = Store.db().users.slice().sort((a, b) => (a.arr - b.arr) || a.role.localeCompare(b.role));
        el.innerHTML = `<div class="cols"><div class="card"><h2>Comptes agents</h2>${tbl(["Identifiant","Nom","Profil","Périmètre",""], users.map(u => `<tr><td><b>${esc(u.login)}</b></td><td>${esc(u.prenom)} ${esc(u.nom)}<br><small style="color:var(--muted)">${esc(u.titre || "")}</small></td><td>${esc(Store.ROLES[u.role].l)}</td><td>${u.arr ? arrL(u.arr) : "Toute la commune"}</td><td><div class="mini-btns"><button class="btn btn-line btn-sm" data-pw="${u.id}">Mot de passe</button>${u.id === me.id ? "" : `<button class="btn btn-line btn-sm" data-del="${u.id}">Supprimer</button>`}</div></td></tr>`))}</div>
          <div class="card"><h2>Créer un compte</h2><form class="form" id="uf">
            <div class="row"><div class="field"><label>Prénom</label><input name="prenom" required></div><div class="field"><label>Nom</label><input name="nom" required></div></div>
            <div class="field"><label>Profil</label><select name="role">${opt(Object.entries(Store.ROLES).map(([k, r]) => [k, r.l]), "etatcivil")}</select></div>
            <div class="field"><label>Périmètre</label><select name="arr">${opt([["0","Toute la commune (mairie centrale)"], ...ARR_OPTS.slice(1)])}</select></div>
            <div class="field"><label>Fonction (affichée)</label><input name="titre" placeholder="Ex. Agent d'état civil"></div>
            <div class="row"><div class="field"><label>Identifiant</label><input name="login" required pattern="[A-Za-z0-9._-]{3,40}"></div><div class="field"><label>Mot de passe</label><input name="password" required minlength="6"></div></div>
            <button class="btn btn-orange">${ICONS.plus} Créer le compte</button></form></div></div>`;
        el.querySelector("#uf").onsubmit = async e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); if (await act(() => Store.createUser(d), "Compte créé : " + d.login)) { Store.log("Compte créé", d.login + " · " + Store.ROLES[d.role].l); route(false); } };
        el.querySelectorAll("[data-pw]").forEach(b => b.onclick = async () => { const p = prompt("Nouveau mot de passe (6 caractères minimum) :"); if (p && await act(() => Store.setPassword(b.dataset.pw, p), "Mot de passe modifié.")) route(false); });
        el.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => { if (confirm("Supprimer ce compte ?") && await act(() => Store.deleteUser(b.dataset.del), "Compte supprimé.")) route(false); });
      },

      /* ---------------- Mon compte ---------------- */
      compte(el) {
        el.innerHTML = `<div class="cols"><div class="card"><h2>Mon profil</h2>
            <div class="stu" style="margin-bottom:1rem"><span class="av" style="width:56px;height:56px;font-size:1.1rem">${ini(me)}</span><span><b style="font-size:1.1rem">${esc(me.prenom + " " + me.nom)}</b><small>${esc(me.titre || "")}</small></span></div>
            <p style="color:var(--muted)">Identifiant : <b style="color:var(--navy)">${esc(me.login)}</b><br>Profil : <b style="color:var(--navy)">${esc(Store.ROLES[me.role].l)}</b><br>Périmètre : <b style="color:var(--navy)">${me.arr ? arrL(me.arr).replace("arr.", "arrondissement") : "Toute la commune"}</b></p>
            ${Store.LIVE ? "" : `<button class="btn btn-line btn-sm" id="rst" style="margin-top:1rem">Réinitialiser les données de démonstration</button>`}</div>
          <div class="card"><h2>Changer mon mot de passe</h2><form class="form" id="pwf">
            <div class="field"><label for="np1">Nouveau mot de passe</label><input id="np1" type="password" minlength="6" required autocomplete="new-password"></div>
            <div class="field"><label for="np2">Confirmer</label><input id="np2" type="password" minlength="6" required autocomplete="new-password"></div>
            <button class="btn btn-orange">${ICONS.lock} Mettre à jour</button></form></div></div>`;
        el.querySelector("#pwf").onsubmit = async e => {
          e.preventDefault(); const a = el.querySelector("#np1").value, b = el.querySelector("#np2").value;
          if (a !== b) return toast("Les deux mots de passe ne correspondent pas.", "err");
          if (await act(() => Store.changePassword(a), "Mot de passe mis à jour.")) e.target.reset();
        };
        const r = el.querySelector("#rst"); if (r) r.onclick = async () => { if (confirm("Remettre toutes les données de démonstration à zéro ?")) { await Store.reset(); await Store.logout(); location.href = "espace.html"; } };
      },
    };
    shell();
  }

  /* ---------------- Fiches partagées ---------------- */
  function calList(list, del) {
    if (!list.length) return empty("Aucun rendez-vous", "cal");
    return `<div class="cal-list">${list.map(e => { const d = new Date(e.date); return `<div class="cal-item"><div class="d"><b>${d.getDate()}</b><small>${d.toLocaleDateString("fr-FR", {month:"short"})}</small></div><div><h4>${esc(e.titre)}</h4><p>${d.toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit"})} · ${esc(e.lieu || "")} · ${esc(e.type)}</p></div>${del ? `<button class="btn btn-line btn-sm" data-delev="${e.id}" aria-label="Supprimer">×</button>` : "<span></span>"}</div>`; }).join("")}</div>`;
  }

  function dossiers(el, col) {
    const isD = col === "demandes", STS = Store.STATUTS[col];
    const f = F[col] || (F[col] = {statut:"ouverts", arr:"", q:"", type:""});
    const all = Store.list(col);
    const types = isD ? DEMARCHES.filter(d => !d.signal).map(d => [d.id, d.t]) : TYPES_SIGNAL.map(t => [t[0], t[1]]);
    const draw = () => {
      const list = all.filter(d => (f.statut === "ouverts" ? !/Remise|Rejetée|Résolu/.test(d.statut) : !f.statut || d.statut === f.statut) && (!f.arr || String(d.arr) === f.arr) && (!f.type || d.type === f.type) && (!f.q || (d.ref + " " + d.nom + " " + d.prenom + " " + (d.quartier || "")).toLowerCase().includes(f.q.toLowerCase())))
        .sort((a, b) => b.date.localeCompare(a.date));
      el.querySelector("#list").innerHTML = tbl(isD ? ["Dossier","Demandeur","Démarche","Arr.","Déposé","Paiement","Statut"] : ["Réf.","Problème","Lieu","Arr.","Priorité","Signalé","Statut"],
        list.map(d => isD
          ? `<tr class="clk" data-id="${d.id}"><td><b>${d.ref}</b></td><td>${esc(d.prenom)} ${esc(d.nom)}<br><small style="color:var(--muted)">${esc(d.tel)}</small></td><td>${esc(d.typeLabel)}</td><td>${arrL(d.arr)}</td><td style="white-space:nowrap">${date(d.date)}${open(d.statut) && days(d.date) > 7 ? ` <span class="chip warn">+7 j</span>` : ""}</td><td>${payChip(d)}${(d.pj || []).length ? ` <span class="chip neu" title="Pièces jointes">📎 ${d.pj.length}</span>` : ""}</td><td>${stChip(d.statut)}</td></tr>`
          : `<tr class="clk" data-id="${d.id}"><td><b>${d.ref}</b></td><td>${esc(d.typeLabel)}</td><td>${esc(d.quartier)}<br><small style="color:var(--muted)">${esc(d.lieu || "")}</small></td><td>${arrL(d.arr)}</td><td>${d.priorite === "Haute" ? `<span class="chip bad">Haute</span>` : `<span class="chip neu">Normale</span>`}</td><td style="white-space:nowrap">${ago(d.date)}${(d.pj || []).length ? ` <span class="chip neu">📷 ${d.pj.length}</span>` : ""}</td><td>${stChip(d.statut)}</td></tr>`), "Aucun dossier ne correspond aux filtres");
      el.querySelector("#cnt").textContent = list.length + " dossier(s)";
      el.querySelectorAll("#list [data-id]").forEach(tr => tr.onclick = () => fiche(col, tr.dataset.id));
    };
    const open = s => !/Remise|Rejetée|Résolu|Prête/.test(s);
    const cnt = s => all.filter(d => d.statut === s).length;
    el.innerHTML = kpis(isD
      ? [["inbox","ic-o", cnt("Nouvelle"), "nouvelles demandes"],["clock","ic-b", cnt("En traitement") + cnt("Pièce manquante"), "en traitement"],["check","ic-g", cnt("Prête"), "prêtes à retirer"],["chart","ic-y", all.length, "demandes au total"]]
      : [["alert","ic-o", cnt("Nouveau"), "nouveaux signalements"],["crane","ic-b", cnt("Pris en charge") + cnt("En intervention"), "en cours de traitement"],["check","ic-g", cnt("Résolu"), "résolus"],["wave","ic-y", all.filter(s => s.type === "canal" && s.statut !== "Résolu").length, "canaux à curer"]]) +
      `<div class="card"><h2><span>${isD ? "Demandes" : "Signalements"} <small id="cnt" style="color:var(--muted);font-weight:500;font-size:.8rem"></small></span><span class="mini-btns">${isD ? `<button class="btn btn-orange btn-sm" id="new">${ICONS.plus} Demande au guichet</button>` : ""}<button class="btn btn-line btn-sm" id="exp">${ICONS.dl} Export</button></span></h2>
      <div class="toolbar"><div class="field"><label>Rechercher</label><input data-f="q" placeholder="N° de dossier, nom, quartier" value="${esc(f.q)}"></div><div class="field"><label>Statut</label><select data-f="statut">${opt([["ouverts","En cours (non clos)"],["","Tous"], ...STS], f.statut)}</select></div><div class="field"><label>Type</label><select data-f="type"><option value="">Tous</option>${opt(types, f.type)}</select></div>${me.arr ? "" : `<div class="field"><label>Arrondissement</label><select data-f="arr"><option value="">Tous</option>${opt(ARR_OPTS.slice(1), f.arr)}</select></div>`}</div>
      <div id="list"></div></div>`;
    filterBar(null, e => { f[e.target.dataset.f] = e.target.value; draw(); }, el);
    el.querySelector("#exp").onclick = () => csv(col, ["Référence","Type","Nom","Prénom","Téléphone","Quartier","Arrondissement","Date","Statut"], all.map(d => [d.ref, d.typeLabel, d.nom, d.prenom, d.tel, d.quartier, arrL(d.arr), date(d.date), d.statut]));
    const nb = el.querySelector("#new");
    if (nb) nb.onclick = () => {
      modal("Enregistrer une demande au guichet", `<form class="form" id="gf"><div class="field"><label>Démarche</label><select name="type">${opt(types)}</select></div>
        <div class="row"><div class="field"><label>Prénom</label><input name="prenom" required></div><div class="field"><label>Nom</label><input name="nom" required></div></div>
        <div class="row"><div class="field"><label>Téléphone</label><input name="tel" required></div><div class="field"><label>Quartier</label><input name="quartier" required></div></div>
        <div class="field"><label>Arrondissement</label><select name="arr" ${me.arr ? "disabled" : ""}>${opt(ARR_OPTS.slice(1), me.arr || 1)}</select></div>
        <div class="field"><label>Précisions</label><textarea name="details" style="min-height:80px"></textarea></div><button class="btn btn-orange">${ICONS.save} Enregistrer et remettre le numéro</button></form>`);
      document.getElementById("gf").onsubmit = async e => {
        e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)), dm = DEMARCHES.find(x => x.id === d.type);
        const ref = await act(() => Store.submitDemande({...d, arr:me.arr || +d.arr, typeLabel:dm.t, service:dm.service, email:"", montant:dm.prix || 0, paiement:dm.prix ? {choix:"guichet", statut:"À régler"} : {statut:"Gratuit"}, pj:[], document:null}));
        if (ref) { await Store.init(); Store.log("Demande au guichet", ref + " · " + dm.t); refresh(); modal("Demande enregistrée", `<p class="lead-p">Numéro à remettre à l'usager :</p><div class="refbig" style="text-align:center;margin:1rem 0">${ref}</div><p style="color:var(--muted)">L'usager peut suivre l'avancement sur le site, rubrique « Suivre mon dossier ».</p>`); }
      };
    };
    draw();
  }

  const payChip = d => { const p = d.paiement || {}; return p.statut === "Payé" ? `<span class="chip ok" title="${esc(p.mode || "")}">Payé${p.mode ? " · " + (p.mode === "Airtel Money" ? "Airtel" : p.mode === "Carte bancaire" ? "Carte" : esc(p.mode)) : ""}</span>` : p.statut === "À régler" ? `<span class="chip warn">À régler${p.choix === "guichet" ? " (guichet)" : ""}</span>` : `<span class="chip neu">Gratuit</span>`; };
  const pubOf = d => ({ref:d.ref, typeId:d.type, type:d.typeLabel, prenom:d.prenom, nom:d.nom, quartier:d.quartier, arr:d.arr, date:d.date, montant:d.montant, paiement:d.paiement, document:d.document});

  function fiche(col, id) {
    const d = Store.db()[col].find(x => x.id === id); if (!d) return;
    const isD = col === "demandes", STS = Store.STATUTS[col], dem = isD ? DEMARCHES.find(x => x.id === d.type) || {} : {};
    const nextNote = {"En traitement":`Dossier pris en charge par le service ${d.service || "technique"}.`, "Pièce manquante":"Merci de fournir : ", "Prête":dem.doc ? "Votre document est prêt : téléchargez-le en ligne depuis « Suivre mon dossier » ou retirez-le au guichet." : "Votre dossier est prêt : présentez-vous au guichet avec votre pièce d'identité.", "Remise":"Document remis au demandeur.", "Rejetée":"", "Pris en charge":"Équipe des services techniques informée.", "En intervention":"Équipe sur place.", "Résolu":"Intervention terminée. Merci pour votre signalement."};
    const p = d.paiement || {};
    const payBox = !isD ? "" : !d.montant ? `<div class="sbox"><div><b>${ICONS.check} Démarche gratuite</b></div></div>`
      : p.statut === "Payé" ? `<div class="sbox ok"><div><b>${ICONS.check} Payé : ${money(d.montant)}</b><small>${esc(p.mode)} · ${dtime(p.date)} · quittance ${esc(p.quittance)}${p.transaction ? " · transaction " + esc(p.transaction) : ""}</small></div><button class="btn btn-line btn-sm" id="frecu">${ICONS.dl} Reçu</button></div>`
      : `<div class="sbox warn"><div><b>${ICONS.wallet} À régler : ${money(d.montant)}</b><small>${p.choix === "guichet" ? "L'usager a choisi de payer à la mairie." : "Paiement en ligne non finalisé."} Encaisser au guichet :</small></div><div class="mini-btns"><select id="encmode" class="btn btn-line btn-sm">${opt(Store.MODES)}</select><button class="btn btn-orange btn-sm" id="enc">${ICONS.wallet} Encaisser</button></div></div>`;
    const pjBox = (d.pj || []).length ? `<h4 style="margin-top:1rem;color:var(--navy)">Pièces jointes par l'usager</h4><div class="pjlist">${(d.pj || []).map(x => `<a class="pjchip" href="${x.data}" download="${esc(x.nom)}" target="_blank">${ICONS.file}${esc(x.nom)} <small>${x.taille || ""} Ko</small></a>`).join("")}</div>${d.pj.filter(x => /^image/.test(x.type)).map(x => `<img class="pjimg" src="${x.data}" alt="${esc(x.nom)}">`).join("")}` : "";
    const docBox = !isD || !dem.doc ? "" : `<h4 style="margin-top:1rem;color:var(--navy)">Document délivré à l'usager</h4>
      <div class="sbox doc"><div><b>${ICONS.file} ${d.document ? (d.document.type === "fichier" ? "Fichier joint : " + esc(d.document.nom) : "Document généré automatiquement (PDF)") : "Pas encore délivré"}</b><small>${d.document ? "Téléchargeable par l'usager une fois la démarche payée et le statut « Prête »." : "Il sera généré automatiquement au passage en « Prête », ou joignez le document scanné/signé."}</small></div>
      <div class="mini-btns"><button class="btn btn-line btn-sm" id="dprev">${ICONS.dl} Aperçu PDF</button><label class="btn btn-line btn-sm" for="dfile">${ICONS.plus} Joindre le document signé</label><input type="file" id="dfile" accept="application/pdf,image/*" class="sr-only"></div></div>`;
    modal(d.ref + " · " + d.typeLabel, `<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem">${stChip(d.statut)}<span class="chip neu">${arrL(d.arr)}</span>${isD ? payChip(d) : ""}${d.priorite ? `<span class="chip ${d.priorite === "Haute" ? "bad" : "neu"}">Priorité ${d.priorite.toLowerCase()}</span>` : ""}</div>
      <div class="kv"><div><small>${isD ? "Demandeur" : "Signalé par"}</small><b>${esc(d.prenom)} ${esc(d.nom)}</b></div><div><small>Téléphone</small><b>${esc(d.tel)}</b></div><div><small>Quartier</small><b>${esc(d.quartier)}</b></div><div><small>Déposé le</small><b>${date(d.date)}</b></div>${isD ? `<div><small>Service</small><b>${esc(d.service)}</b></div>` : `<div><small>Lieu</small><b>${esc(d.lieu || "—")}</b></div>`}</div>
      ${d.details || d.description ? `<p style="background:var(--bg);padding:.8rem 1rem;border-radius:10px;font-size:.9rem">${esc(d.details || d.description)}</p>` : ""}
      ${payBox}${pjBox}${docBox}
      <h4 style="margin-top:1.2rem;color:var(--navy)">Historique</h4>
      <div class="hist">${d.historique.slice().reverse().map(h => `<div class="${h.pub ? "" : "priv"}"><small>${dtime(h.date)} · ${h.pub ? "visible par l'usager" : "note interne"}</small><b>${esc(h.statut)}</b> — ${esc(h.note)}</div>`).join("")}</div>
      <form class="form" id="sf" style="border-top:1px solid var(--line);padding-top:1rem">
        <div class="row"><div class="field"><label>Nouveau statut</label><select name="statut">${opt(STS, d.statut)}</select></div>${isD ? "" : `<div class="field"><label>Priorité</label><select name="priorite">${opt(["Normale","Haute"], d.priorite)}</select></div>`}</div>
        <div class="field"><label>Message / note</label><textarea name="note" style="min-height:80px" required></textarea></div>
        <label style="display:flex;gap:.5rem;align-items:center;font-size:.88rem"><input type="checkbox" name="pub" checked> Visible par l'usager dans le suivi en ligne</label>
        <div style="display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn btn-orange">${ICONS.save} Mettre à jour le dossier</button>${d.tel ? `<a class="btn btn-line" href="tel:${esc(d.tel.replace(/\s/g, ""))}">${ICONS.phone} Appeler</a>` : ""}</div></form>`);
    const fm = document.getElementById("sf");
    const setNote = () => { fm.note.value = nextNote[fm.statut.value] ?? ""; };
    fm.statut.onchange = setNote; if (fm.statut.value === d.statut) fm.note.value = "";
    fm.onsubmit = async e => {
      e.preventDefault(); const v = Object.fromEntries(new FormData(fm));
      const h = d.historique.concat([{date:new Date().toISOString(), statut:v.statut, note:v.note, pub:!!v.pub, by:me.prenom + " " + me.nom}]);
      const patch = {statut:v.statut, historique:h}; if (v.priorite) patch.priorite = v.priorite;
      if (isD && dem.doc && v.statut === "Prête" && !d.document) patch.document = {type:"auto", date:new Date().toISOString()};
      if (await act(() => Store.update(col, d.id, patch), "Dossier " + d.ref + " mis à jour.")) { Store.log(isD ? "Demande traitée" : "Signalement traité", d.ref + " → " + v.statut); refresh(); }
    };
    const enc = document.getElementById("enc");
    if (enc) enc.onclick = async () => { const mode = document.getElementById("encmode").value; enc.disabled = true; const r = await act(() => Store.encaisser(d.id, mode), "Paiement encaissé : " + money(d.montant)); if (r) { Store.log("Encaissement", d.ref + " · " + mode + " · " + money(d.montant)); refresh(); quittance(r); } else enc.disabled = false; };
    const fr = document.getElementById("frecu"); if (fr) fr.onclick = () => downloadRecu(pubOf(d)).catch(e => toast(e.message, "err"));
    const dp = document.getElementById("dprev"); if (dp) dp.onclick = () => downloadDocument({...pubOf(d), document:d.document || {type:"auto", date:new Date().toISOString()}}).catch(e => toast(e.message, "err"));
    const df = document.getElementById("dfile");
    if (df) df.onchange = async () => {
      let files; try { files = await readFiles(df); } catch (e) { return toast(e.message, "err"); }
      if (!files.length) return; const x = files[0];
      if (await act(() => Store.update("demandes", d.id, {document:{type:"fichier", nom:x.nom, data:x.data, date:new Date().toISOString()}}), "Document joint au dossier : l'usager pourra le télécharger.")) { Store.log("Document délivré", d.ref + " · " + x.nom); refresh(); fiche(col, id); }
    };
  }

  function acteView(a) {
    const TY = {naissance:"ACTE DE NAISSANCE", mariage:"ACTE DE MARIAGE", deces:"ACTE DE DÉCÈS"};
    const rows = [["N° d'acte", a.num], ["Nom", a.nom], ["Prénom(s)", a.prenoms], ["Sexe", a.sexe === "F" ? "Féminin" : "Masculin"], [a.type === "deces" ? "Date du décès" : a.type === "mariage" ? "Date du mariage" : "Date de naissance", date(a.dateEvt)], ["Lieu", a.lieu]];
    if (a.pere) rows.push(["Père", a.pere]); if (a.mere) rows.push(["Mère", a.mere]); if (a.conjoint) rows.push(["Conjoint(e)", a.conjoint]); if (a.regime) rows.push(["Régime", a.regime]);
    const html = `<div class="acte"><p class="rep">République gabonaise · Union – Travail – Justice</p><p class="rep" style="margin-top:.3rem">Commune de Port-Gentil · ${esc(arrL(a.arr).replace("arr.", "arrondissement"))}</p><h2 style="margin-top:1.2rem">EXTRAIT D'${TY[a.type]}</h2>
      <table>${rows.map(([k, v]) => `<tr><td>${k}</td><td><b>${esc(v)}</b></td></tr>`).join("")}</table>
      <div class="foot"><span>Délivré à Port-Gentil, le ${date(new Date())}</span><span>L'officier d'état civil<br><br><br>Signature & cachet</span></div>
      <p style="text-align:center;font-size:.7rem;color:#999;margin-top:1.5rem">Document de démonstration — sans valeur légale</p></div>`;
    modal("Extrait " + a.num, html + `<div style="display:flex;gap:.6rem;margin-top:1rem;justify-content:center"><button class="btn btn-orange" id="pr">${ICONS.print} Imprimer l'extrait</button></div>`);
    document.getElementById("pr").onclick = () => printHTML("Extrait " + a.num, html);
  }

  function quittance(r) {
    const html = `<div class="acte"><p class="rep">Commune de Port-Gentil · Recette municipale</p><h2 style="margin-top:1rem">QUITTANCE ${esc(r.quittance)}</h2>
      <table><tr><td>Date</td><td><b>${dtime(r.date)}</b></td></tr><tr><td>Nature</td><td><b>${esc(r.nature)}</b></td></tr><tr><td>Payeur</td><td><b>${esc(r.payeur)}</b></td></tr><tr><td>Arrondissement</td><td><b>${esc(arrL(r.arr))}</b></td></tr><tr><td>Mode de paiement</td><td><b>${esc(r.mode)}</b></td></tr><tr><td>Montant</td><td><b style="font-size:1.2rem">${money(r.montant)}</b></td></tr><tr><td>Encaissé par</td><td><b>${esc(r.agent || "")}</b></td></tr></table>
      <div class="foot"><span>Pour acquit</span><span>Le receveur municipal</span></div><p style="text-align:center;font-size:.7rem;color:#999;margin-top:1.5rem">Document de démonstration — sans valeur légale</p></div>`;
    modal("Quittance " + r.quittance, html + `<div style="display:flex;gap:.6rem;margin-top:1rem;justify-content:center"><button class="btn btn-orange" id="pr">${ICONS.print} Imprimer</button></div>`);
    document.getElementById("pr").onclick = () => printHTML("Quittance " + r.quittance, html);
  }

  return {boot};
})();
