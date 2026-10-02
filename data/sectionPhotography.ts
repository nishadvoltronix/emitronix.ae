import { internalServiceImages, type InternalServiceImage } from "./internalServiceImages";

/** Existing licensed assets stay intact; only new internal figures use this catalogue. */
function stock(
  src: string,
  width: number,
  height: number,
  sourceId: string,
  alt: string,
  altAr: string,
  sourceUrl = `https://images.unsplash.com/${sourceId}`,
  credit = "Unsplash",
): InternalServiceImage {
  return {
    src, width, height, sourceId, alt, altAr, sourceUrl, credit,
    licenseUrl: sourceId.startsWith("Pexels") ? "https://www.pexels.com/license/" : "https://unsplash.com/license",
    caption: `Representative stock photograph: ${credit}. Not an Emitronix project.`,
    captionAr: "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
  };
}

export const sectionPhotographs: Readonly<Record<string, InternalServiceImage>> = {
  civil: internalServiceImages["/civil"],
  contracting: internalServiceImages["/main-contracting"],
  warehouse: internalServiceImages["/warehouse-construction"],
  industrial: internalServiceImages["/industrial-buildings"],
  commercial: internalServiceImages["/commercial-buildings"],
  villa: internalServiceImages["/villa-construction"],
  office: internalServiceImages["/interior"],
  technician: internalServiceImages["/building-renovation"],
  reinforcement: internalServiceImages["/structural-works"],
  plans: internalServiceImages["/design-build"],
  services: internalServiceImages["/turnkey-construction"],
  coordination: internalServiceImages["/project-management"],
  switchgear: internalServiceImages["/dewa-approvals"],
  drawing: internalServiceImages["/dubai-municipality-approval"],
  storage: internalServiceImages["/trakhees-approvals"],
  towers: internalServiceImages["/dda-approvals"],
  corridor: internalServiceImages["/concordia-dmcc-approvals"],
  workspace: internalServiceImages["/difc-approvals"],
  sprinkler: internalServiceImages["/dcd-approvals"],
  roads: internalServiceImages["/rta-approval"],
  progress: stock("/images/about-construction-coordination-dubai.webp", 1600, 2133, "photo-1626885930974-4b69aa21bbf9", "Construction professionals overlooking reinforced concrete work on site", "مختصون في البناء يتابعون أعمال الخرسانة المسلحة في الموقع"),
  foundations: stock("/images/civil-contractor-dubai-construction-site.webp", 900, 540, "photo-1541888946425-d81bb19240f5", "Construction team standing beside a large reinforced foundation slab", "فريق بناء يقف بجوار بلاطة أساس كبيرة من الخرسانة المسلحة"),
  cables: stock("/images/dewa-hv-lv-cable-works-dubai.webp", 1400, 788, "photo-1608574839637-2f7d0290d01d", "Electrical cables routed through overhead trays", "كابلات كهربائية تمر عبر حوامل علوية"),
  testing: stock("/images/dewa-lv-inspection-testing-dubai.webp", 1400, 788, "photo-1758101755915-462eddc23f57", "Gloved hands testing an electrical distribution panel", "يدان ترتديان قفازين تفحصان لوحة توزيع كهربائية"),
  skyline: stock("/images/dubai-building-contracting-company.webp", 1920, 900, "photo-1617018628636-6f3f5dcda7b1", "Dubai waterfront and city skyline", "واجهة دبي المائية وأفق المدينة"),
  sunsetCrew: stock("/images/home/construction-workers-sunset.webp", 2400, 1602, "Pexels28964677", "Silhouettes of construction workers on a building at sunset", "ظلال عمال بناء فوق مبنى عند غروب الشمس", "https://www.pexels.com/photo/silhouetted-construction-workers-at-sunset-28964677/", "King Ho / Pexels"),
  dubaiHills: stock("/images/home/dubai-hills-construction.webp", 1920, 1080, "photo-1588757470003-419f6a827196", "Tower cranes and concrete buildings under construction in Dubai Hills", "رافعات برجية ومبان خرسانية قيد الإنشاء في دبي هيلز"),
  jbr: stock("/images/home/dubai-jbr-residences.webp", 2400, 1600, "Pexels30445927", "Completed waterfront residential towers in Dubai", "أبراج سكنية مكتملة على الواجهة المائية في دبي", "https://www.pexels.com/photo/modern-skyscrapers-in-dubai-marina-at-daytime-30445927/", "Frederick Cana / Pexels"),
  hotel: stock("/images/home/dubai-landmark-hotel.webp", 2400, 1600, "Pexels2044434", "Burj Al Arab hotel beside the sea in Dubai", "فندق برج العرب بجوار البحر في دبي", "https://www.pexels.com/photo/burj-al-arab-dubai-2044434/", "Aleksandar Pasaric / Pexels"),
  gardens: stock("/images/home/dubai-landscaped-villas.webp", 2400, 1600, "Pexels33977060", "Completed villas surrounded by landscaped gardens", "فلل مكتملة تحيط بها حدائق منسقة", "https://www.pexels.com/photo/mediterranean-villas-with-lush-garden-landscape-33977060/", "Ayrat / Pexels"),
  marina: stock("/images/home/dubai-marina-residences.webp", 2400, 1600, "Pexels4491949", "Residential towers beside the Dubai Marina waterfront", "أبراج سكنية بجوار الواجهة المائية في دبي مارينا", "https://www.pexels.com/photo/city-skyline-across-body-of-water-4491949/", "Denys Gromov / Pexels"),
  villaCommunity: stock("/images/home/dubai-modern-villa-community.webp", 2400, 1350, "Pexels34188580", "Completed modern white villa in a Dubai residential neighbourhood", "فيلا بيضاء حديثة مكتملة في حي سكني في دبي", "https://www.pexels.com/photo/modern-villa-in-dubai-residential-area-34188580/", "AJ Ahamad / Pexels"),
  residential: stock("/images/home/dubai-residential-tower.webp", 2400, 3600, "Pexels3317535", "Cayan Tower residential building beneath a blue sky", "برج كيان السكني تحت سماء زرقاء", "https://www.pexels.com/photo/gray-high-rise-building-under-blue-and-white-sky-3317535/", "Aleksandar Pasaric / Pexels"),
  resort: stock("/images/home/dubai-waterfront-resort.webp", 2400, 1600, "Pexels35167987", "Completed waterfront resort buildings and palm trees", "مباني منتجع مكتملة ونخيل على الواجهة المائية", "https://www.pexels.com/photo/luxurious-resort-architecture-with-palm-trees-35167987/", "Magda Ehlers / Pexels"),
  pipework: stock("/images/project-mep-coordination-dubai.webp", 1600, 1067, "photo-1778514825784-0659eaf8e7a2", "Water pipes and electrical conduits during building services installation", "أنابيب مياه وقنوات كهربائية أثناء تركيب خدمات المبنى"),
  poolVilla: stock("/images/project-villa-building-works-dubai-modern.webp", 1600, 898, "photo-1613490493576-7fde63acd811", "Completed modern villa beside a rectangular swimming pool", "فيلا حديثة مكتملة بجوار مسبح مستطيل"),
  whiteVilla: stock("/images/villa-construction-contractor-dubai.webp", 900, 600, "photo-1600596542815-ffad4c1539a9", "Completed white villa with terraces and an outdoor pool", "فيلا بيضاء مكتملة مع شرفات ومسبح خارجي"),
  laptop: stock("/images/sections/office-laptop-work.webp", 1600, 1068, "Pexels6405641", "Hands using a laptop at a desk with office stationery", "يدان تستخدمان حاسوباً محمولاً على مكتب مع أدوات مكتبية", "https://www.pexels.com/photo/hands-typing-on-a-laptop-6405641/", "Pavel Danilyuk / Pexels"),
  binders: stock("/images/sections/document-binders.webp", 1600, 1067, "Pexels17018372", "Labelled ring binders and an open document file on a desk", "ملفات حلقية بعلامات وملف مستندات مفتوح على مكتب", "https://www.pexels.com/photo/ring-binders-with-documents-on-desk-17018372/", "Jakub Zerdzicki / Pexels"),
  records: stock("/images/sections/office-records-desk.webp", 1600, 1068, "Pexels8353764", "Paper documents, an open folder and computer monitors on an office desk", "مستندات ورقية وملف مفتوح وشاشات حاسوب على مكتب", "https://www.pexels.com/photo/documents-in-a-binder-on-a-work-desk-8353764/", "Kampus Production / Pexels"),
};

