"use strict";

/* =========================================================
   MCMods - app.js
   ---------------------------------------------------------
   HOW THIS FILE IS ORGANISED (top to bottom)
    1. SETTINGS ........ site name, contact email, API address
    2. CATEGORIES ...... the 7 categories
    3. CATALOG ......... the list of items (EDIT HERE to add items)
    4. HELPERS ......... small tools (escape text, format numbers)
    5. DATA LAYER ...... loads live info from Modrinth's free API
                         (this is the part you will later replace
                          with your own database / backend)
    6. PIXEL ART ....... draws the cover images in the browser
    7. RENDERING ....... builds cards, hero, filters, details
    8. ROUTER + EVENTS . makes buttons, links and filters work
    9. START ........... runs everything

   IMPORTANT RULES FOR THIS SITE
   - MCMods never hosts other people's files. Download buttons
     open the creator's official page.
   - Numbers (downloads, followers) come from the API only.
     If the API cannot be reached we show "unavailable".
     Never type made-up numbers into this file.
   ========================================================= */


/* =========================================================
   1. SETTINGS
   ========================================================= */
const SITE = {
  name: "MCMods",
  // Put your real contact email here later (example: "hello@yoursite.com").
  // While it is empty, the Contact page says no email has been added yet.
  contactEmail: "",
  modrinthApi: "https://api.modrinth.com/v2",
  cacheHours: 6,   // how long live data is reused before asking again
  pageSize: 24     // cards shown before the "Show more" button
};

// Items shown in the big featured card on the homepage (use item ids).
const FEATURED_IDS = ["sodium", "iris", "create", "complementary-reimagined"];

// Future features. Keep these false until a backend really exists.
// Nothing in the page uses them yet - they are a checklist for you.
const FEATURES = {
  accounts: false,
  favorites: false,
  creatorSubmissions: false,
  adminDashboard: false,
  ownDownloadStats: false
};


/* =========================================================
   2. CATEGORIES
   "scene" decides which pixel-art style is used for covers.
   ========================================================= */
const CATEGORIES = [
  { id: "mods",          label: "Mods",          scene: "land",   blurb: "Change how the game plays and runs." },
  { id: "addons",        label: "Addons",        scene: "nether", blurb: "Data packs and add-ons that extend the game." },
  { id: "maps",          label: "Maps",          scene: "map",    blurb: "Adventure, parkour and build worlds." },
  { id: "skins",         label: "Skins",         scene: "head",   blurb: "Change how your player looks." },
  { id: "texture-packs", label: "Texture Packs", scene: "tiles",  blurb: "Resource packs that restyle blocks and items." },
  { id: "shaders",       label: "Shaders",       scene: "sunset", blurb: "Better lighting, water and skies." },
  { id: "seeds",         label: "Seeds",         scene: "seed",   blurb: "World seeds worth exploring." }
];

// Simple line icons for the categories (24x24 grid).
const ICONS = {
  mods: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/>',
  addons: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/>',
  maps: '<path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  skins: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  "texture-packs": '<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>',
  shaders: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>',
  seeds: '<path d="M12 21v-9"/><path d="M12 12C12 7 8 5 4 5c0 5 3 7 8 7z"/><path d="M12 14c0-4 3-6 8-6 0 5-3 6-8 6z"/>'
};


/* =========================================================
   3. CATALOG  (the list of items)
   ---------------------------------------------------------
   Every item below is a real project on Modrinth, a free and
   open site where creators publish their own work.

   "source.slug" is the end of the project's Modrinth web address:
   modrinth.com/mod/sodium  ->  slug is "sodium".
   Title, download counts, supported versions, screenshots and
   authors are loaded live from Modrinth. The text typed here
   (title, summary, creator) is only a backup if loading fails.

   If a slug does not exist on Modrinth, the item is hidden
   automatically, so a typo can never show a broken card.

   ----- HOW TO ADD A MODRINTH ITEM -----
   1. Copy one block below.
   2. Change id, title, summary, source.slug and source.projectType
      (projectType is mod, shader, resourcepack or datapack).
   3. Choose cat: mods, addons, texture-packs or shaders.

   ----- HOW TO ADD AN ITEM FROM ANOTHER SITE (e.g. a Bedrock add-on) -----
   Only add things the creator publishes themselves, and use the
   creator's own page for "url". Copy the example below into the
   CATALOG list, remove the // at the start of each line, and
   fill in your real data:

   // {
   //   id: "my-bedrock-pack",
   //   cat: "addons",
   //   edition: ["bedrock"],
   //   title: "Pack name",
   //   summary: "One or two sentences describing it.",
   //   creator: "Creator name",
   //   source: { type: "manual", url: "https://creators-official-page.example/pack" },
   //   manual: {
   //     license: "Creator's stated license",
   //     published: "2026-01-31",
   //     images: [ { url: "https://example.com/shot.png", title: "Screenshot" } ]
   //   }
   // },
   ========================================================= */
