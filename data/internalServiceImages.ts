/** Internal service photography only. Home data and existing image files are unchanged. */
export type InternalServiceImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  altAr: string;
  caption: string;
  captionAr: string;
  sourceId: string;
  sourceUrl: string;
  licenseUrl: string;
  credit: string;
  objectPosition?: string;
};

// Each service owns a distinct source photograph. Its EN/AR translations share it.
export const internalServiceImages: Readonly<Record<string, InternalServiceImage>> = {
  "/civil": {
    "src": "/images/project-civil-works-dubai.webp",
    "width": 1600,
    "height": 900,
    "sourceId": "photo-1504307651254-35680f356dfd",
    "alt": "Construction workers preparing reinforcement and cutting steel at a building site",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1504307651254-35680f356dfd",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "عمال بناء يجهزون حديد التسليح ويقطعون الفولاذ في موقع إنشائي",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/main-contracting": {
    "src": "/images/about-civil-works-dubai.webp",
    "width": 1600,
    "height": 1067,
    "sourceId": "photo-1742112125630-dd2955dd6120",
    "alt": "Two construction professionals in hard hats reviewing work beside stored materials",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1742112125630-dd2955dd6120",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "مختصان في البناء يرتديان خوذتي حماية ويراجعان العمل بجوار مواد مخزنة",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/warehouse-construction": {
    "src": "/images/internal/warehouse-steel-frame.webp",
    "width": 1920,
    "height": 1280,
    "sourceId": "photo-1649587345666-0f4ad68aa723",
    "alt": "Cranes and lifting equipment erecting a steel warehouse frame",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1649587345666-0f4ad68aa723",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "رافعات ومعدات رفع أثناء تركيب هيكل فولاذي لمستودع",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/industrial-buildings": {
    "src": "/images/internal/industrial-steel-roof.webp",
    "width": 1920,
    "height": 1280,
    "sourceId": "photo-1662120399978-738d233edbec",
    "alt": "Workers on a scissor lift installing industrial steel roof trusses",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1662120399978-738d233edbec",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "عمال على منصة رفع مقصية يركبون جمالونات سقف فولاذية",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/commercial-buildings": {
    "src": "/images/home/dubai-commercial-towers.webp",
    "width": 2400,
    "height": 1600,
    "sourceId": "Pexels14309391",
    "alt": "Completed Emirates Towers buildings photographed from below in Dubai",
    "caption": "Representative stock photograph: Kirandeep Singh Walia / Pexels. Not an Emitronix project.",
    "sourceUrl": "https://www.pexels.com/photo/low-angle-shot-of-emirates-towers-14309391/",
    "credit": "Kirandeep Singh Walia / Pexels",
    "licenseUrl": "https://www.pexels.com/license/",
    "altAr": "مباني أبراج الإمارات المكتملة في دبي من زاوية منخفضة",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center 60%"
  },
  "/villa-construction": {
    "src": "/images/home/dubai-contemporary-villa.webp",
    "width": 2400,
    "height": 1600,
    "sourceId": "Pexels10647324",
    "alt": "Completed contemporary villa with a swimming pool and landscaped garden in Dubai",
    "caption": "Representative stock photograph: Abid Ali / Pexels. Not an Emitronix project.",
    "sourceUrl": "https://www.pexels.com/photo/white-and-brown-concrete-building-near-the-swimming-pool-10647324/",
    "credit": "Abid Ali / Pexels",
    "licenseUrl": "https://www.pexels.com/license/",
    "altAr": "فيلا معاصرة مكتملة مع مسبح وحديقة منسقة في دبي",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/interior": {
    "src": "/images/project-office-fit-out-dubai.webp",
    "width": 1600,
    "height": 1067,
    "sourceId": "photo-1504297050568-910d24c426d3",
    "alt": "Glass-partitioned office corridor with exposed ceiling services",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1504297050568-910d24c426d3",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "ممر مكاتب بفواصل زجاجية وخدمات ظاهرة في السقف",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/building-renovation": {
    "src": "/images/project-building-maintenance-dubai.webp",
    "width": 1600,
    "height": 1067,
    "sourceId": "photo-1621905251189-08b45d6a269e",
    "alt": "Technician working on a wall-mounted electrical installation",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "فني يعمل على تمديدات كهربائية مثبتة على جدار",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/structural-works": {
    "src": "/images/internal/structural-reinforcement.webp",
    "width": 1920,
    "height": 1275,
    "sourceId": "photo-1768677903496-becc4be07258",
    "alt": "Construction worker inspecting a dense reinforcement grid before concrete placement",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1768677903496-becc4be07258",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "عامل بناء يفحص شبكة كثيفة من حديد التسليح قبل صب الخرسانة",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/design-build": {
    "src": "/images/project-authority-approvals-dubai.webp",
    "width": 1600,
    "height": 1067,
    "sourceId": "photo-1581674662583-5e89b374fae6",
    "alt": "Architectural plans and a notebook arranged on a worktable",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1581674662583-5e89b374fae6",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "مخططات معمارية ودفتر ملاحظات على طاولة عمل",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/turnkey-construction": {
    "src": "/images/project-commercial-renovation-dubai.webp",
    "width": 1600,
    "height": 1067,
    "sourceId": "photo-1739700712159-550519327ca7",
    "alt": "Finished commercial corridor with exposed ventilation ducts and building services",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1739700712159-550519327ca7",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "ممر تجاري مكتمل مع قنوات تهوية وخدمات مبنى ظاهرة",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/project-management": {
    "src": "/images/internal/project-site-coordination.webp",
    "width": 1920,
    "height": 1280,
    "sourceId": "photo-1742112125567-3e8967bad60f",
    "alt": "Two construction professionals reviewing a clipboard on site",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1742112125567-3e8967bad60f",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "مختصان في البناء يراجعان لوحة مستندات في الموقع",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/dewa-approvals": {
    "src": "/images/dewa-approval-dubai-electrical-engineers.webp",
    "width": 1672,
    "height": 942,
    "sourceId": "photo-1558054665-fbe00cd7d920",
    "alt": "Rows of electrical distribution switchgear in a plant room",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1558054665-fbe00cd7d920",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "صفوف من لوحات توزيع الكهرباء داخل غرفة معدات",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/dubai-municipality-approval": {
    "src": "/images/internal/architectural-drawing-review.webp",
    "width": 1920,
    "height": 2768,
    "sourceId": "photo-1608303588026-884930af2559",
    "alt": "Hands reviewing architectural drawings with a ruler and calculator",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1608303588026-884930af2559",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "مراجعة مخططات معمارية باستخدام مسطرة وآلة حاسبة",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center 42%"
  },
  "/trakhees-approvals": {
    "src": "/images/project-warehouse-industrial-dubai.webp",
    "width": 1600,
    "height": 1067,
    "sourceId": "photo-1592085198739-ffcad7f36b54",
    "alt": "Pallet racks and stored goods inside an industrial warehouse",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1592085198739-ffcad7f36b54",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "رفوف منصات نقالة وبضائع مخزنة داخل مستودع صناعي",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/dda-approvals": {
    "src": "/images/home/jumeirah-village-circle-construction.webp",
    "width": 1920,
    "height": 1080,
    "sourceId": "photo-1743819344477-3b67c19621e9",
    "alt": "Tower cranes and reinforced concrete structures under construction in Jumeirah Village Circle, Dubai",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1743819344477-3b67c19621e9",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "رافعات برجية وهياكل خرسانية قيد الإنشاء في قرية جميرا الدائرية بدبي",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/concordia-dmcc-approvals": {
    "src": "/images/internal/commercial-office-corridor.webp",
    "width": 1920,
    "height": 2560,
    "sourceId": "photo-1554232456-8727aae0cfa4",
    "alt": "Completed office corridor with glass partitions and ceiling services",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1554232456-8727aae0cfa4",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "ممر مكاتب مكتمل بفواصل زجاجية وخدمات سقف",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/difc-approvals": {
    "src": "/images/project-fit-out-dubai.webp",
    "width": 1600,
    "height": 2400,
    "sourceId": "photo-1771918050103-57b5de00d960",
    "alt": "Office workstations below exposed ventilation ductwork and suspended lights",
    "caption": "Representative stock photograph: Unsplash. Not an Emitronix project.",
    "sourceUrl": "https://images.unsplash.com/photo-1771918050103-57b5de00d960",
    "credit": "Unsplash",
    "licenseUrl": "https://unsplash.com/license",
    "altAr": "محطات عمل مكتبية تحت قنوات تهوية وإضاءة معلقة",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/dcd-approvals": {
    "src": "/images/internal/fire-sprinkler-pipework.webp",
    "width": 1920,
    "height": 1440,
    "sourceId": "Pexels37352142",
    "sourceUrl": "https://www.pexels.com/photo/industrial-fire-sprinkler-system-pipes-37352142/",
    "alt": "Red sprinkler risers with control valves and gauges on an industrial building",
    "credit": "Loc Ho / Pexels",
    "licenseUrl": "https://www.pexels.com/license/",
    "altAr": "أنابيب رشاشات حريق حمراء مع صمامات تحكم ومقاييس على مبنى صناعي",
    "caption": "Representative stock photograph: Loc Ho / Pexels. Not an Emitronix project.",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  },
  "/rta-approval": {
    "src": "/images/internal/roadworks-asphalt.webp",
    "width": 1920,
    "height": 1280,
    "sourceId": "Pexels4575148",
    "sourceUrl": "https://www.pexels.com/photo/men-working-on-road-construction-4575148/",
    "alt": "Road workers laying asphalt beside a road roller and traffic cones",
    "credit": "Alejandro Perez / Pexels",
    "licenseUrl": "https://www.pexels.com/license/",
    "altAr": "عمال طرق يفرشون الأسفلت بجوار مدحلة ومخاريط مرور",
    "caption": "Representative stock photograph: Alejandro Perez / Pexels. Not an Emitronix project.",
    "captionAr": "صورة فوتوغرافية مرخّصة للتوضيح، وليست من مشاريع إيمترونكس.",
    "objectPosition": "center"
  }
};

export function findInternalServiceImage(href: string): InternalServiceImage | undefined {
  const path = href.replace(/^\/ar(?=\/|$)/, "").replace(/\/$/, "");
  return internalServiceImages[path];
}

export function getInternalServiceImage(href: string): InternalServiceImage {
  const image = findInternalServiceImage(href);
  if (!image) throw new Error("Internal service image is not configured.");
  return image;
}

/** Existing photographs used only by the DEWA detail panels. */
export const dewaSupportingImages: Readonly<Record<"inspection" | "cables", InternalServiceImage>> = {
  inspection: {
    src: "/images/dewa-lv-inspection-testing-dubai.webp",
    width: 1400,
    height: 788,
    alt: "Gloved hands using electrical test probes on distribution equipment",
    altAr: "يدان بقفازات تستخدمان مجسات اختبار كهربائي على معدات توزيع",
    caption: "Representative electrical-testing photograph from Unsplash; not a DEWA inspection or an Emitronix project.",
    captionAr: "صورة مرخّصة لاختبار كهربائي للتوضيح؛ وليست فحصاً من ديوا أو من مشاريع إيمترونكس.",
    sourceId: "photo-1758101755915-462eddc23f57",
    sourceUrl: "https://images.unsplash.com/photo-1758101755915-462eddc23f57",
    licenseUrl: "https://unsplash.com/license",
    credit: "Unsplash",
  },
  cables: {
    src: "/images/dewa-hv-lv-cable-works-dubai.webp",
    width: 1400,
    height: 788,
    alt: "Electrical and communication cables arranged in overhead cable trays",
    altAr: "كابلات كهرباء واتصالات مرتبة في حوامل كابلات علوية",
    caption: "Representative cable-containment photograph from Unsplash; not a DEWA installation or an Emitronix project.",
    captionAr: "صورة مرخّصة لحوامل كابلات للتوضيح؛ وليست تركيباً تابعاً لديوا أو من مشاريع إيمترونكس.",
    sourceId: "photo-1608574839637-2f7d0290d01d",
    sourceUrl: "https://images.unsplash.com/photo-1608574839637-2f7d0290d01d",
    licenseUrl: "https://unsplash.com/license",
    credit: "Unsplash",
  },
};
