import type { BlogPost } from "@/data/blog";
import type { GeneratedImageKey } from "@/data/generatedImages";
import { warehouseBlogIndexingContent } from "@/data/warehouseBlogIndexingContent";
import { getWarehouseIndexingContent } from "@/data/warehouseIndexingContent";
import {
  warehouseBlogResourceSlugs,
  warehouseBlogTopics,
  warehouseSiloTopics,
  type WarehouseSiloTopic,
} from "@/data/warehouseRoutes";

export type WarehouseAuthorityPage = {
  title: string;
  slug: string;
  href: string;
  keyword: string;
  category: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  excerpt: string;
  imageKey: GeneratedImageKey;
  intro: string[];
  summaryFacts: string[];
  benefits: string[];
  processSteps: string[];
  requiredDocuments: string[];
  qualityControls: string[];
  serviceAreas: string[];
  authorityNotes: string[];
  engineeringOpinion: string;
  failureMode: string;
  fieldChecks: Array<{ title: string; description: string }>;
  related: Array<{ label: string; href: string }>;
  faqs: Array<{ question: string; answer: string }>;
  references: Array<{ title: string; href: string }>;
  modifiedDate?: string;
};

const reviewedDate = "2026-08-02";
const companyName = "Emitronix Contracting LLC";
const baseServiceAreas = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Umm Al Quwain",
  "Fujairah",
];

const references = [
  {
    title: "Dubai Municipality building services",
    href: "https://www.dm.gov.ae/municipality-business/",
  },
  {
    title: "Dubai Civil Defence services",
    href: "https://www.dcd.gov.ae/",
  },
  {
    title: "DEWA customer services",
    href: "https://www.dewa.gov.ae/",
  },
  {
    title: "UAE Government business permits",
    href: "https://u.ae/en/information-and-services/business/obtaining-certificates-and-licences/obtaining-certificates-and-permits",
  },
];

const pageImageKeys: GeneratedImageKey[] = [
  "services.warehouse-construction-dubai",
  "services.industrial-construction-dubai",
  "services.structural-works-dubai",
  "services.design-build-contractor-dubai",
  "services.project-management-dubai",
];

const blogImageKeys: GeneratedImageKey[] = [
  "blog.warehouse-construction-planning-guide",
  "blog.civil-construction-dubai-guide-2026",
  "blog.dubai-authority-approvals-guide",
  "blog.choosing-building-contractor-dubai",
];

const blogImagePaths = {
  "blog.warehouse-construction-planning-guide": "/images/generated/blog/warehouse-construction-planning-guide-desktop.webp",
  "blog.civil-construction-dubai-guide-2026": "/images/generated/blog/civil-construction-dubai-guide-2026-desktop.webp",
  "blog.dubai-authority-approvals-guide": "/images/generated/blog/dubai-authority-approvals-guide-desktop.webp",
  "blog.choosing-building-contractor-dubai": "/images/generated/blog/choosing-building-contractor-dubai-desktop.webp",
} as const satisfies Record<GeneratedImageKey & `blog.${string}`, string>;

const blogImageAlts = {
  "blog.warehouse-construction-planning-guide": "Warehouse construction planning and contractor coordination in Dubai",
  "blog.civil-construction-dubai-guide-2026": "Civil contractor Dubai planning for warehouse and industrial construction",
  "blog.dubai-authority-approvals-guide": "Dubai authority approval documents for warehouse construction projects",
  "blog.choosing-building-contractor-dubai": "Construction company Dubai team reviewing warehouse contractor scope",
} as const satisfies Record<GeneratedImageKey & `blog.${string}`, string>;

