import { homeFaqs, services } from "@/data/site";

// The SEO team's supplied wording takes precedence over approximate length targets.
export const homeMetadata = {
  title: "Construction Company in Dubai | warehouse construction company in dubai",
  description:
    "Emitronix Contracting LLC is a leading construction company in Dubai providing building construction, civil contracting, warehouse construction, turnkey projects, and renovation services across the UAE.",
};

function serviceDescription(href: string) {
  return services.find((service) => service.href === href)!.description;
}

export const homeServices = [
  {
    title: "Civil Contracting",
    description: serviceDescription("/civil"),
    href: "/civil",
  },
  {
    title: "Warehouse Construction",
    description: serviceDescription("/warehouse-construction"),
    href: "/warehouse-construction",
  },
  {
    title: "Turnkey Construction",
    description: serviceDescription("/turnkey-construction"),
    href: "/turnkey-construction",
  },
  {
    title: "Building Approval Services",
    description:
      "Dubai Municipality, DDA and Trakhees approval coordination, with the submission route and appointed responsibilities confirmed for your project.",
    href: "/approval",
  },
  {
    title: "Renovation & Fit-Out",
    description:
      "Civil renovation, upgrades and interior fit-out for villas, offices, retail spaces, commercial and industrial buildings.",
    href: "/interior",
  },
];

export const homeReasons = [
  {
    title: "Experienced Project Team",
    description:
      "Civil, structural, fit-out and MEP interfaces are considered together, with clear responsibilities for owners, consultants and site teams.",
  },
  {
    title: "Quality-Focused Execution",
    description:
      "Drawings, material decisions and inspection hold points guide site work. Snag closure and completion records are planned from the beginning.",
  },
  {
    title: "Timely Project Delivery",
    description:
      "Project planning connects procurement, authority dependencies and site activities to an agreed schedule, with decisions and responsibilities kept visible.",
  },
  {
    title: "Commercial & Industrial Expertise",
    description:
      "Construction planning considers tenant interfaces, vehicle access, slab demands, utilities and operational requirements for each asset type.",
  },
];

export const homeIndustries = [
  {
    title: "Warehousing & Logistics",
    description: serviceDescription("/warehouse-construction"),
    href: "/warehouse-construction",
  },
  {
    title: "Commercial Buildings",
    description: serviceDescription("/commercial-buildings"),
    href: "/commercial-buildings",
  },
  {
    title: "Industrial Facilities",
    description: serviceDescription("/industrial-buildings"),
    href: "/industrial-buildings",
  },
  {
    title: "Retail & Business Spaces",
    description:
      "Interior fit-out for offices, showrooms and retail spaces, with landlord, MEP and handover requirements considered during planning.",
    href: "/interior",
  },
];

export const homeProcess = [
  {
    title: "Consultation",
    description:
      "Understand your project requirements, scope and objectives. Review the location, asset type, drawings, timeline, site status and intended authority route.",
  },
  {
    title: "Planning",
    description:
      "Develop the project approach, planning and coordination. Define scope boundaries across civil works, fit-out, approvals, MEP interfaces and handover responsibilities.",
  },
  {
    title: "Construction",
    description:
      "Execute the project according to the agreed scope and requirements. Coordinate site decisions, procurement and inspections with owners, consultants and project stakeholders.",
  },
  {
    title: "Project Completion",
    description:
      "Complete the required works and hand over the project. Review inspection readiness, snag closure and completion documentation against the agreed responsibilities.",
  },
];