const CATALOG = [
  // ---------- MODS ----------
  { id: "sodium", cat: "mods", edition: ["java"], title: "Sodium", creator: "CaffeineMC",
    summary: "A modern rendering engine that raises frame rates and smooths out stutter.",
    source: { type: "modrinth", slug: "sodium", projectType: "mod" } },
  { id: "iris", cat: "mods", edition: ["java"], title: "Iris Shaders", creator: "IrisShaders",
    summary: "Loads shader packs on Fabric and NeoForge, built to work alongside Sodium.",
    source: { type: "modrinth", slug: "iris", projectType: "mod" } },
  { id: "lithium", cat: "mods", edition: ["java"], title: "Lithium", creator: "CaffeineMC",
    summary: "Speeds up game logic, physics and mob AI without changing how the game plays.",
    source: { type: "modrinth", slug: "lithium", projectType: "mod" } },
  { id: "create", cat: "mods", edition: ["java"], title: "Create", creator: "The Create Team",
    summary: "Build machines and moving contraptions powered by rotational force.",
    source: { type: "modrinth", slug: "create", projectType: "mod" } },
  { id: "fabric-api", cat: "mods", edition: ["java"], title: "Fabric API", creator: "FabricMC",
    summary: "The core library that most Fabric mods need in order to run.",
    source: { type: "modrinth", slug: "fabric-api", projectType: "mod" } },
  { id: "modmenu", cat: "mods", edition: ["java"], title: "Mod Menu", creator: "Prospector",
    summary: "Adds an in-game list of your installed mods, with their settings screens.",
    source: { type: "modrinth", slug: "modmenu", projectType: "mod" } },
  { id: "distanthorizons", cat: "mods", edition: ["java"], title: "Distant Horizons", creator: "Distant Horizons team",
    summary: "Draws far-away terrain as simplified chunks so you can see much further.",
    source: { type: "modrinth", slug: "distanthorizons", projectType: "mod" } },
  { id: "jei", cat: "mods", edition: ["java"], title: "Just Enough Items", creator: "Just Enough Items team",
    summary: "Browse every item and recipe in the game from a side panel.",
    source: { type: "modrinth", slug: "jei", projectType: "mod" } },
  { id: "xaeros-minimap", cat: "mods", edition: ["java"], title: "Xaero's Minimap", creator: "Xaero",
    summary: "A minimap with waypoints, an entity radar and cave mode.",
    source: { type: "modrinth", slug: "xaeros-minimap", projectType: "mod" } },
  { id: "ferrite-core", cat: "mods", edition: ["java"], title: "FerriteCore", creator: "malte0811",
    summary: "Lowers memory use so the game runs better on computers with less RAM.",
    source: { type: "modrinth", slug: "ferrite-core", projectType: "mod" } },
  { id: "entityculling", cat: "mods", edition: ["java"], title: "Entity Culling", creator: "tr7zw",
    summary: "Skips drawing mobs and block entities that you cannot see.",
    source: { type: "modrinth", slug: "entityculling", projectType: "mod" } },
  { id: "immediatelyfast", cat: "mods", edition: ["java"], title: "ImmediatelyFast", creator: "RaphiMC",
    summary: "Speeds up how the HUD, text and other overlays are drawn.",
    source: { type: "modrinth", slug: "immediatelyfast", projectType: "mod" } },

  // ---------- SHADERS ----------
  { id: "complementary-reimagined", cat: "shaders", edition: ["java"], title: "Complementary Shaders - Reimagined", creator: "EminGT",
    summary: "A balanced shader pack with soft lighting that stays close to the vanilla look.",
    source: { type: "modrinth", slug: "complementary-reimagined", projectType: "shader" } },
  { id: "complementary-unbound", cat: "shaders", edition: ["java"], title: "Complementary Shaders - Unbound", creator: "EminGT",
    summary: "A more dramatic take on Complementary with stronger colors and atmosphere.",
    source: { type: "modrinth", slug: "complementary-unbound", projectType: "shader" } },
  { id: "bsl-shaders", cat: "shaders", edition: ["java"], title: "BSL Shaders", creator: "capttatsu",
    summary: "A long-running shader pack with realistic water, clouds and sky.",
    source: { type: "modrinth", slug: "bsl-shaders", projectType: "shader" } },

  // ---------- TEXTURE PACKS ----------
  { id: "faithful-32x", cat: "texture-packs", edition: ["java"], title: "Faithful 32x", creator: "Faithful Resource Pack team",
    summary: "Vanilla textures at double the resolution, keeping the original style.",
    source: { type: "modrinth", slug: "faithful-32x", projectType: "resourcepack" } },
  { id: "bare-bones", cat: "texture-packs", edition: ["java"], title: "Bare Bones", creator: null,
    summary: "A clean, simplified look for blocks and items.",
    source: { type: "modrinth", slug: "bare-bones", projectType: "resourcepack" } },

  // ---------- ADDONS (data packs) ----------
  { id: "terralith", cat: "addons", edition: ["java"], title: "Terralith", creator: "Stardust Labs",
    summary: "A world generation data pack that adds new biomes and dramatic landscapes.",
    source: { type: "modrinth", slug: "terralith", projectType: "datapack" } },
  { id: "incendium", cat: "addons", edition: ["java"], title: "Incendium", creator: "Stardust Labs",
    summary: "Reworks the Nether with new biomes, structures and bosses.",
    source: { type: "modrinth", slug: "incendium", projectType: "datapack" } }

  // Maps, Skins and Seeds are empty on purpose: MCMods only lists
  // items that have an official source page. Add them when you have one.
];


