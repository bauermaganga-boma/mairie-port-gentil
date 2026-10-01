/* Mairie de Port-Gentil — contenus du site (sources : dossiers de recherche du 1er octobre 2026) */
const MAIRIE = {
  nom: "Mairie de Port-Gentil",
  court: "Port-Gentil",
  commune: "Commune de Port-Gentil",
  province: "Ogooué-Maritime",
  devise: "Capitale économique du Gabon",
  adresse: "Hôtel de ville, Port-Gentil, Ogooué-Maritime, Gabon",
  maire: "Pascal Houangni Ambouroue",
  election: "9 novembre 2025",
  facebook: "https://www.facebook.com/LADRECMAIRIEDEPOG/",
  // Coordonnées non publiées en ligne : à renseigner avec la mairie (laisser vide = élément masqué)
  tels: [],
  email: "",
  whatsapp: "",
  horaires: "",
  prefixe: "PG",
};

const ICONS = {
  anchor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 22V8M5 12H2a10 10 0 0020 0h-3"/></svg>',
  truck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
  brief:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
  scale:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 21h14M3 7h18M6 7l-3 7a4 4 0 006 0zM18 7l-3 7a4 4 0 006 0z"/></svg>',
  drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.7l5.7 5.7a8 8 0 11-11.4 0z"/></svg>',
  drill:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l5 20M12 2L7 22M8.5 16h7M9.8 10h4.4M4 22h16"/></svg>',
  fish:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12c3-5 9-6 13.5 0-4.5 6-10.5 5-13.5 0zM6.5 12L2 8v8z"/><circle cx="16" cy="11" r=".6" fill="currentColor"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
  award:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><path d="M8.2 13.9L7 23l5-3 5 3-1.2-9.1"/></svg>',
  ship:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M19.4 17L22 10.5 12 7 2 10.5 4.6 17M12 2v5M8 4h8"/></svg>',
  cap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  hand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l2 2a1 1 0 003-3M14 14l2.5 2.5a1 1 0 003-3l-3.88-3.88a3 3 0 00-4.24 0l-.88.88a1 1 0 11-3-3l2.81-2.81a5.79 5.79 0 017.06-.87l.47.28a2 2 0 001.42.25L21 4M21 3l1 11h-2M3 3L2 14l6.5 6.5a1 1 0 003-3M3 4h8"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20V2H6.5A2.5 2.5 0 004 4.5v15zM4 19.5A2.5 2.5 0 006.5 22H20v-5"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  fb:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1112 21.8zm8.4-18.2A11.8 11.8 0 002.1 17.8L.4 24l6.3-1.7A11.8 11.8 0 0024 12c0-3.2-1.2-6.1-3.5-8.4z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
  mega:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 14v-3zM11.6 16.8a3 3 0 11-5.8-1.6"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
  inbox:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>',
  out:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  save:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
  baby:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3.2"/><path d="M6 21v-2a6 6 0 0112 0v2M9 13.5h6"/></svg>',
  ring:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="14" r="6"/><circle cx="15" cy="14" r="6"/><path d="M10 4l2-2 2 2"/></svg>',
  file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
  building:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01"/></svg>',
  alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>',
  light:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>',
  road:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22L8 2M20 22L16 2M12 4v3M12 11v3M12 18v3"/></svg>',
  wallet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7H5a2 2 0 010-4h13v4M3 5v14a2 2 0 002 2h15V7"/><circle cx="16" cy="14" r="1.5"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4a2 2 0 001-1.7z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16"/></svg>',
  crane:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h8M7 21V3l12 4H7M17 7v6M15 13h4v3h-4z"/></svg>',
  wave:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 6c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z"/></svg>',
  stamp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14M5 18h14v-3a3 3 0 00-3-3h-1V8a3 3 0 10-6 0v4H8a3 3 0 00-3 3z"/></svg>',
  gauge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14l4-4M3.3 19a10 10 0 1117.4 0"/></svg>',
  ext:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>',
};

