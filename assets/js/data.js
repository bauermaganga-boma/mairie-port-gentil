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

/* ---------- Les quatre arrondissements ---------- */
const ARRONDISSEMENTS = [
  {n:1, t:"1er arrondissement", maire:"", d:"Mairie d'arrondissement placée sous la coordination du maire central. Les informations détaillées (maire, quartiers, services) seront publiées avec la mairie d'arrondissement.", quartiers:[], fb:""},
  {n:2, t:"2e arrondissement", maire:"", d:"La mairie du 2e arrondissement dispose déjà d'une page Facebook et d'un site d'information (état civil, services, comités de quartier, mariage, demande d'audience).", quartiers:[], fb:"https://www.facebook.com/Mairie2eArrondissementPortGentil/"},
  {n:3, t:"3e arrondissement", maire:"", d:"Mairie d'arrondissement placée sous la coordination du maire central. Les informations détaillées (maire, quartiers, services) seront publiées avec la mairie d'arrondissement.", quartiers:[], fb:""},
  {n:4, t:"4e arrondissement", maire:"Érick Ayang Nang", d:"Le sud de l'île Mandji, un arrondissement en pleine mutation : il accueille le programme présidentiel de 848 logements de Lip Matanda, lancé en septembre 2026. Sa mairie mise sur une gouvernance de proximité, pragmatique et orientée résultats.",
    quartiers:["Matanda","Lip Matanda","Iguiri","Matiti 1","Matiti 2","Ntchengué","Quartier Sud","Boule-Noire 2","Salsa","Camp Boiro (marché)"],
    fb:"https://www.facebook.com/p/Port-Gentil-Mairie-du-4%C3%A8me-Arrondissement-100079508306412/"},
];

/* ---------- Démarches (pièces indicatives : à valider avec les services) ---------- */
const CAT_DEM = {
  "etat-civil": {l:"État civil", c:"#0b4a7d"},
  "famille": {l:"Mariage & famille", c:"#b0306a"},
  "urbanisme": {l:"Urbanisme & domaine public", c:"#0a8a55"},
  "cadre-vie": {l:"Cadre de vie", c:"#c97a00"},
  "mairie": {l:"Le maire & la mairie", c:"#5b3fb3"},
};
const DEMARCHES = [
  {id:"naissance", cat:"etat-civil", ic:"baby", t:"Copie ou extrait d'acte de naissance", d:"Obtenir une copie intégrale ou un extrait de votre acte de naissance enregistré à Port-Gentil.", pieces:["Nom, prénoms et date de naissance de la personne concernée","Noms des parents","Pièce d'identité du demandeur"], service:"État civil"},
  {id:"decl-naissance", cat:"etat-civil", ic:"baby", t:"Déclaration de naissance", d:"Déclarer la naissance d'un enfant auprès de l'officier d'état civil de votre arrondissement.", pieces:["Certificat d'accouchement délivré par la maternité","Pièces d'identité des parents","Livret de famille ou acte de mariage, le cas échéant"], service:"État civil"},
  {id:"deces", cat:"etat-civil", ic:"file", t:"Acte de décès", d:"Déclarer un décès ou obtenir une copie d'acte de décès.", pieces:["Certificat médical de décès","Pièce d'identité du défunt","Pièce d'identité du déclarant"], service:"État civil"},
  {id:"copie-mariage", cat:"etat-civil", ic:"ring", t:"Copie d'acte de mariage", d:"Obtenir une copie de votre acte de mariage célébré à Port-Gentil.", pieces:["Noms des époux et date du mariage","Pièce d'identité du demandeur"], service:"État civil"},
  {id:"legalisation", cat:"etat-civil", ic:"stamp", t:"Légalisation & copie conforme", d:"Faire légaliser une signature ou certifier conforme la copie d'un document original.", pieces:["Document original","Pièce d'identité du signataire"], service:"État civil"},
  {id:"residence", cat:"etat-civil", ic:"home", t:"Certificat de résidence", d:"Attester de votre domicile sur le territoire de la commune.", pieces:["Pièce d'identité","Justificatif de domicile ou attestation du chef de quartier"], service:"État civil"},
  {id:"mariage", cat:"famille", ic:"ring", t:"Dossier de mariage civil", d:"Déposer un dossier de mariage, fixer la date de célébration et la publication des bans.", pieces:["Actes de naissance des futurs époux","Pièces d'identité des époux et des témoins","Certificats de résidence","Certificat de célibat ou de non-remariage"], service:"État civil"},
  {id:"permis", cat:"urbanisme", ic:"building", t:"Permis de construire", d:"Demander l'autorisation de construire, d'agrandir ou de modifier un bâtiment.", pieces:["Titre foncier ou attestation d'attribution du terrain","Plans du projet (situation, masse, façades)","Pièce d'identité du demandeur"], service:"Urbanisme"},
  {id:"domaine", cat:"urbanisme", ic:"map", t:"Occupation du domaine public", d:"Kiosque, étal, terrasse, dépôt de matériaux : demander une autorisation d'occupation temporaire.", pieces:["Description et emplacement souhaité","Durée d'occupation","Pièce d'identité ou registre de commerce"], service:"Domaine public"},
  {id:"place", cat:"urbanisme", ic:"wallet", t:"Emplacement au marché", d:"Demander une place dans un marché municipal (Grand Village, Camp Boiro…).", pieces:["Activité exercée","Pièce d'identité","Registre de commerce, le cas échéant"], service:"Domaine public"},
  {id:"signalement", cat:"cadre-vie", ic:"alert", t:"Signaler un problème", d:"Canal bouché, dépôt d'ordures, éclairage en panne, voirie dégradée, construction anarchique : prévenez les services techniques.", pieces:["Lieu précis (quartier, repère)","Description du problème"], service:"Services techniques", signal:true},
  {id:"audience", cat:"mairie", ic:"cal", t:"Demande d'audience", d:"Solliciter un rendez-vous avec le maire, un adjoint ou un maire d'arrondissement.", pieces:["Objet de la demande","Vos coordonnées"], service:"Cabinet du maire"},
];
const TYPES_SIGNAL = [
  ["canal","Canal bouché / inondation","wave"],["ordures","Dépôt d'ordures","trash"],["eclairage","Éclairage public en panne","light"],
  ["voirie","Voirie dégradée / regard","road"],["anarchique","Construction ou occupation anarchique","alert"],["autre","Autre problème","chat"],
];