/* =========================================================
   4. HELPERS
   ========================================================= */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Turns text into safe HTML text. ALWAYS use this for data from outside.
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Only allow https links (blocks javascript: links and similar).
const safeUrl = (u) => (typeof u === "string" && /^https:\/\//i.test(u)) ? u : "";

const nfCompact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const nfFull = new Intl.NumberFormat("en");

function timeAgo(iso) {
  const t = Date.parse(iso);
  if (!t) return "";
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days < 1) return "today";
  if (days < 2) return "yesterday";
  if (days < 30) return days + " days ago";
  if (days < 365) { const m = Math.floor(days / 30); return m + (m === 1 ? " month ago" : " months ago"); }
  const y = Math.floor(days / 365);
  return y + (y === 1 ? " year ago" : " years ago");
}

const isRelease = (v) => /^\d+\.\d+(\.\d+)?$/.test(v);
function cmpVersion(a, b) {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
const EDITION_LABEL = { java: "Java", bedrock: "Bedrock" };

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { el.hidden = true; }, 2400);
}


/* =========================================================
   5. DATA LAYER
   Everything the pages know about an item goes through the
   small functions below (title(), downloads(), ...).
   LATER: when you build a backend, replace loadLiveData() with
   a fetch() to your own server (for example "/api/items") and
   fill item.live with the same fields. The rest of the site
   will keep working without changes.
   ========================================================= */
const state = {
  live: "loading",         // "loading" | "live" | "cached" | "offline"
  view: "home",            // "home" | "browse"
  f: { q: "", category: "", edition: "", version: "", sort: "newest" },
  shown: SITE.pageSize,
  featuredIndex: 0,
  lastListHash: "#/",
  cameFromApp: false,
  openerEl: null
};

// Every item gets a place to store live data.
CATALOG.forEach((it) => { it.live = null; it.missing = false; });

const visibleItems = () => CATALOG.filter((it) => !it.missing);
const findItem = (id) => CATALOG.find((it) => it.id === id);

const isManual   = (it) => it.source.type === "manual";
const getTitle   = (it) => (it.live && it.live.title) || it.title;
const getSummary = (it) => (it.live && it.live.summary) || it.summary;
const getDownloads = (it) => it.live ? it.live.downloads : null;
const getFollowers = (it) => it.live ? it.live.followers : null;
const getVersions  = (it) => (it.live && it.live.versions) || [];
const getReleases  = (it) => getVersions(it).filter(isRelease).sort((a, b) => cmpVersion(b, a));