/* ---------- Les quatre arrondissements (même modèle pour chacun) ---------- */
const COMMUN_ARR = [
  "Dotation 2026 de 250 millions FCFA pour des infrastructures ciblées",
  "Curage des canaux et prévention des inondations",
  "Voiries secondaires et éclairage public",
  "Réhabilitation des routes lancée en avril 2026 dans les quatre arrondissements",
  "Opération trimestrielle d'assainissement depuis janvier 2026",
];
const ARRONDISSEMENTS = [
  {n:1, t:"1er arrondissement", maire:"", img:"hotel-de-ville",
    d:"Il comprend notamment l'axe ASECNA – Cap Lopez et le secteur du carrefour Léon Mba. L'arrondissement est au cœur de l'opération « Libérez le domaine public », qui doit dégager l'espace nécessaire à l'élargissement et à la modernisation des voies.",
    reperes:["ASECNA","Cap Lopez","Carrefour Léon Mba","Cora Wood","Route de l'aéroport"],
    actions:[
      {date:"2026-09-29", t:"Démolitions des constructions sur le domaine public de l'axe ASECNA – Cap Lopez, avec une bande de 12 mètres libérée pour les futurs aménagements", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/09/29/port-gentil-la-mairie-passe-aux-demolitions/"},
      {date:"2026-01-08", t:"Assainissement du tronçon Cora Wood – carrefour Léon Mba et de la route vers l'aéroport : caniveaux débouchés, ordures évacuées", src:"Gabon Media Time", url:"https://gabonmediatime.com/port-gentil-la-mairie-declenche-une-offensive-trimestrielle-contre-linsalubrite/"},
    ], fb:""},
  {n:2, t:"2e arrondissement", maire:"", img:"marche-grand-village",
    d:"Il borde le marché de Grand Village, l'un des grands pôles commerçants de la ville. La mairie du 2e arrondissement dispose déjà de sa page Facebook et d'un site d'information (état civil, services, comités de quartier, mariage, demande d'audience).",
    reperes:["Grand Village (marché)","Centre commerçant","Comités de quartier"],
    actions:[
      {date:"2026-01-07", t:"Libération du domaine public autour du marché de Grand Village : kiosques, hangars et étals anarchiques démolis", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/01/07/port-gentil-le-nouveau-maire-en-guerre-ouverte-contre-lanarchie"},
      {date:"2026-01-08", t:"Lancement de l'opération trimestrielle d'assainissement dans les quartiers", src:"Gabon Media Time", url:"https://gabonmediatime.com/port-gentil-la-mairie-declenche-une-offensive-trimestrielle-contre-linsalubrite/"},
    ], fb:"https://www.facebook.com/Mairie2eArrondissementPortGentil/"},
  {n:3, t:"3e arrondissement", maire:"", img:"grand-village-visite",
    d:"Il partage avec le 2e arrondissement le secteur du marché de Grand Village. Ses habitants sont directement concernés par l'opération trimestrielle d'assainissement : caniveaux bouchés et dépôts d'ordures sont les premières cibles.",
    reperes:["Grand Village (marché)","Quartiers résidentiels"],
    actions:[
      {date:"2026-01-08", t:"Opération trimestrielle d'assainissement : curage des caniveaux, nettoyage des rues, évacuation des déchets", src:"Gabon Media Time", url:"https://gabonmediatime.com/port-gentil-la-mairie-declenche-une-offensive-trimestrielle-contre-linsalubrite/"},
      {date:"2026-01-07", t:"Opération de libération du domaine public autour du marché de Grand Village", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/01/07/port-gentil-le-nouveau-maire-en-guerre-ouverte-contre-lanarchie"},
    ], fb:""},
  {n:4, t:"4e arrondissement", maire:"Érick Ayang Nang", img:"terrain-4e",
    d:"Le sud de l'île Mandji, en pleine mutation : il accueille le programme de 848 logements de Lip Matanda. Sa mairie mise sur une gouvernance de proximité : canaux, voirie, lutte contre les constructions anarchiques, écoute des commerçants.",
    reperes:["Matanda","Lip Matanda","Iguiri","Matiti 1 et 2","Ntchengué","Quartier Sud","Boule-Noire 2","Salsa","Camp Boiro (marché)"],
    actions:[
      {date:"2026-09-29", t:"Démolitions sur le domaine public de l'axe Matanda – Ntchengué", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/09/29/port-gentil-la-mairie-passe-aux-demolitions/"},
      {date:"2026-09-25", t:"Lancement des 848 logements de Lip Matanda par le Président de la République", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/09/25/port-gentil-lancement-des-travaux-de-848-logements-a-lip-matanda/"},
      {date:"2026-02-10", t:"Curage des canaux de Lip Matanda, regards de Matiti 1 et 2, concertation au marché de Camp Boiro", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/02/10/port-gentil-ecoute-et-actions-de-terrain-pour-le-maire-du-4eme-arrondissement"},
    ], fb:"https://www.facebook.com/p/Port-Gentil-Mairie-du-4%C3%A8me-Arrondissement-100079508306412/"},
];
const QUARTIERS = ["ASECNA","Cap Lopez","Carrefour Léon Mba","Cora Wood","Grand Village","Centre-ville","Bord de mer","La Balise","Matanda","Lip Matanda","Iguiri","Matiti 1","Matiti 2","Ntchengué","Quartier Sud","Boule-Noire 2","Salsa","Camp Boiro"];

/* ---------- Démarches (pièces indicatives : à valider avec les services) ---------- */
const CAT_DEM = {
  "etat-civil": {l:"État civil", c:"#0b4a7d"},
  "famille": {l:"Mariage & famille", c:"#b0306a"},
  "urbanisme": {l:"Urbanisme & domaine public", c:"#0a8a55"},
  "cadre-vie": {l:"Cadre de vie", c:"#c97a00"},
  "mairie": {l:"Le maire & la mairie", c:"#5b3fb3"},
};
const DEMARCHES = [
  {id:"naissance", prix:2000, doc:true, cat:"etat-civil", ic:"baby", t:"Copie ou extrait d'acte de naissance", d:"Obtenir une copie intégrale ou un extrait de votre acte de naissance enregistré à Port-Gentil.", pieces:["Nom, prénoms et date de naissance de la personne concernée","Noms des parents","Pièce d'identité du demandeur"], service:"État civil"},
  {id:"decl-naissance", prix:0, doc:true, cat:"etat-civil", ic:"baby", t:"Déclaration de naissance", d:"Déclarer la naissance d'un enfant auprès de l'officier d'état civil de votre arrondissement.", pieces:["Certificat d'accouchement délivré par la maternité","Pièces d'identité des parents","Livret de famille ou acte de mariage, le cas échéant"], service:"État civil"},
  {id:"deces", prix:2000, doc:true, cat:"etat-civil", ic:"file", t:"Acte de décès", d:"Déclarer un décès ou obtenir une copie d'acte de décès.", pieces:["Certificat médical de décès","Pièce d'identité du défunt","Pièce d'identité du déclarant"], service:"État civil"},
  {id:"copie-mariage", prix:2000, doc:true, cat:"etat-civil", ic:"ring", t:"Copie d'acte de mariage", d:"Obtenir une copie de votre acte de mariage célébré à Port-Gentil.", pieces:["Noms des époux et date du mariage","Pièce d'identité du demandeur"], service:"État civil"},
  {id:"legalisation", prix:1000, doc:false, cat:"etat-civil", ic:"stamp", t:"Légalisation & copie conforme", d:"Faire légaliser une signature ou certifier conforme la copie d'un document original.", pieces:["Document original","Pièce d'identité du signataire"], service:"État civil"},
  {id:"residence", prix:2000, doc:true, cat:"etat-civil", ic:"home", t:"Certificat de résidence", d:"Attester de votre domicile sur le territoire de la commune.", pieces:["Pièce d'identité","Justificatif de domicile ou attestation du chef de quartier"], service:"État civil"},
  {id:"mariage", prix:20000, doc:false, cat:"famille", ic:"ring", t:"Dossier de mariage civil", d:"Déposer un dossier de mariage, fixer la date de célébration et la publication des bans.", pieces:["Actes de naissance des futurs époux","Pièces d'identité des époux et des témoins","Certificats de résidence","Certificat de célibat ou de non-remariage"], service:"État civil"},
  {id:"permis", prix:50000, doc:true, cat:"urbanisme", ic:"building", t:"Permis de construire", d:"Demander l'autorisation de construire, d'agrandir ou de modifier un bâtiment.", pieces:["Titre foncier ou attestation d'attribution du terrain","Plans du projet (situation, masse, façades)","Pièce d'identité du demandeur"], service:"Urbanisme"},
  {id:"domaine", prix:10000, doc:true, cat:"urbanisme", ic:"map", t:"Occupation du domaine public", d:"Kiosque, étal, terrasse, dépôt de matériaux : demander une autorisation d'occupation temporaire.", pieces:["Description et emplacement souhaité","Durée d'occupation","Pièce d'identité ou registre de commerce"], service:"Domaine public"},
  {id:"place", prix:5000, doc:true, cat:"urbanisme", ic:"wallet", t:"Emplacement au marché", d:"Demander une place dans un marché municipal (Grand Village, Camp Boiro…).", pieces:["Activité exercée","Pièce d'identité","Registre de commerce, le cas échéant"], service:"Domaine public"},
  {id:"signalement", prix:0, doc:false, cat:"cadre-vie", ic:"alert", t:"Signaler un problème", d:"Canal bouché, dépôt d'ordures, éclairage en panne, voirie dégradée, construction anarchique : prévenez les services techniques.", pieces:["Lieu précis (quartier, repère)","Description du problème"], service:"Services techniques", signal:true},
  {id:"audience", prix:0, doc:false, cat:"mairie", ic:"cal", t:"Demande d'audience", d:"Solliciter un rendez-vous avec le maire, un adjoint ou un maire d'arrondissement.", pieces:["Objet de la demande","Vos coordonnées"], service:"Cabinet du maire"},
];
/* Paiement : tarifs indicatifs (à confirmer par délibération). doc:true = document téléchargeable en ligne une fois prêt. */
const PAIEMENT = {
  modes:[
    {id:"airtel", l:"Airtel Money", s:"Paiement depuis votre téléphone", c:"#e40000"},
    {id:"carte", l:"Carte bancaire", s:"Visa, Mastercard, GIMAC", c:"#1477b5"},
  ],
  guichet:"Payer à la mairie (espèces, Airtel Money ou carte au guichet)",
  note:"Tarifs indicatifs pour la démonstration, à confirmer par la mairie.",
};
const fcfa = n => n ? Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ") + " FCFA" : "Gratuit";

const TYPES_SIGNAL = [
  ["canal","Canal bouché / inondation","wave"],["ordures","Dépôt d'ordures","trash"],["eclairage","Éclairage public en panne","light"],
  ["voirie","Voirie dégradée / regard","road"],["anarchique","Construction ou occupation anarchique","alert"],["autre","Autre problème","chat"],
];

/* ---------- Projets & chantiers (sources : presse 2025-2026) ---------- */
const PROJETS = [
  {t:"Curage des canaux et prévention des inondations", arr:0, th:"assainissement", st:"En cours", img:"canal-4e", d:"Priorité du budget 2026 dans les quatre arrondissements : désherbage, extraction des déchets et curage des canaux principaux."},
  {t:"Réhabilitation des routes des 4 arrondissements", arr:0, th:"voirie", st:"Lancé", img:"conseil-municipal", note:"Photo d'illustration", d:"Lancée par le maire en avril 2026 dans les quatre arrondissements, avec un financement PID/PIH soumis à des exigences de performance et de transparence."},
  {t:"Libérez le domaine public : axes ASECNA – Cap Lopez et Matanda – Ntchengué", arrs:[1,4], arr:0, th:"cadre-vie", st:"En cours", img:"grand-village-liberation", note:"Photo d'illustration : opération de Grand Village", d:"29 septembre 2026 : démolition des constructions marquées sur le domaine public dans les 1er et 4e arrondissements ; une bande de 12 mètres est libérée pour élargir et moderniser les voies."},
  {t:"Opération trimestrielle d'assainissement", arr:0, th:"assainissement", st:"En cours", img:"grand-village-visite", d:"Depuis le 8 janvier 2026 : caniveaux débouchés, rues nettoyées, déchets évacués, d'abord du carrefour Léon Mba à la route de l'aéroport (1er arrondissement), puis dans toute la ville."},
  {t:"Grand Village : libération du domaine public", arrs:[2,3], arr:0, th:"cadre-vie", st:"Réalisé", img:"marche-grand-village", d:"Janvier 2026 : kiosques, hangars et étals anarchiques démolis autour du marché de Grand Village, entre les 2e et 3e arrondissements."},
  {t:"848 logements de Lip Matanda", arr:4, th:"logement", st:"Lancé", img:"lip-matanda-engin", d:"Lancés le 25 septembre 2026 par le Président de la République, Brice Clotaire Oligui Nguema, pour répondre à la forte demande de logement et créer des emplois locaux."},
  {t:"Canaux de Lip Matanda et regards de Matiti", arr:4, th:"assainissement", st:"Réalisé", img:"terrain-4e", d:"Janvier-février 2026 : désherbage des canaux de Lip Matanda et repositionnement des regards de la voie bitumée de Matiti 1 et 2."},
  {t:"Collecte et valorisation des déchets", arr:0, th:"assainissement", st:"Programmé", img:"canal-4e", note:"Photo d'illustration", d:"Nouveaux camions et équipements de collecte ; valorisation des déchets plastiques et organiques (budget 2026)."},
  {t:"Étude de transport fluvial et maritime", arr:0, th:"mobilite", st:"À l'étude", img:"hotel-de-ville", note:"Photo d'illustration", d:"Étude inscrite au budget 2026 pour mieux relier l'île Mandji et faciliter les déplacements."},
  {t:"Culture et patrimoine : festival Mandji, monuments, Canal Olympia", arr:0, th:"social", st:"Programmé", img:"conseil-municipal", note:"Photo d'illustration", d:"Juillet 2026 : le conseil municipal décide la relance du festival culturel Mandji, la réhabilitation des monuments historiques et la reprise du site Canal Olympia par la commune."},
  {t:"Fonds d'entrepreneuriat des jeunes & banque alimentaire", arr:0, th:"social", st:"Programmé", img:"maire-bureau", d:"Fonds municipal pour les jeunes, artisans, femmes entrepreneures et petits commerces ; banque alimentaire (budget 2026)."},
  {t:"Réhabilitation d'écoles publiques", arr:0, th:"social", st:"Réalisé", img:"ecole-la-balise", note:"Photo : école publique de La Balise II", d:"Septembre 2025 : VAALCO Gabon réhabilite les écoles de La Balise II et de Matanda (1 151 élèves à Matanda)."},
];
const THEMES = {assainissement:"Assainissement", voirie:"Voirie & éclairage", "cadre-vie":"Cadre de vie", logement:"Logement", mobilite:"Mobilité", social:"Social & culture"};

/* ---------- Actualités (articles de presse) ---------- */
const ACTUS = [
  {date:"2026-09-29", cat:"1er & 4e arrondissements", img:"grand-village-liberation", t:"« Libérez le domaine public » : place aux démolitions", d:"Sur les axes ASECNA – Cap Lopez et Matanda – Ntchengué, la mairie démolit les constructions marquées et libère une bande de 12 mètres pour moderniser les voies.", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/09/29/port-gentil-la-mairie-passe-aux-demolitions/"},
  {date:"2026-09-25", cat:"Logement", img:"lip-matanda-ceremonie", t:"Lancement des 848 logements de Lip Matanda", d:"Le Président de la République a lancé la construction de 848 logements, un projet attendu face à la forte demande de logement.", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/09/25/port-gentil-lancement-des-travaux-de-848-logements-a-lip-matanda/"},
  {date:"2026-07-24", cat:"Conseil municipal", img:"conseil-municipal", t:"Le conseil municipal lance une nouvelle ère de réformes", d:"Gestion du personnel, comité de pilotage des chantiers, journée patriotique d'assainissement, festival Mandji, monuments historiques et site Canal Olympia.", src:"Gabonreview", url:"https://www.gabonreview.com/port-gentil-le-conseil-municipal-lance-une-nouvelle-ere-de-reformes-pour-transformer-la-capitale-economique/"},
  {date:"2026-05-13", cat:"Administration", img:"maire-bureau", t:"Audit interne : la mairie engage sa modernisation", d:"Le maire a présenté les conclusions d'un audit mené en interne : digitalisation progressive, contrôle interne renforcé et réorganisation des ressources humaines.", src:"Gabonreview", url:"https://www.gabonreview.com/port-gentil-la-mairie-devoile-les-failles-de-son-administration-et-lance-sa-mue-structurelle/"},
  {date:"2026-04-22", cat:"Voirie", img:"hotel-de-ville", t:"Les routes des quatre arrondissements vont faire peau neuve", d:"Le maire lance un programme de réhabilitation des voiries dans tous les arrondissements de la commune.", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/04/22/port-gentil-les-routes-vont-faire-peau-neuve/"},
  {date:"2026-04-18", cat:"Budget", img:"maire-hotel-de-ville", t:"Un budget historique de 23,9 milliards FCFA", d:"Adopté à l'unanimité avec 21 délibérations : 250 millions FCFA pour chacun des quatre arrondissements, canaux, voiries et éclairage en priorité.", src:"Direct Infos Gabon", url:"https://directinfosgabon.com/mairie-de-port-gentil-un-budget-historique-de-24-milliards-de-fcfa-pour-transformer-la-cite-petroliere/"},
  {date:"2026-02-10", cat:"4e arrondissement", img:"canal-4e", t:"Actions de terrain dans le 4e arrondissement", d:"Curage des canaux de Lip Matanda, regards de Matiti, sensibilisation contre les constructions anarchiques et concertation au marché de Camp Boiro.", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/02/10/port-gentil-ecoute-et-actions-de-terrain-pour-le-maire-du-4eme-arrondissement"},
  {date:"2026-01-08", cat:"Assainissement", img:"grand-village-visite", t:"Offensive trimestrielle contre l'insalubrité", d:"Caniveaux débouchés et rues nettoyées, du carrefour Léon Mba à la route de l'aéroport, avant d'étendre l'opération à toute la ville.", src:"Gabon Media Time", url:"https://gabonmediatime.com/port-gentil-la-mairie-declenche-une-offensive-trimestrielle-contre-linsalubrite/"},
  {date:"2026-01-07", cat:"Domaine public", img:"marche-grand-village", t:"Grand Village : opération contre l'occupation anarchique", d:"Le nouveau maire lance la libération du domaine public : kiosques, hangars et étals anarchiques démolis.", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/01/07/port-gentil-le-nouveau-maire-en-guerre-ouverte-contre-lanarchie"},
  {date:"2025-11-09", cat:"Institution", img:"maire-hotel-de-ville", t:"Pascal Houangni Ambouroue élu maire de Port-Gentil", d:"Financier de formation, ancien directeur général de la BVMAC et ancien ministre, il prend la tête de la commune.", src:"Gabon Media Time", url:"https://gabonmediatime.com/gabon-pascal-houangni-ambouroue-elu-maire-de-port-gentil/"},
];

/* ---------- Galerie ---------- */
const GALERIE = [
  {img:"hotel-de-ville", cat:"mairie", t:"L'hôtel de ville de Port-Gentil"},
  {img:"conseil-municipal", cat:"mairie", t:"Séance du conseil municipal"},
  {img:"maire-bureau", cat:"mairie", t:"Le maire, Pascal Houangni Ambouroue"},
  {img:"lip-matanda-engin", cat:"chantiers", t:"Lancement du chantier de Lip Matanda"},
  {img:"lip-matanda-perspective", cat:"chantiers", t:"Perspective des futurs logements de Lip Matanda"},
  {img:"maquette-logement", cat:"chantiers", t:"Maquette d'un logement du programme de Lip Matanda"},
  {img:"lip-matanda-ceremonie", cat:"evenements", t:"Cérémonie de lancement des 848 logements"},
  {img:"lip-matanda-officiels", cat:"evenements", t:"Les autorités lors du lancement des travaux"},
  {img:"grand-village-visite", cat:"terrain", t:"Visite de nuit à Grand Village"},
  {img:"grand-village-liberation", cat:"terrain", t:"Libération du domaine public à Grand Village"},
  {img:"marche-grand-village", cat:"terrain", t:"Commerçants du marché de Grand Village"},
  {img:"terrain-4e", cat:"terrain", t:"Visite de terrain dans le 4e arrondissement"},
  {img:"canal-4e", cat:"terrain", t:"Canal encombré : une priorité d'assainissement"},
  {img:"ecole-la-balise", cat:"evenements", t:"Remise de l'école réhabilitée de La Balise II"},
];

/* ---------- Espace numérique des agents (comptes de démonstration) ---------- */
const ESPACES = [
  {role:"cabinet", ic:"gauge", t:"Cabinet du maire", s:"Pilotage de la commune", c:"#07325a",
    pts:["Tableau de bord en temps réel : demandes, recettes, chantiers","Alertes automatiques (stocks, retards)","Agenda et demandes d'audience"],
    demo:{login:"maire", pwd:"pog2026", nom:"Cabinet du maire"}},
  {role:"services", ic:"stamp", t:"Services municipaux", s:"État civil, technique, finances, RH", c:"#0a8a55",
    pts:["Traitement des demandes en ligne avec suivi","Registre d'état civil numérique","Recettes, personnel et stocks"],
    demo:{login:"etat.civil", pwd:"agent2026", nom:"Service de l'état civil"}},
  {role:"arrondissement", ic:"map", t:"Mairies d'arrondissement", s:"Gestion de proximité", c:"#c97a00",
    pts:["Demandes, signalements et actes de l'arrondissement","Indicateurs de gestion et suivi des 250 M FCFA","Une mairie, un accès : 1er, 2e, 3e et 4e"],
    demo:{login:"arr1", pwd:"arr2026", nom:"Comptes arr1, arr2, arr3, arr4"}},
];