// Ordered by editorial topic, never by random values or a URL hash. Translation
// pairs intentionally use the same source; different derivatives count only once.
const topicSets: Readonly<Record<string, readonly string[]>> = {
  general: ["civil", "plans", "coordination", "office", "warehouse", "commercial", "villa", "drawing"],
  civil: ["foundations", "drawing", "reinforcement", "coordination", "civil", "progress", "plans", "dubaiHills"],
  warehouse: ["storage", "plans", "industrial", "coordination", "warehouse", "sprinkler", "reinforcement", "drawing"],
  steel: ["warehouse", "drawing", "industrial", "coordination", "reinforcement", "foundations", "plans", "storage"],
  flooring: ["foundations", "plans", "reinforcement", "coordination", "warehouse", "industrial", "storage", "drawing"],
  fire: ["sprinkler", "drawing", "pipework", "coordination", "storage", "industrial", "plans", "warehouse"],
  electrical: ["drawing", "technician", "cables", "testing", "switchgear", "plans", "pipework", "coordination"],
  mep: ["pipework", "plans", "cables", "coordination", "technician", "switchgear", "sprinkler", "services"],
  interior: ["office", "drawing", "pipework", "coordination", "corridor", "workspace", "services", "plans"],
  villa: ["villaCommunity", "drawing", "poolVilla", "coordination", "whiteVilla", "gardens", "villa", "plans"],
  residential: ["jbr", "plans", "dubaiHills", "coordination", "residential", "marina", "villaCommunity", "drawing"],
  commercial: ["office", "drawing", "services", "coordination", "commercial", "corridor", "hotel", "resort"],
  approvals: ["drawing", "plans", "coordination", "records", "binders", "laptop", "progress", "office"],
  roads: ["roads", "drawing", "foundations", "coordination", "plans", "dubaiHills", "civil", "progress"],
  management: ["progress", "plans", "contracting", "drawing", "coordination", "records", "civil", "sunsetCrew"],
  company: ["coordination", "warehouse", "civil", "office", "commercial", "skyline", "villa", "plans"],
  locations: ["skyline", "marina", "jbr", "dubaiHills", "commercial", "villaCommunity", "hotel", "residential"],
  careers: ["coordination", "plans", "sunsetCrew", "workspace", "progress", "laptop", "records", "contracting"],
  legal: ["laptop", "binders", "records", "plans", "workspace", "drawing", "office", "corridor"],
  utility: ["laptop", "records", "binders", "workspace", "plans", "drawing", "office", "corridor"],
  hospitality: ["hotel", "drawing", "resort", "coordination", "services", "office", "gardens", "plans"],
};