/* ---------- Projets & chantiers (sources : presse 2020-2026) ---------- */
const PROJETS = [
  {t:"Curage des canaux et prévention des inondations", arr:0, th:"assainissement", st:"En cours", img:"canal-4e", d:"Priorité du budget 2026 dans les quatre arrondissements : désherbage, extraction des déchets et curage des canaux principaux."},
  {t:"848 logements de Lip Matanda", arr:4, th:"logement", st:"Lancé", img:"lip-matanda-engin", d:"Lancés le 25 septembre 2026 par le Président de la République, Brice Clotaire Oligui Nguema, pour répondre à la forte demande de logement et créer des emplois locaux."},
  {t:"Libération du domaine public à Grand Village", arr:0, th:"cadre-vie", st:"Réalisé", img:"grand-village-liberation", d:"Janvier 2026 : opération contre l'occupation anarchique du domaine public (kiosques, hangars et étals démolis) pour rendre l'espace aux usagers."},
  {t:"Voiries secondaires et éclairage public", arr:0, th:"voirie", st:"Programmé", img:"conseil-municipal", d:"Bitumage de voiries secondaires dans les quartiers sous-équipés et extension de l'éclairage public, inscrits au budget 2026."},
  {t:"Regards d'assainissement de Matiti 1 et 2", arr:4, th:"assainissement", st:"Réalisé", img:"terrain-4e", d:"2 février 2026 : repositionnement des regards défectueux sur la voie bitumée de Matiti 1 et 2."},
  {t:"Salubrité du marché de Camp Boiro", arr:4, th:"cadre-vie", st:"En cours", img:"marche-grand-village", note:"Photo d'illustration : marché de Grand Village", d:"Collecte des déchets solides et concertation avec les commerçants pour la salubrité et la sécurité du marché."},
  {t:"Collecte et valorisation des déchets", arr:0, th:"assainissement", st:"Programmé", img:"grand-village-visite", d:"Nouveaux camions et équipements de collecte ; valorisation des déchets plastiques et organiques."},
  {t:"Étude de transport fluvial et maritime", arr:0, th:"mobilite", st:"À l'étude", img:"hotel-de-ville", d:"Étude inscrite au budget 2026 pour mieux relier l'île Mandji et faciliter les déplacements."},
  {t:"Réhabilitation d'écoles publiques", arr:4, th:"social", st:"Réalisé", img:"ecole-la-balise", note:"Photo : école publique de La Balise II", d:"Septembre 2025 : VAALCO Gabon réhabilite les écoles de La Balise II et de Matanda (1 151 élèves à Matanda)."},
  {t:"Fonds d'entrepreneuriat des jeunes & banque alimentaire", arr:0, th:"social", st:"Programmé", img:"maire-bureau", d:"Deux dispositifs sociaux annoncés au budget 2026 : soutien aux jeunes porteurs de projets et aide alimentaire."},
];
const THEMES = {assainissement:"Assainissement", logement:"Logement", "cadre-vie":"Cadre de vie", voirie:"Voirie & éclairage", mobilite:"Mobilité", social:"Social & jeunesse"};