function getCreators(it) {
  if (it.live && it.live.team && it.live.team.length) return it.live.team;
  return it.creator ? [it.creator] : [];
}
function getSourceUrl(it) {
  if (isManual(it)) return safeUrl(it.source.url);
  const type = (it.live && it.live.projectType) || it.source.projectType;
  return "https://modrinth.com/" + type + "/" + it.source.slug;
}
// The download button always goes to the creator's official page.
function getDownloadUrl(it) {
  if (isManual(it)) return safeUrl(it.source.downloadUrl || it.source.url);
  return getSourceUrl(it) + "/versions";
}
function getSourceName(it) {
  if (isManual(it)) {
    try { return new URL(it.source.url).hostname.replace(/^www\./, ""); } catch (e) { return "official page"; }
  }
  return "Modrinth";
}
function getTags(it) {
  const out = [];
  if (it.live) {
    (it.live.loaders || []).forEach((l) => out.push(cap(l)));
    (it.live.categories || []).forEach((c) => out.push(cap(c.replace(/-/g, " "))));
  }
  return Array.from(new Set(out)).slice(0, 4);
}
function getImages(it) {
  if (it.live && it.live.gallery && it.live.gallery.length) return it.live.gallery;
  if (isManual(it) && it.manual && it.manual.images) {
    return it.manual.images.filter((g) => safeUrl(g.url)).map((g) => ({ url: g.url, title: g.title || "", description: "" }));
  }
  return [];
}
function getPublished(it) {
  if (it.live && it.live.published) return Date.parse(it.live.published);
  if (isManual(it) && it.manual && it.manual.published) return Date.parse(it.manual.published);
  return null;
}
function getUpdated(it) {
  if (it.live && it.live.updated) return Date.parse(it.live.updated);
  return getPublished(it);
}
function versionRange(it) {
  const r = getReleases(it);
  if (!r.length) return "";
  return r.length === 1 ? r[0] : r[r.length - 1] + " - " + r[0];
}

const hasMetrics = () => state.live === "live" || state.live === "cached";

// ---- Load live data from the Modrinth API (free, no key needed) ----
async function fetchJson(url, ms = 10000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } finally { clearTimeout(timer); }
}

function applyLiveData(map) {
  CATALOG.forEach((it) => {
    if (isManual(it)) return;
    const d = map[it.source.slug];
    if (d) { it.live = d; it.missing = false; } else { it.missing = true; }
  });
}

async function loadLiveData() {
  const KEY = "mcmods.live.v1";
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { cached = null; }

  const fresh = cached && (Date.now() - cached.at) < SITE.cacheHours * 3600000;
  if (fresh) {
    applyLiveData(cached.map);
    state.live = "cached";
    return;
  }

  try {
    const slugs = CATALOG.filter((it) => !isManual(it)).map((it) => it.source.slug);
    const projects = await fetchJson(SITE.modrinthApi + "/projects?ids=" + encodeURIComponent(JSON.stringify(slugs)));
    if (!Array.isArray(projects)) throw new Error("Unexpected response");

    // Authors: one more request for all teams at once. If it fails we still show everything else.
    const teamNames = {};
    try {
      const teamIds = Array.from(new Set(projects.map((p) => p.team).filter(Boolean)));
      if (teamIds.length) {
        const teams = await fetchJson(SITE.modrinthApi + "/teams?ids=" + encodeURIComponent(JSON.stringify(teamIds)));
        (teams || []).forEach((members) => {
          if (members && members[0]) {
            teamNames[members[0].team_id] = members.map((m) => m.user && m.user.username).filter(Boolean);
          }
        });
      }
    } catch (e) { /* authors are optional */ }

    const map = {};
    projects.forEach((p) => {
      map[p.slug] = {
        title: p.title, summary: p.description, projectType: p.project_type,
        downloads: p.downloads, followers: p.followers,
        updated: p.updated, published: p.published,
        versions: p.game_versions || [], loaders: p.loaders || [],
        categories: p.categories || [],
        icon: safeUrl(p.icon_url),
        gallery: (p.gallery || []).filter((g) => safeUrl(g.url)).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.ordering || 0) - (b.ordering || 0))
          .map((g) => ({ url: g.url, title: g.title || "", description: g.description || "" })),
        license: p.license ? { id: p.license.id, name: p.license.name, url: safeUrl(p.license.url) } : null,
        team: teamNames[p.team] || null
      };
    });
    applyLiveData(map);
    state.live = "live";
    try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), map })); } catch (e) { /* storage may be blocked */ }
  } catch (err) {
    if (cached && cached.map) {          // old data is better than none
      applyLiveData(cached.map);
      state.live = "cached";
    } else {
      state.live = "offline";
    }
  }
}


/* =========================================================
   6. PIXEL ART COVERS
   Cover images are drawn by the browser from a seed (the item
   id), so each item gets its own original artwork and nothing
   can be a b