function clipped(value: string, max = 158) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).replace(/\s+\S*$/, "")}.`;
}

// Repair only the malformed endings confirmed in the full website QA.
// Complete descriptions retain the original subject and source wording.
function clippedMetaDescription(value: string) {
  const result = clipped(value);
  return /(?:and|evidence in)\.$/.test(result) ? value : result;
}

function clippedMetaTitle(value: string) {
  return clipped(value, 68)
    .replace(/\s*\|\.$/, "")
    .replace(/Emitronix\.$/, "Emitronix");
}

function topicIndex(topic: WarehouseSiloTopic) {
  return warehouseSiloTopics.findIndex((item) => item.slug === topic.slug);
}

function relatedPages(topic: WarehouseSiloTopic): Array<{ label: string; href: string }> {
  const index = topicIndex(topic);
  const candidates = [
    warehouseSiloTopics[index - 2],
    warehouseSiloTopics[index - 1],
    warehouseSiloTopics[index + 1],
    warehouseSiloTopics[index + 2],
  ].filter((item): item is WarehouseSiloTopic => Boolean(item));

  return [
    { label: "Warehouse Construction Dubai", href: "/warehouse-construction" },
    { label: "Industrial Buildings", href: "/industrial-buildings" },
    { label: "Authority Approvals Dubai", href: "/approval" },
    ...candidates.map((item) => ({ label: item.title, href: `/warehouse/${item.slug}` })),
  ].filter((item, itemIndex, self) => self.findIndex((other) => other.href === item.href) === itemIndex);
}

function authoritySentence(authorities: string[]) {
  return authorities.length > 1
    ? `${authorities.slice(0, -1).join(", ")} and ${authorities.at(-1)}`
    : authorities[0] ?? "Dubai authority";
}

function warehouseTechnicalBrief(topic: WarehouseSiloTopic) {
  const name = topic.title.toLowerCase();

  if (/cold storage/.test(name)) {
    return {
      controllingDecision: "The temperature regime and product profile must be fixed before the envelope, refrigeration load, drainage and emergency strategy are treated as coordinated.",
      failureMode: "A cold room can reach temperature and still perform badly if vapour control, floor insulation, door cycles or condensate drainage were resolved too late.",
      checks: [
        ["Thermal envelope continuity", "Trace insulation and vapour-control continuity through wall, roof, floor, door and service penetrations; small discontinuities become condensation paths."],
        ["Refrigeration and electrical demand", "Confirm duty, diversity, standby philosophy and defrost loads before utility capacity and distribution equipment are frozen."],
        ["Hygiene and drainage", "Set floor falls, trapped drainage, washable junctions and cleaning access around the actual operating process."],
        ["Door and traffic cycle", "Model pallet and personnel movement because frequent door opening can defeat the assumed cooling load and pressure balance."],
      ],
    };
  }

  if (/floor|concrete|foundation|slab/.test(name)) {
    return {
      controllingDecision: "The slab must be designed around rack reactions, wheel loads, joint layout, flatness tolerance and ground conditions, not a generic load stated in isolation.",
      failureMode: "Premature joint failure and local slab damage usually begin where operating loads, subgrade preparation and joint details were assessed by different parties.",
      checks: [
        ["Load map", "Record rack leg reactions, forklift wheel loads, equipment bases and future layout zones before reinforcement and joint decisions are closed."],
        ["Subgrade acceptance", "Verify compaction, level, testing and soft-spot treatment before concrete placement; the finished slab cannot correct an unstable formation."],
        ["Joints and traffic", "Keep construction and movement joints away from the most punishing wheel paths where the structural and operational layout allows."],
        ["Flatness and curing", "Agree the measurement method, timing, curing regime and repair acceptance criteria before the pour sequence starts."],
      ],
    };
  }

  if (/roof|steel|structural/.test(name)) {
    return {
      controllingDecision: "Grid, clear height, bracing, crane or equipment loads, roof drainage and service penetrations must be coordinated as one structural system.",
      failureMode: "Late openings and unplanned suspended loads often turn a simple steel package into strengthening, leakage and programme rework.",
      checks: [
        ["Grid and clearances", "Test column, bracing and haunch positions against racking, dock movement, doors and maintenance routes."],
        ["Roof water management", "Coordinate falls, outlets, overflow paths and drainage capacity before cladding and internal services compete for the same zones."],
        ["Penetration register", "Freeze smoke vents, ducts, cable routes and roof equipment openings before fabrication where possible."],
        ["Erection stability", "Plan temporary stability, crane access, delivery sequence and exclusion zones as part of the structural method."],
      ],
    };
  }

  if (/fire|dcd|safety/.test(name)) {
    return {
      controllingDecision: "Storage commodity, rack arrangement, storage height and occupancy drive the fire strategy; a warehouse label alone is not a sufficient design basis.",
      failureMode: "Fire-safety rework appears when the approved use, installed systems and actual operating layout describe different risks.",
      checks: [
        ["Design basis", "Record commodity, packaging, storage height, aisle arrangement and special hazards before system selection."],
        ["Access and egress", "Check fire-appliance access, exit travel, door swing and clear escape routes against the operating layout."],
        ["System interfaces", "Coordinate alarms, sprinklers, hose reels, smoke control, power supplies and monitoring before ceilings or services are closed."],
        ["Inspection evidence", "Prepare approved drawings, test records, equipment access and closed snags before requesting inspection."],
      ],
    };
  }

  if (/mep|utility|dewa|electrical/.test(name)) {
    return {
      controllingDecision: "Utility capacity should be based on the operating load schedule and future allowance, then reconciled with authority, equipment and commissioning requirements.",
      failureMode: "A service route that works on a plan can fail at site when maintenance access, fire separation, structural zones and shutdown sequencing were not coordinated.",
      checks: [
        ["Load and diversity", "Separate connected load, demand, starting current, resilience needs and planned expansion before capacity is requested."],
        ["Coordinated service zones", "Protect access to valves, panels, dampers and equipment while avoiding structural and fire-rated conflicts."],
        ["Testing sequence", "Plan energisation, flushing, balancing, cause-and-effect tests and authority witnesses around real dependencies."],
        ["Maintainability", "Check removal paths, working clearances, isolation points and safe roof or plant access before handover."],
      ],
    };
  }

  if (/loading|logistics|distribution|parking|road|infrastructure/.test(name)) {
    return {
      controllingDecision: "Vehicle geometry, loading rhythm and pedestrian separation should shape the external works before kerbs, docks and drainage are fixed.",
      failureMode: "Operational bottlenecks are built in when drawings show parking bays but do not test turning envelopes, queue length, dock occupation or conflicting movements.",
      checks: [
        ["Swept-path review", "Test the design vehicle through gates, bends, docks and exit movements with realistic parked and waiting conditions."],
        ["Dock interface", "Coordinate trailer level, dock height, leveller travel, door position, buffers and internal material movement."],
        ["People and vehicles", "Separate pedestrian paths, crossings and staff access from reversing and loading zones wherever practicable."],
        ["Pavement and drainage", "Match pavement build-up and falls to axle loads, braking zones, washdown and stormwater routes."],
      ],
    };
  }

  if (/approval|compliance|municipality| dm /.test(` ${name} `)) {
    return {
      controllingDecision: "Jurisdiction, intended use and the formal submission responsibility must be confirmed before the team builds a document programme.",
      failureMode: "Repeated comments usually signal a mismatch between project facts, drawings, stakeholder authority and the site, not simply a slow portal transaction.",
      checks: [
        ["Jurisdiction check", "Confirm plot, free-zone or master-developer control and the role of the appointed consultant before selecting the route."],
        ["Submission basis", "Use one controlled set of scope, drawings, NOCs and authorisations so reviewers are not asked to reconcile conflicting information."],
        ["Comment ownership", "Assign every comment to a responsible designer, owner, contractor or supplier with a due date and affected document."],
        ["Site-to-drawing check", "Before inspection, compare the latest approved information with visible work, tests, access and completion evidence."],
      ],
    };
  }

  if (/fit-out|office/.test(name)) {
    return {
      controllingDecision: "The operating layout, occupancy and fire compartments must be coordinated with MEP zones before partitions and ceilings make changes expensive.",
      failureMode: "Fit-out delays tend to surface above ceilings, where access, fire stopping, dampers, detectors, drainage and power routes converge.",
      checks: [
        ["Occupancy and layout", "Confirm headcount, office use, welfare spaces, storage operations and escape strategy against the proposed plan."],
        ["Ceiling coordination", "Resolve services, access panels, fire devices, lighting and supports before closing the ceiling zone."],
        ["Fire-rated boundaries", "Track every penetration and door requirement through procurement, installation and inspection."],
        ["Operational handover", "Test power, cooling, life-safety interfaces, access control and maintainability with the user present."],
      ],
    };
  }

  if (/renovation|extension|expansion|maintenance/.test(name)) {
    return {
      controllingDecision: "Existing-condition evidence and the live-operation plan must be reliable before demolition, strengthening or shutdown dates are agreed.",
      failureMode: "The largest surprises are usually concealed services, undocumented alterations and assumptions that the original drawing still represents the asset.",
      checks: [
        ["Condition survey", "Open up or test critical areas where the consequence of an incorrect assumption is high."],
        ["Live-operation controls", "Plan temporary access, segregation, dust, noise, utility continuity and emergency routes with the operator."],
        ["Interface register", "List every new-to-existing structural, envelope, MEP and fire-safety connection and assign verification responsibility."],
        ["Recommissioning", "Define what must be retested after shutdown, alteration or reinstatement before the area returns to service."],
      ],
    };
  }

  if (/factory|industrial building/.test(name)) {
    return {
      controllingDecision: "Production flow, equipment loads, utility demand and maintenance access should lead the building brief, not be fitted into a generic shell later.",
      failureMode: "Industrial space loses value when equipment foundations, extraction, material flow and service isolation are resolved after the structural grid is committed.",
      checks: [
        ["Process flow", "Map raw material, production, quality hold, finished goods, waste and staff movements before area schedules are frozen."],
        ["Equipment data", "Confirm static, dynamic and maintenance loads plus bases, pits, lifting and replacement paths."],
        ["Utilities and ventilation", "Coordinate demand, heat rejection, extraction, drainage and resilience with the actual process."],
        ["Safe maintenance", "Provide isolation, access, working space and removal routes that remain usable after operations begin."],
      ],
    };
  }

  return {
    controllingDecision: "Storage layout, rack loading, truck circulation, fire strategy and future expansion should be tested together before the structural and civil brief is frozen.",
    failureMode: "A warehouse can be completed to drawings yet remain operationally weak when the drawings were never tested against real goods, vehicles, people and maintenance activity.",
    checks: [
      ["Operational brief", "Record goods profile, throughput, storage method, shift pattern and special hazards before area and height decisions are closed."],
      ["Rack and slab interface", "Coordinate rack reactions, aisle tolerances, forklift loads, joints and future layout flexibility."],
      ["Truck circulation", "Test gates, queueing, turning, reversing, dock occupation and pedestrian routes using the design vehicle."],
      ["Future change", "Reserve sensible structural, utility and external-work options for expansion without presenting them as guaranteed capacity."],
    ],
  };
}

function makePage(topic: WarehouseSiloTopic, index: number): WarehouseAuthorityPage {
  const authorityText = authoritySentence(topic.authorityFocus);
  const indexingContent = getWarehouseIndexingContent(topic.slug);
  const related = relatedPages(topic).slice(0, 7);
  const technicalBrief = warehouseTechnicalBrief(topic);
  const serviceArea = index % 3 === 0
    ? "Dubai Investment Park, JAFZA, Dubai South and Al Quoz"
    : index % 3 === 1
      ? "Jebel Ali, Dubai Industrial City, Dubai Production City and Sharjah industrial areas"
      : "Dubai, Abu Dhabi, Sharjah, Ajman and wider UAE industrial zones";

  return {
    title: topic.title,
    slug: topic.slug,
    href: `/warehouse/${topic.slug}`,
    keyword: topic.keyword,
    category: topic.category,
    seoTitle: `${topic.title} | Warehouse Contractor Dubai`,
    metaDescription: indexingContent?.metaDescription ?? clippedMetaDescription(
      `${topic.title}: review operations, civil and structural interfaces, utilities, authority dependencies, site controls and handover evidence in Dubai.`,
    ),
    h1: `${topic.title} for Dubai and UAE industrial projects`,
    excerpt:
      `A decision brief for ${topic.primaryAudience} connecting ${topic.serviceModifier} to operating requirements, drawing control, authority dependencies, field checks and handover evidence.`,
    imageKey: pageImageKeys[index % pageImageKeys.length],
    intro: [
      `The first planning question is ${technicalBrief.checks[0][0].toLowerCase()}. Decide what evidence will confirm that basis before the team fixes quantities, structure, services or a completion date.`,
      `For ${topic.assetType} work in ${serviceArea}, the route can also involve a landlord, free-zone or master developer and authorities such as ${authorityText}. Confirm the actual jurisdiction and appointed-party responsibilities before relying on a standard approval sequence.`,
      `${topic.primaryAudience} can use this page to test design maturity, access, utilities, procurement, inspection hold points and handover evidence when reviewing ${topic.serviceModifier}.`,
    ],
    summaryFacts: [
      `${topic.title} should start with drawings, intended use, current approvals, utility requirements and site access constraints.`,
      `Dubai warehouse projects often involve ${authorityText} along with landlord or master developer conditions.`,
      "The most common delay risks are unclear scope, incomplete drawings, late MEP decisions, fire-safety comments and missing close-out documents.",
      "A contractor should be reviewed for buildability input, authority awareness, QA/QC discipline, safety planning and handover documentation.",
    ],
    benefits: [
      "Clearer budget assumptions because civil, structural, MEP, external works and authority responsibilities are separated early.",
      "Reduced approval friction through early identification of Dubai Municipality, DEWA, DCD, Trakhees, DDA, JAFZA, Dubai South or RTA touchpoints.",
      "Better operational fit because loading, access, parking, office areas, slab performance, fire safety and maintenance routes are considered before site pressure starts.",
      "Improved handover readiness through documentation, inspection planning, snag tracking and stakeholder coordination.",
    ],
    processSteps: [
      `Review ${topic.assetType} use, location, drawings, plot or tenancy details, operational requirements and constraints.`,
      `Map ${authorityText} exposure plus landlord, free-zone, master developer or consultant responsibilities.`,
      "Clarify civil, structural, MEP, fire-safety, fit-out, utility, external works and completion deliverables.",
      "Prepare a dependency-led construction sequence with procurement, inspections, document control and QA/QC checkpoints.",
      "Execute site works with safety control, progress reporting, consultant coordination and issue tracking.",
      "Close out snags, as-built information, inspection evidence, authority comments and project handover records.",
    ],
    requiredDocuments: [
      "Project brief, intended use and occupancy requirements.",
      "Plot, lease, title deed, tenancy, landlord or free-zone information where applicable.",
      "Architectural, structural, MEP, fire-safety and external works drawings.",
      "Existing authority comments, NOCs, approval references and consultant correspondence.",
      "Site photographs, access notes, current services, utility load information and operational constraints.",
      "Specification, material expectations, program target and handover requirements.",
    ],
    qualityControls: [
      "Drawing and revision control before work is issued to site.",
      "Material submittal tracking and procurement lead-time review.",
      "Civil, MEP and fire-safety interface checks before covering or closing areas.",
      "Inspection readiness, housekeeping, safety observations and non-conformance tracking.",
      "Handover evidence, completion documents and snag closure records.",
    ],
    serviceAreas: baseServiceAreas,
    authorityNotes: topic.authorityFocus.map((authority) => {
      if (authority === "DEWA") return "DEWA requirements can influence power load, service connections, water, utility rooms, temporary supply and commissioning readiness.";
      if (authority === "DCD") return "DCD requirements can influence fire access, fire alarm, fire fighting, storage use, hazardous materials, egress and inspection sequencing.";
      if (authority === "RTA") return "RTA exposure may apply where access, road works, traffic movement or loading interfaces connect to public infrastructure.";
      if (authority === "Trakhees") return "Trakhees requirements may apply in specific free-zone and port-related jurisdictions, with its own submission and inspection workflows.";
      if (authority === "JAFZA") return "JAFZA and free-zone requirements can affect permits, NOCs, operations, fit-out and handover in logistics and industrial zones.";
      if (authority === "Dubai South") return "Dubai South projects may require master developer and authority coordination for logistics, aviation-adjacent and industrial locations.";
      return `${authority} requirements should be checked against the project location, consultant role, drawings, current comments and intended warehouse operation.`;
    }),
    engineeringOpinion: technicalBrief.controllingDecision,
    failureMode: technicalBrief.failureMode,
    fieldChecks: technicalBrief.checks.map(([title, description]) => ({ title, description })),
    related,
    faqs: [
      {
        question: `What should I prepare before requesting ${topic.title.toLowerCase()}?`,
        answer:
          "Prepare the location, drawings, intended use, site condition, authority comments, consultant details, landlord requirements, utility needs and a realistic target timeline.",
      },
      {
        question: `Which authorities may affect ${topic.title.toLowerCase()} in Dubai?`,
        answer:
          `Depending on the project location and use, relevant touchpoints may include ${authorityText}, plus landlord, free-zone, consultant or master developer requirements.`,
      },
      {
        question: `What should the risk review cover for ${topic.title.toLowerCase()}?`,
        answer:
          `Test scope, buildability, authority exposure, MEP interfaces, temporary works, safety controls, procurement and handover evidence. Give particular attention to this failure mode: ${technicalBrief.failureMode}`,
      },
      {
        question: "Does this service support projects outside Dubai?",
        answer:
          "Dubai is the primary market, but Emitronix publishes service coverage for the UAE including Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Umm Al Quwain and Fujairah where project scope is suitable.",
      },
    ],
    references,
    ...(indexingContent ? { modifiedDate: "2026-10-01" } : {}),
  };
}

export const warehouseAuthorityPages: WarehouseAuthorityPage[] = warehouseSiloTopics.map(makePage);

function matchingWarehousePage(keyword: string) {
  const resourceSlug = warehouseBlogResourceSlugs[
    keyword as keyof typeof warehouseBlogResourceSlugs
  ];
  const resourcePage = warehouseAuthorityPages.find((page) => page.slug === resourceSlug);

  if (!resourcePage) {
    throw new Error(`Missing warehouse resource mapping for blog topic: ${keyword}`);
  }

  return resourcePage;
}

function warehouseArticleLens(angle: (typeof warehouseBlogTopics)[number]["angle"]) {
  if (angle === "Approval Checklist") {
    return {
      focus: "separate jurisdiction, technical design, stakeholder NOCs and inspection evidence into owned actions",
      ownerQuestion: "Which document or decision must exist before the next submission or site activity can proceed?",
      commercialWarning: "An approval allowance is not a complete scope unless it identifies the formal submitter, included responses, excluded fees, specialist inputs and inspection support.",
      programmeAdvice: "Place submissions, comment responses, NOCs and inspections on the programme as dependencies rather than notes beside site activities.",
      comparison: "Compare teams by the clarity of their document register and response ownership, not by a promise of guaranteed authority timing.",
    };
  }
  if (angle === "Cost Factors") {
    return {
      focus: "trace cost back to quantities, performance criteria, interfaces, authority conditions and unresolved assumptions",
      ownerQuestion: "Which part of the price is measured, which is provisional and which depends on information that is not yet available?",
      commercialWarning: "A low total can conceal missing external works, utility interfaces, fire-safety changes, testing or close-out obligations.",
      programmeAdvice: "Link procurement dates to drawing release and approval risk; an early order is useful only when its technical basis is stable.",
      comparison: "Compare pricing schedules line by line, including assumptions, exclusions, quantities, specifications and responsibility for authority-driven changes.",
    };
  }
  if (angle === "Timeline and Process") {
    return {
      focus: "build a dependency-led programme from design release through procurement, authority actions, construction, testing and handover",
      ownerQuestion: "What must be approved, purchased, inspected or decided before this activity can genuinely start?",
      commercialWarning: "A short bar-chart duration is not a reliable programme when drawings, long-lead items and authority hold points sit outside the logic.",
      programmeAdvice: "Track decisions and information releases alongside physical progress; late information can be the critical path even when labour is available.",
      comparison: "Compare contractors by programme logic, procurement dates, inspection sequence and recovery method rather than completion date alone.",
    };
  }
  if (angle === "Contractor Selection") {
    return {
      focus: "test whether the proposed team understands the operating asset, drawing maturity, authority route and handover evidence",
      ownerQuestion: "What technical question did the bidder ask that changed or clarified the scope?",
      commercialWarning: "A polished submission is weak evidence if the proposal does not state assumptions, interfaces, exclusions and who controls revisions.",
      programmeAdvice: "Ask the bidder to explain the first 30 days, information needed from the client and the hold points that protect later work.",
      comparison: "Use a common comparison matrix for scope, technical approach, resources, reporting, safety, quality, programme and close-out.",
    };
  }
  return {
    focus: "translate the operating brief into coordinated civil, structural, MEP, fire-safety, logistics and handover decisions",
    ownerQuestion: "Which operating requirement would be expensive or impossible to correct after the structure and utilities are fixed?",
    commercialWarning: "Planning is incomplete when area and budget are known but loads, movement, utilities, approvals and future change are still assumptions.",
    programmeAdvice: "Release decisions in the order the site and procurement teams need them, with authority and inspection dependencies visible.",
    comparison: "Compare possible routes by buildability, operational fit, authority exposure, programme risk and whole-scope responsibility.",
  };
}

function warehouseEntityContext(keyword: string) {
  const name = keyword.toLowerCase();
  if (/floor|concrete|foundation|slab/.test(name)) {
    return "Civil engineering and structural engineering review should reconcile concrete performance, subgrade evidence, reinforcement, joints, rack reactions, wheel loads and quality-assurance hold points before each pour.";
  }
  if (/cold storage/.test(name)) {
    return "MEP engineering, building-envelope design, fire safety, drainage, electrical demand and commissioning must share one operating temperature and product-risk basis.";
  }
  if (/roof|steel|structural/.test(name)) {
    return "Structural engineering, steel fabrication, roof drainage, temporary stability, material procurement and construction supervision should work from a controlled penetration and load register.";
  }
  if (/fire|dcd|safety/.test(name)) {
    return "Building regulations, authority inspections, risk assessment, fire-safety engineering, approved drawings and quality-assurance records must describe the same storage and occupancy conditions.";
  }
  if (/mep|utility|dewa|electrical/.test(name)) {
    return "MEP engineering should connect the load schedule, service routes, authority approvals, testing, commissioning, maintenance access and as-built records instead of treating each system as a separate package.";
  }
  if (/loading|logistics|distribution|parking|road|infrastructure/.test(name)) {
    return "Civil engineering, infrastructure design, site logistics, pavement loading, drainage, pedestrian risk and RTA interfaces should be tested against real vehicle movements.";
  }
  if (/approval|compliance|municipality| dcd| dewa/.test(` ${name}`)) {
    return "Building permits, engineering drawings, authority inspections, building regulations, document control and the construction programme should be managed as one dependency chain.";
  }
  if (/fit-out|office/.test(name)) {
    return "Civil, MEP and fire-safety interfaces should be coordinated through engineering drawings, material submittals, inspection hold points and snag closure before concealed areas are handed over.";
  }
  if (/renovation|extension|expansion|maintenance/.test(name)) {
    return "Construction planning should combine condition surveys, structural engineering, MEP isolation, risk assessment, live-site logistics, quality assurance and recommissioning evidence.";
  }
  if (/factory|industrial building/.test(name)) {
    return "Civil engineering, structural engineering, MEP engineering and construction management should follow the production workflow, equipment loads, ventilation demand, maintenance access and future process change.";
  }
  return "Construction planning should connect civil engineering, structural engineering, MEP engineering, fire safety, site logistics, material procurement, authority inspections, quality assurance and handover evidence.";
}

function makeWarehouseBlogSections(
  topic: (typeof warehouseBlogTopics)[number],
  relatedPage: WarehouseAuthorityPage,
): BlogPost["sections"] {
  const lens = warehouseArticleLens(topic.angle);
  const checks = relatedPage.fieldChecks;
  const authorityText = relatedPage.authorityNotes.length
    ? relatedPage.authorityNotes
        .map((note) => note.match(/^(.+?) requirements\b/i)?.[1] ?? note.split(" ")[0])
        .join(", ")
    : "the relevant Dubai authorities";

  return [
    {
      id: "search-intent",
      title: `What ${topic.keyword} means for a ${topic.angle.toLowerCase()} review`,
      paragraphs: [
        `Someone researching ${topic.keyword.toLowerCase()} is usually trying to ${topic.intent}. The useful starting point is not a list of contractor claims; it is a decision brief that connects operations, drawings, site facts and the parties who can approve or change the work.`,
        `${relatedPage.engineeringOpinion} This is the controlling question for the topic because it influences design release, pricing assumptions and what the site team can safely build.`,
      ],
      bullets: [
        lens.ownerQuestion,
        `Record the intended use, operating constraints and current approval status for ${topic.keyword.toLowerCase()}.`,
        `Treat this warning as a design-review prompt: ${relatedPage.failureMode}`,
      ],
    },
    {
      id: "planning",
      title: `${topic.angle}: define the scope before it becomes a price`,
      paragraphs: [
        `For this ${topic.angle.toLowerCase()} review, the team should ${lens.focus}. That work turns an open enquiry into a package that designers, estimators and construction managers can challenge against the same facts.`,
        `${checks[0].description} ${checks[1].description} These checks should be recorded as decisions or open actions, not left as meeting-room assumptions.`,
      ],
      bullets: [
        "Identify the drawing revision and information used for each major assumption.",
        "Separate owner, consultant, contractor, supplier and authority responsibilities.",
        lens.commercialWarning,
      ],
    },
    {
      id: "authority-approvals",
      title: "Authority sequence and document ownership",
      paragraphs: [
        `${topic.keyword} may touch ${authorityText} together with a landlord, free-zone or master developer route. The exact sequence depends on location, intended use, appointed consultants and the status of existing approvals; no contractor should present a generic sequence as a guaranteed result.`,
        `Use a live register in which every NOC, drawing, comment, calculation, test or inspection item has an owner, due date, revision and effect on site work. ${lens.programmeAdvice}`,
      ],
      bullets: [
        "Confirm jurisdiction before preparing a submission list.",
        "Keep authority comments connected to affected drawings, procurement and site instructions.",
        "Compare the installed work with approved information before booking inspection.",
      ],
    },
    {
      id: "engineering",
      title: `Engineering interfaces that control ${topic.keyword.toLowerCase()}`,
      paragraphs: [
        `${checks[2].title} deserves an explicit coordination check: ${checks[2].description}`,
        `${checks[3].title} is equally important: ${checks[3].description} ${warehouseEntityContext(topic.keyword)} The value of the review lies in exposing consequences across disciplines, not in producing another unowned checklist.`,
      ],
      bullets: checks.map((check) => `${check.title}: ${check.description}`),
    },
    {
      id: "cost-timeline",
      title: `Cost and programme reasoning for the ${topic.angle.toLowerCase()} decision`,
      paragraphs: [
        `Cost changes when performance criteria, quantities, ground or existing conditions, utility demand, access, specialist systems and authority requirements change. For ${topic.keyword.toLowerCase()}, a useful estimate identifies those drivers and states where design information is still provisional.`,
        `Time is shaped by the same facts plus procurement lead times, decision speed, inspections and operational restrictions. Put each unresolved input on the programme with the activity it releases and the consequence of a late answer.`,
      ],
      bullets: [
        "Keep unresolved assumptions visible in both the price and programme.",
        "Do not release a long-lead item against a superseded drawing or untested performance basis.",
        "Assess the consequence of a late decision, not only the date on which it is due.",
      ],
    },
    {
      id: "contractor-selection",
      title: "How to challenge a contractor proposal",
      paragraphs: [
        `${lens.comparison} Ask the team to walk through one likely conflict for this scope and explain who would resolve it, what evidence would be produced and what activity would wait.`,
        `For ${topic.keyword.toLowerCase()}, the strongest response should acknowledge ${relatedPage.failureMode.toLowerCase()} A bidder who makes that risk visible is giving the client something more useful than a generic assurance.`,
      ],
      bullets: [
        "Reconcile every proposal against a common scope and drawing list.",
        "Review method, supervision, safety, quality records and handover responsibilities.",
        "Clarify how changes, comments and programme recovery will be communicated.",
      ],
    },
    {
      id: "service-areas",
      title: "Dubai location changes the delivery route",
      paragraphs: [
        "A warehouse in Dubai Investment Park, JAFZA, Dubai South, Jebel Ali, Al Quoz or Dubai Industrial City can face different master-developer conditions, access rules, utility interfaces and submission routes even when the physical scope appears similar.",
        "Emitronix also publishes enquiry coverage across Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Umm Al Quwain and Fujairah. The authority and appointment route must still be checked for the actual emirate and asset; Dubai guidance should not be copied into another jurisdiction without verification.",
      ],
    },
    {
      id: "emitronix-approach",
      title: "What a useful first technical meeting should produce",
      paragraphs: [
        `For ${topic.keyword.toLowerCase()}, the first meeting should produce a short statement of intended use, available drawings, authority status, priority decisions, missing evidence and the next owner for each action. It should not pretend that unresolved design can be priced or scheduled with certainty.`,
        `${companyName} uses that information to define a construction, coordination or approval-support route. Project-specific design, formal submissions and authority decisions remain with the correctly appointed parties.`,
      ],
    },
  ];
}

function makeWarehouseBlogFaqs(
  topic: (typeof warehouseBlogTopics)[number],
  relatedPage: WarehouseAuthorityPage,
): BlogPost["faqs"] {
  const lens = warehouseArticleLens(topic.angle);
  return [
    {
      question: `What should be decided first for ${topic.keyword.toLowerCase()}?`,
      answer: `Begin with ${relatedPage.fieldChecks[0].title.toLowerCase()}. Ask which record proves the current assumption, who owns the answer and which price, programme or site action must remain on hold until it is resolved.`,
    },
    {
      question: `What is the most useful ${topic.angle.toLowerCase()} question?`,
      answer: lens.ownerQuestion,
    },
    {
      question: `Which authorities may affect ${topic.keyword.toLowerCase()} in Dubai?`,
      answer: "The route can involve Dubai Municipality, DEWA, Dubai Civil Defence, Trakhees, DDA, JAFZA, Dubai South, RTA, a landlord or a master developer depending on location and use. Confirm jurisdiction before relying on a generic checklist.",
    },
    {
      question: "What information makes a contractor response more reliable?",
      answer: "Share the location, intended use, current drawings, authority status, operational loads, site constraints, target dates and known stakeholder responsibilities. Ask the bidder to label every remaining assumption.",
    },
    {
      question: "What failure mode should the project team discuss?",
      answer: relatedPage.failureMode,
    },
  ];
}

function warehouseEditorialFrame(
  topic: (typeof warehouseBlogTopics)[number],
  relatedPage: WarehouseAuthorityPage,
  index: number,
) {
  const subject = topic.keyword.toLowerCase();
  const variant = index % 5;
  const evidencePrompt = `${relatedPage.fieldChecks[0].title} is the first evidence test; unresolved inputs here should remain visible in the price, programme and responsibility schedule.`;
  const disclaimers = [
    `Use this as planning guidance, then verify the design, contract, authority route and site conditions with the professionals appointed to the actual project.`,
    `Project drawings, calculations, authority instructions and contract terms take precedence over this general UAE warehouse guidance.`,
    `The correct answer remains project-specific: confirm jurisdiction, professional appointments, approved information and existing site conditions before acting.`,
    `This review frames owner decisions; it does not replace engineering design, formal authority advice, a site survey or contractual assessment.`,
    `Treat the checks below as questions for the project team, not as a substitute for current authority requirements or appointed-professional instructions.`,
  ];

  if (topic.angle === "Approval Checklist") {
    const excerpts = [
      `An approval checklist for ${subject} should name the jurisdiction, formal submitter, drawing revision, NOCs and inspection evidence rather than list forms without owners.`,
      `Before ${subject} reaches an authority portal, reconcile the operating use, property record, consultant appointment, approved baseline and proposed work.`,
      `Approval risk in ${subject} usually appears where one comment changes drawings, procurement and site work but no single register connects them.`,
      `For ${subject}, the useful checklist is a dependency map showing what must be accepted before design release, procurement, construction or inspection.`,
      `A submission for ${subject} becomes reviewable when every drawing, NOC, calculation and response has a current revision and accountable owner.`,
    ];
    return {
      metaDescription: `Plan ${subject} approvals in Dubai with jurisdiction checks, document ownership, comment control, inspection readiness and close-out evidence.`,
      excerpt: excerpts[variant],
      intro: [
        `Submission readiness for ${subject} begins with a controlled record of the property, use, approved baseline, proposed change and appointed parties.`,
        `${evidencePrompt} That record controls which information can be released and which site activities must remain on hold.`,
        disclaimers[variant],
      ],
    };
  }

  if (topic.angle === "Cost Factors") {
    const excerpts = [
      `The cost of ${subject} is controlled by measurable quantities, performance criteria, interfaces and unresolved risk, not by floor area alone.`,
      `A useful estimate for ${subject} separates measured work from provisional allowances, exclusions and decisions that still depend on design or authority input.`,
      `Price comparisons for ${subject} fail when bidders assume different loads, specifications, external works, utility duties or handover obligations.`,
      `For ${subject}, the first commercial question is simple: which amount is supported by drawings and which amount rests on an untested assumption?`,
      `Budget certainty for ${subject} improves when operational requirements are translated into quantities, specifications and named interface responsibilities.`,
    ];
    return {
      metaDescription: `Understand ${subject} cost drivers in Dubai, including scope maturity, quantities, specifications, authority changes, exclusions and programme risk.`,
      excerpt: excerpts[variant],
      intro: [
        `Begin the cost review for ${subject} by separating measured work, provisional allowances, exclusions and authority- or design-dependent decisions.`,
        `${evidencePrompt} If the basis changes, revise the estimate and procurement plan instead of defending a historical total.`,
        disclaimers[variant],
      ],
    };
  }

  if (topic.angle === "Timeline and Process") {
    const excerpts = [
      `A credible programme for ${subject} connects design release, NOCs, long-lead procurement, access, inspections, testing and handover in dependency order.`,
      `The shortest stated duration for ${subject} is not necessarily the earliest achievable finish; first test what information and approvals sit outside the bar chart.`,
      `For ${subject}, progress should be measured against released information and closed hold points as well as labour and installed quantities.`,
      `Programme risk in ${subject} often begins with a late owner decision or drawing release that is invisible in a construction-only schedule.`,
      `The delivery sequence for ${subject} becomes useful when every start date has a defined predecessor, responsible party and required evidence.`,
    ];
    return {
      metaDescription: `Build a realistic Dubai programme for ${subject} across design, approvals, procurement, construction, testing and warehouse handover.`,
      excerpt: excerpts[variant],
      intro: [
        `Read the ${subject} programme as a chain of information, approval, procurement, access, construction and inspection dependencies rather than a list of dates.`,
        `${evidencePrompt} The schedule should show when the answer is needed and what downstream work it releases.`,
        disclaimers[variant],
      ],
    };
  }

  if (topic.angle === "Contractor Selection") {
    const excerpts = [
      `A proposal for ${subject} becomes credible when the bidder identifies missing information, cross-trade interfaces, exclusions and the evidence required at handover.`,
      `Select a team for ${subject} by testing its assumptions and method, not by ranking presentation quality or completion promises.`,
      `The most revealing contractor question on ${subject} is often the one that changes the brief, exposes a conflict or prevents a false price comparison.`,
      `For ${subject}, compare bidders on one scope matrix covering design inputs, authority duties, supervision, safety, quality, programme and close-out.`,
      `Contractor selection for ${subject} should establish who controls revisions, interfaces and inspections before commercial negotiation hides those gaps.`,
    ];
    return {
      metaDescription: `Compare contractors for ${subject} in Dubai using scope, assumptions, interfaces, programme logic, site controls and handover duties.`,
      excerpt: excerpts[variant],
      intro: [
        `Use the first contractor meeting for ${subject} to expose missing information and competing assumptions before comparing totals or promised completion dates.`,
        `${evidencePrompt} Ask each bidder to explain how that requirement changes its method, resources and exclusions.`,
        disclaimers[variant],
      ],
    };
  }

  const excerpts = [
    `Before ${subject} reaches tender, translate the operating brief into loads, movements, utilities, fire strategy, maintainability and future-change allowances.`,
    `Planning ${subject} starts with the warehouse operation; the building geometry and services should follow the goods, people, vehicles and equipment it must support.`,
    `The early decision in ${subject} is not a finish or a supplier. It is the performance basis that civil, structural, MEP and fire-safety teams will share.`,
    `For ${subject}, a short owner brief should state the use, loads, throughput, access, utility demand, authority status and evidence expected at handover.`,
    `Design risk in ${subject} grows when the operating team, consultant and contractor use different assumptions about storage, vehicles, equipment or future expansion.`,
  ];
  return {
    metaDescription: `Plan ${subject} in Dubai around operations, engineering interfaces, authority dependencies, procurement, site controls and handover evidence.`,
    excerpt: excerpts[variant],
    intro: [
      `The operating brief for ${subject} should state what moves through the asset, what loads it creates, which utilities it needs and how compliance will be demonstrated.`,
      `${evidencePrompt} Resolve it while options remain open; correction after structure or utilities are fixed is usually slower and more disruptive.`,
      disclaimers[variant],
    ],
  };
}

function makeBlogPost(topic: (typeof warehouseBlogTopics)[number], index: number): BlogPost {
  const indexingContent = warehouseBlogIndexingContent[topic.slug];
  const imageKey = blogImageKeys[index % blogImageKeys.length];
  const relatedPage = matchingWarehousePage(topic.keyword);
  const nextSlug = warehouseBlogTopics[index + 1]?.slug;
  const previousSlug = warehouseBlogTopics[index - 1]?.slug;
  const clusterPeer = warehouseBlogTopics.find(
    (item) => item.clusterIndex === topic.clusterIndex && item.slug !== topic.slug,
  )?.slug;
  const authorityHeavy = /approval|dewa|dcd|municipality/i.test(topic.keyword + topic.angle);
  const category = authorityHeavy ? "Dubai Authority Approvals" : "Warehouse Construction";
  const imagePath = blogImagePaths[imageKey as keyof typeof blogImagePaths];
  const imageAlt = blogImageAlts[imageKey as keyof typeof blogImageAlts];
  const editorial = warehouseEditorialFrame(topic, relatedPage, index);

  return {
    slug: topic.slug,
    title: topic.title,
    seoTitle: indexingContent?.seoTitle ?? clippedMetaTitle(`${topic.title} | Emitronix Dubai`),
    metaDescription: indexingContent?.metaDescription ?? clippedMetaDescription(editorial.metaDescription),
    excerpt: editorial.excerpt,
    category,
    categories: [
      "Warehouse Construction",
      "Civil Construction",
      "Project Management",
      authorityHeavy ? "Dubai Authority Approvals" : "Building Contracting",
    ],
    targetKeywords: [
      topic.keyword,
      "Warehouse Construction Dubai",
      "Warehouse Contractor Dubai",
      "Construction Company Dubai",
      "Civil Contractor Dubai",
      authorityHeavy ? "Authority Approvals Dubai" : "Industrial Contractor Dubai",
    ],
    generatedImage: imageKey,
    image: imagePath,
    imageAlt,
    imageTitle: topic.title,
    publishedDate: "2026-08-02",
    modifiedDate: indexingContent ? "2026-10-01" : reviewedDate,
    readTime: "10 min read",
    author: companyName,
    referenceCheckedDate: reviewedDate,
    references,
    popular: index < 8,
    featured: index < 4,
    intro: editorial.intro,
    sections: [
      ...makeWarehouseBlogSections(topic, relatedPage),
      ...(indexingContent?.sections ?? []),
    ],
    faqs: makeWarehouseBlogFaqs(topic, relatedPage),
    internalLinks: [
      { label: relatedPage.title, href: relatedPage.href },
      { label: "Warehouse Construction", href: "/warehouse-construction" },
      { label: "Civil Contracting", href: "/civil" },
      { label: "Authority Approvals", href: "/approval" },
      { label: "Design & Build", href: "/design-build" },
      { label: "Project Management", href: "/project-management" },
      { label: "Contact Emitronix", href: "/contact" },
    ],
    relatedSlugs: Array.from(
      new Set([previousSlug, nextSlug, clusterPeer, "warehouse-construction-dubai-planning-design-authority-approvals"].filter((value): value is string => Boolean(value))),
    ).filter((slug) => slug !== topic.slug),
  };
}

export const warehouseBlogPosts: BlogPost[] = warehouseBlogTopics.map(makeBlogPost);