/* ---------- Actualités (articles de presse) ---------- */
const ACTUS = [
  {date:"2026-09-25", cat:"Logement", img:"lip-matanda-ceremonie", t:"Lancement des 848 logements de Lip Matanda", d:"Le Président de la République a lancé la construction de 848 logements dans le 4e arrondissement, un projet attendu face à la forte demande de logement.", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/09/25/port-gentil-lancement-des-travaux-de-848-logements-a-lip-matanda/"},
  {date:"2026-05-13", cat:"Administration", img:"maire-bureau", t:"Audit interne : la mairie engage sa modernisation", d:"Le maire a présenté les conclusions d'un audit mené en interne : digitalisation progressive, contrôle interne renforcé et réorganisation des ressources humaines.", src:"Gabonreview", url:"https://www.gabonreview.com/port-gentil-la-mairie-devoile-les-failles-de-son-administration-et-lance-sa-mue-structurelle/"},
  {date:"2026-05-07", cat:"Solidarité", img:"terrain-4e", t:"Le maire du 4e arrondissement au chevet d'un jeune non-voyant", d:"Érick Ayang Nang s'est rendu au quartier Salsa pour accompagner un jeune non-voyant en difficulté.", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/05/07/port-gentil-erick-ayang-nang-au-chevet-dun-jeune-aveugle-en-difficulte/"},
  {date:"2026-04-18", cat:"Conseil municipal", img:"conseil-municipal", t:"Un budget historique de 23,9 milliards FCFA", d:"Adopté à l'unanimité avec 21 délibérations, contre 9,5 milliards en 2024 : 250 millions FCFA par arrondissement, canaux, voiries et éclairage en priorité.", src:"Direct Infos Gabon", url:"https://directinfosgabon.com/mairie-de-port-gentil-un-budget-historique-de-24-milliards-de-fcfa-pour-transformer-la-cite-petroliere/"},
  {date:"2026-02-10", cat:"4e arrondissement", img:"canal-4e", t:"Écoute et actions de terrain dans le 4e arrondissement", d:"Curage des canaux de Lip Matanda, regards de Matiti, sensibilisation contre les constructions anarchiques et concertation au marché de Camp Boiro.", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/02/10/port-gentil-ecoute-et-actions-de-terrain-pour-le-maire-du-4eme-arrondissement"},
  {date:"2026-01-07", cat:"Domaine public", img:"grand-village-visite", t:"Grand Village : opération contre l'occupation anarchique", d:"Le nouveau maire a lancé la libération du domaine public : kiosques, hangars et étals anarchiques ont été démolis.", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/01/07/port-gentil-le-nouveau-maire-en-guerre-ouverte-contre-lanarchie"},
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
    pts:["Demandes et signalements de l'arrondissement","Suivi de la dotation de 250 M FCFA","Statistiques remontées à la mairie centrale"],
    demo:{login:"arr4", pwd:"arr2026", nom:"Mairie du 4e arrondissement"}},
];