// Retain the existing Home page's detailed, useful owner guidance.
export const ownerDecisionBriefs = [
  {
    title: "Warehouse operations should shape the structure",
    observation: "Rack reactions, forklift wheel loads, dock occupation, turning space and fire strategy can change the structural grid, slab and external works. A warehouse brief that states only area and clear height leaves the expensive decisions unresolved.",
    action: "Record the goods profile, storage system, design vehicle, utility demand and expansion intent before freezing the civil brief.",
    href: "/warehouse-construction",
  },
  {
    title: "Villa renovation starts with discovery",
    observation: "Existing drawings may not show later alterations, concealed services or the true condition of waterproofing and structure. Finishes selected before targeted surveys can lock the owner into avoidable redesign.",
    action: "Inspect high-consequence areas, define opening-up needs and separate confirmed facts from assumptions before demolition and procurement.",
    href: "/building-renovation",
  },
  {
    title: "Authority comments are programme events",
    observation: "A DM, DCD, DEWA, Trakhees or DDA comment can affect drawings, equipment, material orders, inspection dates and work already planned on site. Treating it as an isolated email hides the real delay path.",
    action: "Assign every comment to an owner and affected document, then connect the response date to procurement and construction activities.",
    href: "/approval",
  },
  {
    title: "Fit-out handover is decided above the ceiling",
    observation: "Fire stopping, access panels, dampers, detectors, drainage, power and supports converge in concealed zones. Closing those areas without a coordinated inspection creates rework when testing begins.",
    action: "Use a ceiling close-up hold point that checks approved drawings, access, photographs, tests and outstanding snags before closure.",
    href: "/interior",
  },
];

function existingAnswer(question: string) {
  return homeFaqs.find((faq) => faq.question === question)!.answer;
}

export const homepageFaqs = [
  {
    question: "What construction services does Emitronix provide in Dubai?",
    answer:
      "Emitronix provides civil contracting, building construction, warehouse construction, turnkey construction, villa construction, renovation and interior fit-out, alongside Dubai authority approval coordination. The scope and required appointments are confirmed for each project.",
  },
  {
    question: "What types of construction projects does Emitronix handle?",
    answer: existingAnswer("What type of construction projects does Emitronix handle in Dubai?"),
  },
  {
    question: "Does Emitronix provide warehouse construction in Dubai?",
    answer:
      "Yes. Warehouse construction covers logistics, storage, light industrial and operational facilities. Planning considers civil works, loading and access, floor performance, fire-safety requirements, utility coordination and handover readiness.",
  },
  {
    question: "Does Emitronix provide turnkey construction solutions?",
    answer:
      "Yes. Turnkey construction can bring planning, procurement, civil works, fit-out coordination, authority visibility and handover into one delivery pathway. The agreed scope defines exclusions, consultant responsibilities and completion requirements.",
  },
  {
    question: "Does Emitronix provide civil contracting services in Dubai?",
    answer:
      "Yes. Civil contracting covers G+4 buildings, villas, warehouses, commercial and industrial developments in Dubai and the UAE. Drawings, site conditions, structural interfaces and approval requirements inform the proposed scope.",
  },
  {
    question: "Does Emitronix assist with Dubai authority approvals?",
    answer: existingAnswer("Can Emitronix support Dubai authority approvals?"),
  },
  {
    question: "Which Dubai authority approvals can Emitronix assist with?",
    answer:
      "Authority coordination enquiries can involve Dubai Municipality, Dubai Development Authority (DDA), Trakhees, DEWA, Dubai Civil Defence and RTA. The applicable route depends on the property's jurisdiction, intended use and proposed works; the authority retains the approval decision.",
  },
  {
    question: "Can Emitronix provide a project estimate and timeline?",
    answer:
      "Share your project location, scope, drawings, site condition and target completion date to request an estimate and proposed timeline. The review identifies missing information, approval dependencies and procurement requirements before pricing and programme assumptions are confirmed.",
  },
  {
    question: "Does Emitronix provide commercial fit-out and renovation services?",
    answer:
      `${existingAnswer("Does Emitronix provide interior fit-out services?")} Renovation enquiries also cover civil modifications and upgrades to existing buildings.`,
  },
  {
    question: "How can I request a construction quotation from Emitronix?",
    answer: existingAnswer("How can I request a construction quote in Dubai?"),
  },
  ...homeFaqs.filter((faq) => [
    "Does Emitronix support MEP contracting coordination in Dubai?",
    "Can Emitronix help with villa renovation approvals in Dubai?",
    "Do warehouse fit-out projects need authority approvals in Dubai?",
  ].includes(faq.question)),
];