const exactTopics: Readonly<Record<string, keyof typeof topicSets>> = {
  "/civil": "civil", "/main-contracting": "management", "/warehouse-construction": "warehouse",
  "/industrial-buildings": "steel", "/commercial-buildings": "commercial", "/villa-construction": "villa",
  "/interior": "interior", "/building-renovation": "interior", "/structural-works": "civil",
  "/design-build": "management", "/turnkey-construction": "commercial", "/project-management": "management",
  "/dewa-approvals": "electrical", "/dubai-municipality-approval": "approvals", "/trakhees-approvals": "warehouse",
  "/dda-approvals": "approvals", "/concordia-dmcc-approvals": "interior", "/difc-approvals": "commercial",
  "/dcd-approvals": "fire", "/rta-approval": "roads", "/approval": "approvals", "/services": "general",
  "/about": "company", "/company-information": "company", "/contact": "management", "/careers": "careers",
  "/locations": "locations", "/leadership": "management", "/founder": "management", "/faqs": "general",
  "/search": "utility", "/admin/cookie-consent": "utility", "/404": "utility",
};

function topicFor(path: string): string {
  if (exactTopics[path]) return exactTopics[path];
  if (/privacy|cookies?|terms|legal|disclaimer|accessibility|refund|policy/.test(path)) return "legal";
  if (/admin|login|search|guest-post|sitemap/.test(path)) return "utility";
  if (/founder|leadership|director/.test(path)) return "management";
  if (/locations?\//.test(path)) return "locations";
  if (/fire|dcd/.test(path)) return "fire";
  if (/dewa|electrical|cable/.test(path)) return "electrical";
  if (/mep|ventilation|air.condition/.test(path)) return "mep";
  if (/floor|foundation|concrete/.test(path)) return "flooring";
  if (/steel|mezzanine|structural|roof/.test(path)) return "steel";
  if (/approvals?|municipality|authority|permit|noc|trakhees|dda/.test(path)) return "approvals";
  if (/warehouse|cold.storage|logistics|factory|industrial/.test(path)) return "warehouse";
  if (/interior|fit.out|renovation/.test(path)) return "interior";
  if (/villa/.test(path)) return "villa";
  if (/residential|apartment/.test(path)) return "residential";
  if (/hotel|hospitality|resort/.test(path)) return "hospitality";
  if (/commercial|office/.test(path)) return "commercial";
  if (/civil|construction.site/.test(path)) return "civil";
  if (/contractor|contracting|cost|planning|timeline|management|design.build/.test(path)) return "management";
  if (/career|recruit/.test(path)) return "careers";
  return "general";
}

const derivativeAliases: Readonly<Record<string, string>> = {
  "/images/building-contractor-dubai-construction-site.webp": "photo-1742112125567-3e8967bad60f",
  "/images/commercial-fit-out-contractor-dubai.webp": "photo-1554232456-8727aae0cfa4",
  "/images/dubai-authority-approval-contractor.webp": "photo-1608303588026-884930af2559",
  "/images/dubai-civil-works-construction-site.webp": "photo-1768677903496-becc4be07258",
  "/images/mep-civil-contracting-dubai.webp": "photo-1662120399978-738d233edbec",
  "/images/warehouse-construction-dubai.webp": "photo-1649587345666-0f4ad68aa723",
  "/images/home-construction-og.webp": "photo-1617018628636-6f3f5dcda7b1",
};

/** Resolve a local derivative, remote source URL or known photograph identity. */
export function getSectionPhotographSourceId(source: string): string {
  const normalized = source.split("?")[0].replace(/\.avif$/, ".webp");
  if (derivativeAliases[normalized]) return derivativeAliases[normalized];
  const photo = Object.values(sectionPhotographs).find((item) => item.src === normalized || item.sourceUrl === normalized || item.sourceId === normalized);
  return photo?.sourceId ?? normalized;
}

/** Select distinct, topic-matched supporting photos; the service hero is excluded. */
export function getSectionPhotographs(path: string, count = 4, excludeSources: string[] = []): InternalServiceImage[] {
  const route = path.split(/[?#]/)[0].replace(/\/+$/, "").replace(/^\/ar(?=\/|$)/, "") || "/";
  if (route === "/" || !Number.isFinite(count) || count <= 0) return [];

  const hero = internalServiceImages[route];
  const excluded = new Set(excludeSources.map(getSectionPhotographSourceId));
  if (hero) excluded.add(hero.sourceId);

  const result: InternalServiceImage[] = [];
  // Each curated group supplies at least eight subjects. The related general set
  // only fills unusually large exclusion lists; selection never repeats a source.
  const selected = [...topicSets[topicFor(route)], ...topicSets.general];
  for (const key of selected) {
    const photo = sectionPhotographs[key];
    if (excluded.has(photo.sourceId)) continue;
    result.push(photo);
    excluded.add(photo.sourceId);
    if (result.length >= Math.floor(count)) break;
  }
  return result;
}
