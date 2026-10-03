import { InternalPageFrame } from "@/components/InternalPageFrame";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Factory,
  FileCheck2,
  Gauge,
  HardHat,
  Home,
  Landmark,
  Layers3,
  MessageCircle,
  PhoneCall,
  PlugZap,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Warehouse,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { ContentReviewRecord } from "@/components/ContentReviewRecord";
import { ContactForm } from "@/components/ContactForm";
import { SectionPhotograph } from "@/components/SectionPhotograph";
import { PhotoAttribution } from "@/components/PhotoAttribution";
import { getGeneratedImage } from "@/data/generatedImages";
import { dewaSupportingImages, type InternalServiceImage } from "@/data/internalServiceImages";
import { getInternalServiceImage, getSectionPhotographs, getUniquePhotoAttribution } from "@/data/pagePhotography";
import { applySeoOverrides, createPageMetadata } from "@/data/seo";
import { absoluteUrl, site, whatsappUrl } from "@/data/site";
import { trustContentLastReviewedIso, trustContentLastReviewedLabel } from "@/data/trustCenter";

const pagePath = "/dewa-approvals";
const pageUrl = absoluteUrl(pagePath);
const socialImageAsset = getGeneratedImage("approvals.dewa-approval-electrical-coordination-dubai");
const heroImageAsset = getInternalServiceImage(pagePath);
const heroImageAttribution = getUniquePhotoAttribution(heroImageAsset);
const inspectionImageAsset = dewaSupportingImages.inspection;
const cableImageAsset = dewaSupportingImages.cables;
const heroImage = heroImageAsset.src;
const inspectionImage = inspectionImageAsset.src;
const cableImage = cableImageAsset.src;
const sectionPhotographs = getSectionPhotographs(pagePath, 2, [heroImage, inspectionImage, cableImage]);
const videoThumbnail = socialImageAsset.desktop.src;
const videoUrl = "/videos/dewa-approval-dubai-workflow.mp4";
const phoneHref = site.phoneHref;

const dewaKeywords = [
  "DEWA approval Dubai",
  "DEWA NOC Dubai",
  "DEWA new connection Dubai",
  "DEWA additional load Dubai",
  "DEWA LV approval Dubai",
  "DEWA HV approval Dubai",
  "DEWA electrical inspection",
  "DEWA warehouse power approval",
  "authority approvals Dubai",
];

export async function generateMetadata(): Promise<Metadata> {
  return applySeoOverrides(
    createPageMetadata({
      title: "DEWA Approval Coordination Guide Dubai",
      description:
        "A practical DEWA coordination guide for Dubai projects covering connections, load changes, documents, consultant roles, inspections and authority limitations.",
      path: pagePath,
      keywords: dewaKeywords,
      image: socialImageAsset.og!.src,
      imageAlt: socialImageAsset.alt,
    }),
    pagePath,
  );
}

type MiniCard = {
  title: string;
  description: string;
  icon?: LucideIcon;
  items?: string[];
  href?: string;
  cta?: string;
};

type ProcessStep = {
  title: string;
  description: string;
  ownerFocus: string;
};

type FaqItem = {
  category: string;
  question: string;
  answer: string;
};

const anchorLinks = [
  { href: "#answers", label: "Fast Answers" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#documents", label: "Documents" },
  { href: "#inspection", label: "Inspection" },
  { href: "#industries", label: "Industries" },
  { href: "#mistakes", label: "Mistakes" },
  { href: "#faq", label: "Practical FAQs" },
  { href: "#contact", label: "Contact" },
];

const directAnswers: MiniCard[] = [
  {
    title: "What is DEWA approval?",
    description:
      "DEWA approval is the authority process used in Dubai to review electricity-related project requirements such as Building NOC - Electricity, design approval, connection estimates, LV inspection, HV inspection where applicable, and final release steps for power supply.",
    icon: BadgeCheck,
  },
  {
    title: "Who needs DEWA approval in Dubai?",
    description:
      "Owners, tenants, developers, consultants and contractors may need DEWA approval for villas, warehouses, factories, retail units, hotels, schools, clinics, offices, data centres, substations, additional load, fit-out power and temporary or permanent electricity connections.",
    icon: Users,
  },
  {
    title: "Who can submit DEWA applications?",
    description:
      "Several DEWA builder services are submitted by enrolled consultants or contractors through DEWA digital channels or integrated Dubai systems. The properly appointed submitter and current enrollment requirements must be confirmed for each project route.",
    icon: FileCheck2,
  },
  {
    title: "How long does DEWA approval take?",
    description:
      "Simple review milestones can be fast when the file is complete, but total duration depends on load, drawings, authority route, site readiness, comments, payment, inspections, substation requirements and utility interfaces. The practical target is fewer resubmissions, not only a fast first upload.",
    icon: Clock,
  },
  {
    title: "How much does DEWA approval cost?",
    description:
      "Some DEWA e-services list free registration or submission fees, but project cost can still include DEWA estimates, connection charges, consultant work, contractor scope, testing, equipment, cable works, substations, shutdowns and rectification. A real cost answer requires drawings and load details.",
    icon: Gauge,
  },
  {
    title: "What is the difference between LV and HV approval?",
    description:
      "LV approval usually relates to low-voltage design, metering, MDB, SMDB, DB, wiring layouts and site inspection. HV approval applies when the project requires high-voltage supply, substation location, transformer interfaces, HV cables, protection coordination and HV inspection milestones.",
    icon: Zap,
  },
];

const serviceClusters: MiniCard[] = [
  {
    title: "DEWA New Connection",
    description:
      "New electricity connections need early load calculation, authority path confirmation, design package preparation, site layout coordination and inspection planning. The team should confirm whether the request belongs through DEWA channels, Dubai Building Permit System integration, landlord or master developer coordination, or a consultant-led route before preparing the file.",
    icon: PlugZap,
    items: ["Connected load and maximum demand review", "MDB, SMDB, DB and metering coordination", "Permanent supply readiness"],
  },
  {
    title: "Additional Load Approval",
    description:
      "Additional load is common when a warehouse adds machines, a restaurant adds kitchen equipment, a data room expands cooling, or an industrial unit changes production. The approval route depends on existing sanctioned load, spare capacity, transformer and cable limits, main switchgear rating, landlord NOC, existing drawings and whether upgrades are needed before DEWA will accept the revised demand.",
    icon: Gauge,
    items: ["Existing load review", "New equipment demand schedule", "Upgrade and inspection planning"],
  },
  {
    title: "Load Reduction",
    description:
      "Load reduction can be needed when a tenant downsizes operations, separates units, reduces power demand, changes equipment or wants the electrical record to match the real operating condition. The file still needs a clear technical basis, updated schedules, safe isolation of redundant circuits where required and coordination with owner, landlord, consultant and DEWA service records.",
    icon: Ruler,
    items: ["Revised load schedule", "Meter and panel impact", "Authority record alignment"],
  },
  {
    title: "LV Design Approval",
    description:
      "LV design approval focuses on low-voltage distribution: single line diagrams, load schedules, cable sizing, voltage drop, short-circuit assumptions, MDB and SMDB arrangements, earthing, metering, electrical room layout, wiring layouts and drawing format. Small errors in the LV package can trigger comments even when the site work is technically sound.",
    icon: ClipboardCheck,
    items: ["Single line diagram review", "Load distribution schedule", "Electrical room and panel layout"],
  },
  {
    title: "HV Approval and Substation Coordination",
    description:
      "HV approval becomes important when the project requires high-voltage supply, dedicated transformer capacity, package substation, compact substation, pocket substation, HV cable route, protection coordination or substation readiness inspection. These projects need more careful sequencing because civil rooms, access, ventilation, equipment delivery, cable trenching and energization planning affect the authority path.",
    icon: Layers3,
    items: ["HV substation location support", "Transformer and cable route coordination", "HV inspection readiness"],
  },
  {
    title: "Electrical Design Approval",
    description:
      "Electrical design approval is not just a drawing upload. Connected load, maximum demand, distribution architecture, metering, life safety interfaces, earthing, containment, equipment locations, room dimensions and authority comments must tell one consistent story.",
    icon: FileCheck2,
    items: ["Design package gap review", "Drawing consistency checks", "Comment response coordination"],
  },
  {
    title: "Electrical Inspection",
    description:
      "DEWA inspection readiness depends on safe, complete and accessible electrical installation. The site should not wait until the inspector arrives to discover missing labels, incomplete panels, poor housekeeping, wrong meter location, inaccessible electrical rooms, incomplete containment, unsupported cables, missing test results or unclosed consultant comments.",
    icon: Search,
    items: ["LV inspection preparation", "Snag prevention", "Inspection evidence tracking"],
  },
  {
    title: "Testing and Commissioning",
    description:
      "Testing and commissioning support covers pre-energization checks, continuity, insulation resistance, earthing, functional verification, panel readiness, load balancing, equipment documentation and test record organization. For commercial and industrial facilities, testing must be coordinated with operations so energization, shutdowns and handover do not create avoidable downtime.",
    icon: Wrench,
    items: ["Pre-commissioning checklist", "Test record collection", "Handover evidence"],
  },
  {
    title: "Temporary Power Supply",
    description:
      "Temporary power may be needed for construction, fit-out, site offices, testing or phased handover. The risk is treating temporary supply as informal. It still needs safe load assessment, temporary distribution, protection, site access, cabling, metering requirements where applicable, landlord coordination and clear removal or conversion planning.",
    icon: HardHat,
    items: ["Construction power planning", "Temporary DB and cable routing", "Removal or conversion plan"],
  },
  {
    title: "Permanent Power Connection",
    description:
      "Permanent power connection is the milestone most owners care about, but it only succeeds when earlier steps are controlled. Approved design, paid estimates where applicable, completed installation, inspection readiness, corrected snags, testing records, room access, labeling, metering and authority communication all need to converge before final release.",
    icon: ShieldCheck,
    items: ["Handover sequence", "Final inspection closure", "Supply release coordination"],
  },
  {
    title: "Transformer Installation",
    description:
      "Transformer installation requires coordination between load requirements, substation type, equipment procurement, civil base, access, ventilation, earthing, fire and life safety interfaces, cable entry, testing and authority inspections. Any Emitronix role in this specialist scope requires project-specific capability and responsibility confirmation.",
    icon: Factory,
    items: ["Transformer room readiness", "Cable and earthing interfaces", "Inspection and testing coordination"],
  },
  {
    title: "Transformer Relocation",
    description:
      "Transformer relocation affects existing supply, shutdown planning, cable diversion, civil works, stakeholder approvals, equipment protection and risk to live operations. It should be planned as a utility-change project, not a simple movement of equipment. The method statement, sequence, temporary supply and restoration plan must be technically defensible.",
    icon: CalendarCheck,
    items: ["Shutdown and diversion planning", "Civil and MEP coordination", "Restoration strategy"],
  },
  {
    title: "Package, Pocket and Compact Substations",
    description:
      "Substation selection depends on available space, project demand, access, maintainability, authority requirements, ventilation, equipment size and connection strategy. Package substations, pocket substations and compact substations each introduce different coordination issues for civil builders, electrical contractors, consultants and facility operators.",
    icon: Building2,
    items: ["Space and access checks", "Substation arrangement review", "Civil base and cable entry planning"],
  },
  {
    title: "HV and LV Cable Works",
    description:
      "Cable works need route surveys, trench or duct bank coordination, protection, crossing checks, existing utility awareness, cable pulling plans, termination readiness, testing and reinstatement. In areas such as DIP, JAFZA, Dubai South, Dubai Industrial City and Jebel Ali, utility coordination and authority NOCs can be as important as the physical installation.",
    icon: Ruler,
    items: ["Cable route planning", "Utility crossing awareness", "Testing and reinstatement records"],
  },
  {
    title: "Utility Coordination and DEWA NOC",
    description:
      "DEWA NOC and utility coordination are essential when construction may affect existing electricity or water assets, proposed service corridors, road works, excavation, building connections or master-plan interfaces. A good NOC package reduces ambiguity by clearly showing scope, route, plot, existing services, proposed works and stakeholder responsibilities.",
    icon: Landmark,
    items: ["NOC package preparation", "Utility interface mapping", "Authority comment follow-up"],
  },
  {
    title: "Shutdown Planning",
    description:
      "Shutdowns affect tenants, factories, warehouses, retail operations, hotels, clinics and data rooms. Planning needs stakeholder notices, risk assessment, method statement, switching responsibility, manpower, materials, backup power, night work permissions where applicable and a rollback plan if the work cannot be completed inside the approved window.",
    icon: Clock,
    items: ["Shutdown window planning", "Risk and rollback control", "Operational stakeholder communication"],
  },
  {
    title: "Authority Coordination",
    description:
      "DEWA approval can intersect with building-permit, fire-and-life-safety, free-zone, landlord and master-developer requirements. The project team should manage those dependencies as one workflow so the electricity route is not isolated from other approvals or completion evidence.",
    icon: Users,
    items: ["Consultant and authority alignment", "Landlord NOCs", "Integrated close-out tracking"],
  },
  {
    title: "Project Completion and Handover",
    description:
      "Completion requires evidence. Drawings, approvals, inspection results, test records, as-built updates, equipment documents, access arrangements, snag closure and client handover files must be organized before the final week. This is where many projects lose time because the approval trail was not maintained during construction.",
    icon: BadgeCheck,
    items: ["As-built and close-out files", "Inspection result tracking", "Client handover coordination"],
  },
];

const processSteps: ProcessStep[] = [
  {
    title: "1. Project intake and authority route check",
    description:
      "Start with the project location, asset type, landlord or master developer, current approval status, intended use, existing load, required load, drawings, site photos and target date. The first decision is whether the work is a new connection, fit-out connection, NOC, additional load, network modification, LV inspection, HV route or completion-support enquiry.",
    ownerFocus: "Avoid choosing the wrong submission path before documents are ready.",
  },
  {
    title: "2. Load and scope definition",
    description:
      "The electrical story must be clear: connected load, maximum demand, number of meters, major equipment, diversity assumptions, future expansion, temporary loads and operational criticality. This is especially important for factories, warehouses, cold storage, commercial kitchens, hotels, hospitals, schools and data centres.",
    ownerFocus: "Make the requested power defensible before design comments begin.",
  },
  {
    title: "3. Drawing and document gap review",
    description:
      "Check whether the available package supports the intended authority request. Typical gaps include missing single line diagrams, inconsistent load schedules, incomplete wiring layouts, unclear electrical room dimensions, absent landlord NOC, old approvals not linked to the current design, or DWF/PDF format issues.",
    ownerFocus: "Reduce rejection risk caused by incomplete or inconsistent files.",
  },
  {
    title: "4. Consultant, contractor and owner alignment",
    description:
      "DEWA approval needs clear responsibility. The owner may need to sign supply terms, the consultant may need to issue or revise design drawings, the enrolled contractor may need to submit, the landlord may need to provide NOC, and the site team must prepare physical readiness for inspection.",
    ownerFocus: "Know who must act before the application stalls.",
  },
  {
    title: "5. Submission package preparation",
    description:
      "The package is organized around the specific service requirement: Building NOC - Electricity, Getting Electricity Permits & Connections, fit-out connection, additional load, LV inspection, HV substation approval, cable route, utility NOC or network modification. Every uploaded file should have a purpose.",
    ownerFocus: "Build a submission that is easy for reviewers to understand.",
  },
  {
    title: "6. Authority submission and application tracking",
    description:
      "Once submitted through the relevant digital route, the application reference, comments, technical discussion history, returned items, invoices and approval updates must be tracked. A lost comment cycle can cost more time than the original engineering work.",
    ownerFocus: "Keep the application visible until a decision is issued.",
  },
  {
    title: "7. Comment response and revision control",
    description:
      "When comments arrive, the response should answer the technical issue directly. Drawings, schedules, site arrangements and letters must be updated consistently so one correction does not create a new contradiction elsewhere in the file.",
    ownerFocus: "Close comments with evidence, not vague explanations.",
  },
  {
    title: "8. Site readiness and pre-inspection checks",
    description:
      "Before LV or HV inspection, the site should be checked for access, housekeeping, panel completion, labels, cable dressing, earthing, meter locations, room dimensions, ventilation, safety barriers, test results and consultant sign-off. Pre-inspection saves repeat visits.",
    ownerFocus: "Find snags before the authority inspection does.",
  },
  {
    title: "9. Inspection attendance and snag closure",
    description:
      "Inspection results must be documented and acted on quickly. If a snag list is issued, the rectification sequence, materials, manpower, revised photographs and resubmission package should be controlled as a close-out task, not treated as informal site conversation.",
    ownerFocus: "Turn inspection comments into a managed close-out list.",
  },
  {
    title: "10. Testing, commissioning and energization support",
    description:
      "Energization requires technical readiness and operational readiness. The appointed project parties should align test records, equipment condition, switching sequence, shutdown planning, client operations, safety checks and final evidence before the project moves from approval to usable power.",
    ownerFocus: "Connect paperwork, inspection and real electrical operation.",
  },
  {
    title: "11. Completion records and handover file",
    description:
      "A professional handover file should include approved drawings, inspection outcomes, test records, equipment documents, as-built updates, warranty information where applicable and authority correspondence. This protects the owner during future additional load, fit-out or maintenance work.",
    ownerFocus: "Leave the next approval easier than the first one.",
  },
  {
    title: "12. Post-approval support",
    description:
      "After power is released, operational teams may still need load monitoring, tenant coordination, panel labeling updates, preventive maintenance planning, expansion advice or support for future authority requests. Good DEWA coordination creates a cleaner electrical asset record.",
    ownerFocus: "Turn approval work into long-term facility control.",
  },
];

const documentGroups: MiniCard[] = [
  {
    title: "Core owner and project documents",
    description:
      "Prepare owner or tenant authorization, trade license, plot or tenancy details, Ejari where applicable, title deed or lease documents, project reference, consultant appointment, contractor details and previous authority approvals. Free zone or master developer locations may need extra landlord or zone-specific documents.",
    icon: FileCheck2,
  },
  {
    title: "Load and electrical schedules",
    description:
      "DEWA-related packages commonly need total connected load, maximum demand, MDB and SMDB schedules, final DB load distribution, number of kWh meters, equipment loads, diversity assumptions and comparison between existing and proposed demand. For additional load, the gap between sanctioned load and new demand must be clear.",
    icon: Gauge,
  },
  {
    title: "Drawings and layouts",
    description:
      "Typical drawings include single line diagram, site setting layout, ground floor plan, electrical room layout, LV room dimensions, MDB, SMDB, DB and meter locations, wiring layouts for lighting and power, substation details where applicable, cable routes and related architectural or MEP coordination drawings.",
    icon: Ruler,
  },
  {
    title: "Format and upload readiness",
    description:
      "DEWA services may specify file formats such as PDF, DWF, XLS or DOC depending on the document type and service. A technically correct drawing can still be delayed if uploaded in the wrong format, labeled poorly, missing a required template or inconsistent with the application data.",
    icon: ClipboardCheck,
  },
  {
    title: "Fit-out connection documents",
    description:
      "Fit-out connection requests often need the main project reference, DEWA approved TCL or MD schedule, MDB and SMDB schedule, load distribution schedule, lighting and power wiring layouts, and landlord NOC in the prescribed format. Premises with existing meters and free zone premises can follow different routes.",
    icon: Wrench,
  },
  {
    title: "Inspection and site readiness evidence",
    description:
      "Inspection submissions may require site photos, completed installation evidence, test reports, panel labels, electrical room readiness, consultant confirmations, equipment documents and rectification evidence if a previous inspection produced snags.",
    icon: Search,
  },
  {
    title: "Substation and HV documents",
    description:
      "HV or substation-related projects may need substation location and size information, access details, civil drawings, transformer arrangement, cable route, earthing details, protection coordination inputs, equipment documents, ventilation considerations and readiness evidence for HV inspection.",
    icon: Layers3,
  },
  {
    title: "NOCs and stakeholder letters",
    description:
      "Many projects need NOCs or coordination letters from landlord, master developer, free zone, consultant, building management, adjacent utility stakeholders or authority systems. Missing NOCs are a common reason a technically good application cannot move forward.",
    icon: Landmark,
  },
];

const timelineRows = [
  {
    phase: "Initial assessment",
    typical: "1-3 working days after receiving usable documents",
    note: "Project location, load, service type, authority route and missing documents are identified.",
  },
  {
    phase: "Document and design coordination",
    typical: "3 working days to several weeks",
    note: "Depends on drawing maturity, consultant response, landlord NOC, equipment data and number of revisions.",
  },
  {
    phase: "DEWA design review milestones",
    typical: "Can be fast when complete, with public DEWA pages listing LV design review service times by load band",
    note: "Actual project duration also includes preparation, comments and stakeholder response time.",
  },
  {
    phase: "Connection estimate and payment",
    typical: "Project-specific",
    note: "Some public DEWA pages list service registration as free, but estimates or connection costs may still apply based on project requirements.",
  },
  {
    phase: "LV inspection",
    typical: "Often quick after proper submission, but site readiness controls success",
    note: "Panels, wiring, labels, rooms, test records and access must be ready before inspection request.",
  },
  {
    phase: "HV or substation milestone",
    typical: "Longer than simple LV work",
    note: "Civil works, equipment delivery, cable route, transformer readiness and authority inspections affect duration.",
  },
  {
    phase: "Snag closure and resubmission",
    typical: "Same day to several weeks",
    note: "Depends on snag type, material availability, shutdown needs and consultant or authority comments.",
  },
  {
    phase: "Final energization and handover",
    typical: "Project-specific",
    note: "Requires inspection closure, testing records, stakeholder approvals, safe access and operational coordination.",
  },
];

const engineeringTopics: MiniCard[] = [
  {
    title: "Load calculation discipline",
    description:
      "Connected load and maximum demand should be calculated from real equipment, tenant operations and future growth, not guessed from a generic area rate. Motors, HVAC, compressors, chillers, kitchen equipment, manufacturing lines, lifts, EV chargers and data racks each affect demand differently.",
    icon: Gauge,
  },
  {
    title: "Single line diagram quality",
    description:
      "A single line diagram should show the electrical system clearly: source, transformer if applicable, main panels, sub panels, protection, metering, cable sizes, ratings, earthing and load distribution. It should match the schedules and physical layout.",
    icon: FileCheck2,
  },
  {
    title: "Electrical room planning",
    description:
      "Electrical rooms need access, safe working clearance, ventilation, panel arrangement, cable entry, meter placement, fire and life safety coordination and maintainability. Approval delays often begin when the electrical room is drawn as leftover space instead of critical infrastructure.",
    icon: Building2,
  },
  {
    title: "Cable sizing and route control",
    description:
      "Cable selection must consider current carrying capacity, voltage drop, installation method, derating, route length, protection, segregation, support and termination. Cable routes also need coordination with civil works, ceilings, trenches, ducts and existing utilities.",
    icon: Ruler,
  },
  {
    title: "Earthing and safety",
    description:
      "Earthing, bonding, protection coordination and safe isolation practices are central to approval and long-term operation. These details must be reflected in design, installation and test records instead of handled as last-minute site adjustments.",
    icon: ShieldCheck,
  },
  {
    title: "Future expansion planning",
    description:
      "Factories, warehouses, retail kitchens and data centres often expand after handover. The approval file should not overstate demand, but it should consider realistic future loads, spare ways, space for panels and cable route flexibility where the project brief requires growth.",
    icon: Sparkles,
  },
];

const inspectionTopics: MiniCard[] = [
  {
    title: "Before LV inspection",
    description:
      "Confirm approved drawings, completed installation, clean electrical rooms, safe access, panel labeling, meter positions, wiring completion, cable dressing, containment, earthing, test reports, as-built changes and consultant comments. Do not request inspection because the deadline is close; request it because the site is ready.",
    icon: ClipboardCheck,
  },
  {
    title: "During inspection",
    description:
      "The inspection team should have authorized site access, drawings, responsible personnel, test records, safe working conditions and immediate answers for basic technical questions. Missing keys, blocked rooms and absent project representatives can waste an inspection slot.",
    icon: Search,
  },
  {
    title: "After inspection",
    description:
      "If approved, the project moves to the next authority or energization step. If snags are issued, each item should be assigned, rectified, photographed where useful, checked against the approved drawing and resubmitted with a clean record.",
    icon: BadgeCheck,
  },
];

const industryCards: MiniCard[] = [
  {
    title: "Warehouses and logistics facilities",
    description:
      "Warehouses in DIP, JAFZA, Dubai South, Al Quoz, Dubai Industrial City and Jebel Ali often need power for racking systems, dock equipment, lighting, fire systems, offices, HVAC, cold rooms and tenant machinery. Additional load, fit-out connections and DCD coordination are common.",
    icon: Warehouse,
  },
  {
    title: "Factories and manufacturing plants",
    description:
      "Factories need careful load definition for motors, compressors, production lines, cranes, process equipment, chillers and shift operations. DEWA approval is only one part of a wider industrial power strategy that may include substations, HV/LV cable works and shutdown planning.",
    icon: Factory,
  },
  {
    title: "Commercial buildings and offices",
    description:
      "Commercial buildings in Business Bay, Dubai Marina, Dubai Silicon Oasis and mainland Dubai often need fit-out connections, meter coordination, tenant load checks, landlord NOC, electrical room access and final inspection support before occupancy or handover.",
    icon: Building2,
  },
  {
    title: "Villas and residential projects",
    description:
      "Villa projects may need new connection, temporary construction power, permanent supply, additional load for pools or EV chargers, authority coordination, final inspection and handover evidence. The approval route should be aligned with the building permit and completion sequence.",
    icon: Home,
  },
  {
    title: "Retail, restaurants and showrooms",
    description:
      "Retail and food-service spaces can have high loads from HVAC, ovens, refrigeration, signage, lighting and kitchen equipment. Fit-out connection planning must coordinate landlord NOC, load schedule, wiring layout, DCD comments and opening date pressure.",
    icon: Landmark,
  },
  {
    title: "Hotels and serviced apartments",
    description:
      "Hotels need power reliability for guest rooms, kitchens, laundry, lifts, life safety systems, cooling and back-of-house operations. Shutdowns, phased handover and testing require careful planning because operational disruption is expensive.",
    icon: Building2,
  },
  {
    title: "Hospitals, clinics and healthcare",
    description:
      "Healthcare projects need stronger attention to critical loads, backup power interfaces, medical equipment, life safety systems, inspection sequencing and documentation. Approval coordination must respect operational risk and regulatory interfaces.",
    icon: ShieldCheck,
  },
  {
    title: "Schools and government buildings",
    description:
      "Schools and government buildings require disciplined planning around safety, schedules, accessibility, authority coordination and handover evidence. Works may need to be phased around term dates, public access and stakeholder review cycles.",
    icon: Users,
  },
  {
    title: "Data centres and server rooms",
    description:
      "Data centres and server rooms demand careful maximum demand review, redundancy thinking, cooling loads, UPS interfaces, generator coordination, cable management, shutdown planning and staged commissioning. A weak load narrative can compromise both approval and resilience.",
    icon: PlugZap,
  },
];

const commonMistakes: MiniCard[] = [
  {
    title: "Submitting before the electrical story is consistent",
    description:
      "If the load schedule, single line diagram, wiring layout, panel arrangement and application data do not match, the reviewer must ask questions. Consistency is the cheapest approval accelerator.",
    icon: FileCheck2,
  },
  {
    title: "Ignoring landlord or master developer NOC",
    description:
      "Many free zone, mall, tower, warehouse and industrial park projects cannot move without owner, landlord or master developer clearance. Technical design does not replace stakeholder permission.",
    icon: Landmark,
  },
  {
    title: "Requesting inspection before site readiness",
    description:
      "Inspection requests made to satisfy a deadline often create repeat visits. Complete the rooms, panels, labels, wiring, access, tests and documentation before scheduling.",
    icon: Search,
  },
  {
    title: "Treating additional load as a small admin change",
    description:
      "Additional load may require panel upgrades, cable capacity checks, transformer review, NOCs, revised design and physical installation changes. Underestimating it creates cost and timeline shock.",
    icon: Gauge,
  },
  {
    title: "Separating DEWA work from DCD and building approvals",
    description:
      "Electrical rooms, fire systems, generators, cable routes and occupancy use can affect multiple authorities. Power approval should be coordinated with the full approval map.",
    icon: Layers3,
  },
  {
    title: "Not preserving approval history",
    description:
      "Future tenants, buyers and facility managers need the old approvals, test records, as-built drawings and correspondence. Losing the record makes every future DEWA request harder.",
    icon: ClipboardCheck,
  },
];

const sampleScenarios: MiniCard[] = [
  {
    title: "Warehouse tenant needs additional load before moving machinery",
    description:
      "The practical route begins with existing sanctioned load, new machinery schedule, landlord NOC, panel and cable capacity, revised load distribution and inspection plan. The commercial risk is signing equipment delivery dates before confirming whether the power infrastructure can accept the load.",
    icon: Warehouse,
  },
  {
    title: "Factory requires transformer and substation coordination",
    description:
      "A high-demand industrial project may need transformer sizing, package substation location, civil base, cable trench, ventilation, access, HV inspection and shutdown coordination. The approval path must be tied to procurement and civil readiness because a substation is not an isolated document.",
    icon: Factory,
  },
  {
    title: "Retail fit-out has an opening date and landlord comments",
    description:
      "The sequence should connect landlord NOC, fit-out drawings, lighting and power layouts, load schedule, DCD comments, DEWA fit-out connection route, inspection readiness and snag closure. A missing document can be more damaging than a minor site delay.",
    icon: Landmark,
  },
  {
    title: "Villa needs permanent power after construction",
    description:
      "The completion path should confirm approved design, meter location, MDB readiness, wiring completion, test records, inspection evidence and handover documents. Temporary construction power should not be allowed to drift into an unclear final supply condition.",
    icon: Home,
  },
];

const relatedServices = [
  { title: "Authority Approvals Dubai", href: "/approval", description: "All Dubai approval coordination services." },
  { title: "Dubai Municipality Approval", href: "/dubai-municipality-approval", description: "Building permit and DM coordination." },
  { title: "DCD Approvals", href: "/dcd-approvals", description: "Fire and life safety approval support." },
  { title: "Warehouse Construction", href: "/warehouse-construction", description: "Warehouse works that often require electrical approval planning." },
  { title: "Industrial Buildings", href: "/industrial-buildings", description: "Power-aware construction for industrial facilities." },
  { title: "Commercial Buildings", href: "/commercial-buildings", description: "Commercial project delivery with authority coordination." },
  { title: "Villa Construction", href: "/villa-construction", description: "Villa construction and completion support." },
  { title: "Contact Emitronix", href: "/contact", description: "Request assessment, site visit or callback." },
];

const officialResources = [
  {
    title: "DEWA Getting Electricity Permits & Connections",
    href: "https://www.dewa.gov.ae/en/builder/electricity-network-services/getting-electricity-connection",
    description:
      "Official DEWA builder service page for electricity permits, connections, Building NOC - Electricity, design approval, estimates and inspection journey information.",
  },
  {
    title: "DEWA Getting Electricity Fit-Out Connections",
    href: "https://www.dewa.gov.ae/en/builder/electricity-network-services/getting-electricity-fit-out-connections",
    description:
      "Official DEWA service page for fit-out connection applications, main project reference, landlord NOC, wiring layouts, LV inspection and online-only submission guidance.",
  },
  {
    title: "DEWA Al Namoos",
    href: "https://www.dewa.gov.ae/en/builder/electricity-network-services/al-namoos",
    description:
      "Official DEWA page describing Al Namoos for contractor electricity connections, including the public service positioning for projects up to 150 kW.",
  },
  {
    title: "DEWA Electricity Network Modification",
    href: "https://www.dewa.gov.ae/en/builder/electricity-network-services/electricity-network-modification",
    description:
      "Official DEWA resource for electricity network modification service information where existing network assets or route changes are involved.",
  },
  {
    title: "DEWA Builder FAQ and Tutorials",
    href: "https://www.dewa.gov.ae/en/builder/useful-tools/builder-faq",
    description:
      "Official DEWA builder support area for FAQs, tutorials and service guidance. Always check official DEWA pages for the latest requirements before submission.",
  },
];

const dewaFaqs: FaqItem[] = [
  {
    category: "Top Questions",
    question: "Who is the best DEWA approval contractor in Dubai?",
    answer:
      "There is no responsible universal ranking. Compare candidates on enrolled-role eligibility, the appointed consultant's duties, load and route understanding, civil readiness, inspection evidence and close-out responsibilities. For a new connection, additional load, LV inspection, substation interface, warehouse supply or fit-out, verify exactly who may submit and who owns each technical deliverable before appointment.",
  },
  {
    category: "Top Questions",
    question: "How do I get DEWA approval in Dubai?",
    answer:
      "Start by identifying the exact service: Building NOC - Electricity, Getting Electricity Permits & Connections, fit-out connection, additional load, LV inspection, HV inspection, network modification or utility NOC. Then prepare owner details, project reference, load schedules, drawings, NOCs and site readiness evidence. Many builder services require an enrolled consultant or contractor to submit through DEWA digital channels or integrated authority systems.",
  },
  {
    category: "Top Questions",
    question: "How much does DEWA approval cost in Dubai?",
    answer:
      "There is no single price because DEWA approval cost can include authority estimates, connection charges, consultant drawings, contractor works, panel upgrades, cable works, testing, substation works, shutdowns and snag rectification. Some DEWA e-service registrations are listed as free, but the total project cost depends on load, infrastructure, site condition and scope.",
  },
  {
    category: "Top Questions",
    question: "How long does DEWA approval take?",
    answer:
      "A complete application can move quickly through some DEWA review milestones, but the total project timeline depends on document quality, load size, authority route, consultant revisions, landlord NOC, estimate payment, inspection readiness, HV requirements and snag closure. A practical Dubai project should plan the approval as a workflow, not a single upload date.",
  },
  {
    category: "Top Questions",
    question: "Can Emitronix increase electrical load in Dubai?",
    answer:
      "Emitronix can support additional load coordination by reviewing existing and proposed load, identifying likely document gaps, coordinating drawings, organizing site readiness and aligning contractor, consultant, owner and landlord responsibilities. Final submission route and approval requirements depend on DEWA service rules and the project stakeholders.",
  },
  {
    category: "Top Questions",
    question: "Who handles transformer approvals in Dubai?",
    answer:
      "Transformer-related work can involve the owner, appointed consultant, appropriately enrolled contractor, DEWA process, civil and electrical contractors, and equipment supplier. Put design, plinth or room readiness, access, cable routes, protection interfaces, test records and authority actions on one responsibility schedule; the permitted submitter and installer must match the live project route.",
  },
  {
    category: "Top Questions",
    question: "What documents are required for DEWA approval?",
    answer:
      "Common documents include owner or tenant details, trade license, project or plot details, consultant and contractor information, NOCs, single line diagram, load schedules, MDB/SMDB/DB schedules, wiring layouts, electrical room layouts, site plans, substation details where applicable and inspection readiness photos or test records. The exact list changes by service and project type.",
  },
  {
    category: "Top Questions",
    question: "How do warehouse DEWA approvals work?",
    answer:
      "Warehouse DEWA approval starts with the intended use: storage, cold storage, logistics, workshop, manufacturing, kitchen, office or mixed-use. The power requirement is then matched with existing sanctioned load, additional load needs, landlord NOC, DEWA route, DCD interface, panel capacity, cabling and inspection readiness.",
  },
  {
    category: "Top Questions",
    question: "How does LV approval differ from HV approval?",
    answer:
      "LV approval usually focuses on low-voltage design, metering, panels, wiring layouts, load schedules and LV inspection. HV approval applies when high-voltage supply, transformer capacity, substation location, HV cable routing or HV inspection is required. HV projects have more civil, equipment, safety and shutdown coordination risk.",
  },
  {
    category: "Top Questions",
    question: "Can I apply for DEWA approval manually?",
    answer:
      "DEWA builder services are generally handled through digital channels, and some services state online-only submission. Depending on the project, the route may be DEWA website, Dubai Building Permit System integration, Build in Dubai App or another authority-linked channel. Manual assumptions should be avoided unless confirmed by DEWA for the specific case.",
  },
  {
    category: "New Connection",
    question: "What is a DEWA new connection?",
    answer:
      "A DEWA new connection is the process of obtaining electricity supply for a new project, new premises or newly completed facility. It typically involves design approval, connection estimate, site readiness, LV inspection, HV inspection where applicable and final supply release.",
  },
  {
    category: "New Connection",
    question: "What is Getting Electricity Permits & Connections?",
    answer:
      "DEWA describes this builder service as a single application route that can bundle Building NOC - Electricity and Getting Electricity Connections. The goal is to move from application verification to approved Building NOC - Electricity, design approval and estimated invoice when the submission is successful.",
  },
  {
    category: "New Connection",
    question: "Do Dubai Municipality projects apply through DEWA directly?",
    answer:
      "For projects licensed under Dubai Municipality authority, DEWA public guidance indicates that applications may be processed through Dubai Building Permit System integration, with inspection requests still raised upon site readiness. Other authority areas and free zones may use DEWA channels or their own linked processes.",
  },
  {
    category: "New Connection",
    question: "What is Al Namoos for DEWA electricity connection?",
    answer:
      "Al Namoos is a DEWA contractor-focused electricity connection service. DEWA public information describes it as supporting electricity connections in two steps within five days for projects up to 150 kW, subject to the service conditions and complete requirements.",
  },
  {
    category: "New Connection",
    question: "Can a tenant request a new DEWA electricity connection?",
    answer:
      "A tenant can initiate the need, but the submission path usually requires correct owner or landlord permissions, project details, consultant or contractor involvement and DEWA service eligibility. Tenants should not assume they can bypass landlord NOC, master developer controls or enrolled submission requirements.",
  },
  {
    category: "New Connection",
    question: "What is permanent power connection?",
    answer:
      "Permanent power connection is the final utility supply arrangement for a completed project or premises. It requires approved design, completed installation, inspection closure, payment or estimate steps where applicable, metering readiness and safe energization coordination.",
  },
  {
    category: "New Connection",
    question: "What is temporary power supply?",
    answer:
      "Temporary power supply supports construction, fit-out, testing or staged works before permanent supply is available. It still needs proper load planning, safe distribution, protection, site access, metering consideration and a clear removal or conversion plan.",
  },
  {
    category: "New Connection",
    question: "Can temporary power become permanent power?",
    answer:
      "Temporary power should not be treated as permanent by default. The permanent connection normally needs its own approval, inspection and handover route. Any conversion must be planned with the consultant, contractor, owner, landlord and DEWA requirements.",
  },
  {
    category: "New Connection",
    question: "What happens after the DEWA connection estimate is issued?",
    answer:
      "The project owner or responsible party must review the estimate, arrange payment through approved channels where applicable, keep the application status tracked, complete required site works and proceed toward inspection and final supply release.",
  },
  {
    category: "New Connection",
    question: "How do I avoid delays in a new connection application?",
    answer:
      "Confirm the authority route early, use complete drawings, match application data with load schedules, secure required NOCs, prepare the site before inspection and track comments quickly. Most delays are caused by missing documents, inconsistent design or premature inspection requests.",
  },
  {
    category: "Additional Load",
    question: "What is DEWA additional load approval?",
    answer:
      "Additional load approval is required when a facility needs more electrical capacity than the existing sanctioned or approved load. It may involve revised schedules, design updates, landlord NOC, panel capacity checks, cable upgrades, transformer review, inspection and DEWA approval.",
  },
  {
    category: "Additional Load",
    question: "Who needs additional load in Dubai?",
    answer:
      "Warehouses, factories, restaurants, retail units, offices, clinics, hotels, villas and data rooms may need additional load when they add equipment, expand HVAC, install EV chargers, upgrade machinery, add kitchens, introduce cold storage or change operations.",
  },
  {
    category: "Additional Load",
    question: "Can I install new machines before additional load approval?",
    answer:
      "Installing machines before confirming additional load approval is risky. The existing electrical infrastructure may not support the demand, and the project may need design revisions, panel upgrades, cables, transformer capacity or inspections before safe operation.",
  },
  {
    category: "Additional Load",
    question: "What documents are needed for additional load?",
    answer:
      "Typical documents include existing approved load records, proposed load schedule, equipment list, revised single line diagram, panel schedules, wiring or power layouts, landlord NOC, site photos, consultant details and any existing DEWA approval references.",
  },
  {
    category: "Additional Load",
    question: "Does additional load always need a transformer?",
    answer:
      "No. Some additional load requests can be handled within existing infrastructure, while others may require panel upgrades, cable upgrades, transformer capacity, substation work or network modification. The answer depends on existing supply and proposed demand.",
  },
  {
    category: "Additional Load",
    question: "What is load reduction approval?",
    answer:
      "Load reduction approval aligns the official electrical demand record with a reduced operating requirement. It can apply when tenants downsize, equipment is removed, units are split, business activity changes or the owner wants records and infrastructure to match actual use.",
  },
  {
    category: "Additional Load",
    question: "Can load reduction reduce bills?",
    answer:
      "Load reduction may affect demand-related arrangements depending on the account and tariff context, but it should not be treated as a guaranteed bill-saving step without reviewing DEWA account conditions, metering and the facility's actual consumption profile.",
  },
  {
    category: "Additional Load",
    question: "What if DEWA rejects additional load?",
    answer:
      "The rejection reason must be reviewed technically. Common responses include revising load schedules, correcting drawings, adding missing NOCs, upgrading panels or cables, clarifying existing capacity, changing equipment assumptions or addressing authority comments through a revised submission.",
  },
  {
    category: "LV and HV",
    question: "What is DEWA LV approval?",
    answer:
      "DEWA LV approval relates to low-voltage design and installation requirements such as LV distribution, MDB, SMDB, DB schedules, metering, wiring layouts, electrical room layout and LV inspection readiness.",
  },
  {
    category: "LV and HV",
    question: "What is DEWA HV approval?",
    answer:
      "DEWA HV approval applies when a project needs high-voltage supply, substation location approval, transformer installation, HV cable routing, protection interfaces or HV inspection. It is common in high-load industrial, commercial or infrastructure projects.",
  },
  {
    category: "LV and HV",
    question: "When does a project need HV supply?",
    answer:
      "A project may need HV supply when its demand exceeds what can be practically served through available LV infrastructure, when a dedicated transformer or substation is required, or when DEWA and the consultant determine that HV connection is the correct supply route.",
  },
  {
    category: "LV and HV",
    question: "What is an LV room?",
    answer:
      "An LV room is a dedicated electrical room for low-voltage panels, metering and distribution equipment. Its size, access, ventilation, clearances, cable entry, panel arrangement and maintainability affect approval and inspection readiness.",
  },
  {
    category: "LV and HV",
    question: "What is an MDB?",
    answer:
      "MDB means Main Distribution Board. It is the main low-voltage distribution panel that receives supply and distributes power to sub-main distribution boards, distribution boards or major loads. MDB schedules must align with drawings and load calculations.",
  },
  {
    category: "LV and HV",
    question: "What is an SMDB?",
    answer:
      "SMDB means Sub Main Distribution Board. It feeds downstream distribution boards or load groups. SMDB ratings, cable sizes and schedules should match the single line diagram and the actual installed electrical system.",
  },
  {
    category: "LV and HV",
    question: "What is a DB in DEWA approval documents?",
    answer:
      "DB means Distribution Board. Final DB load distribution schedules, circuit arrangements and wiring layouts help show how power is distributed to lighting, sockets, equipment and other final loads.",
  },
  {
    category: "LV and HV",
    question: "What is a kWh meter location?",
    answer:
      "The kWh meter location is where electricity consumption is measured. Meter accessibility, arrangement, space, labeling and relationship to MDB or SMDB distribution should be clear in drawings and site installation.",
  },
  {
    category: "LV and HV",
    question: "Does LV inspection happen before supply release?",
    answer:
      "Yes, LV inspection is normally part of the completion path before supply release for relevant projects. The site must be ready, safe and consistent with approved drawings before inspection request.",
  },
  {
    category: "LV and HV",
    question: "Can HV and LV inspections both be required?",
    answer:
      "Yes. Projects with substations, transformers or HV infrastructure can require HV inspection in addition to LV inspection. The exact sequence depends on DEWA requirements, substation readiness, site condition and project type.",
  },
  {
    category: "Substations",
    question: "What is a package substation?",
    answer:
      "A package substation is a compact, factory-built substation arrangement that typically integrates transformer and switchgear equipment within a packaged enclosure. Approval coordination must address location, access, ventilation, civil base, cable entry and safety interfaces.",
  },
  {
    category: "Substations",
    question: "What is a compact substation?",
    answer:
      "A compact substation is a space-efficient substation solution used where power demand and site constraints require a smaller footprint. The project still needs proper access, civil preparation, ventilation, cable routing and inspection readiness.",
  },
  {
    category: "Substations",
    question: "What is a pocket substation?",
    answer:
      "A pocket substation is a compact substation arrangement used in constrained areas. It requires careful coordination because limited space makes access, cable entry, maintenance clearance and safety planning especially important.",
  },
  {
    category: "Substations",
    question: "Who approves substation location?",
    answer:
      "Substation location approval involves DEWA requirements, consultant design, owner constraints, civil layout, access, ventilation, equipment dimensions and authority comments. The location should be resolved early because late movement affects drawings, civil works and cable routes.",
  },
  {
    category: "Substations",
    question: "Can a transformer be relocated?",
    answer:
      "Transformer relocation is possible only with proper technical planning, authority coordination, shutdown strategy, cable diversion, civil preparation, safety controls and stakeholder approval. It should be treated as a high-risk utility change, not a simple site shift.",
  },
  {
    category: "Substations",
    question: "What documents are needed for transformer installation?",
    answer:
      "Documents may include load justification, substation layout, transformer details, civil base drawings, cable route, earthing details, equipment data, access plan, consultant drawings, test records and inspection readiness evidence. Requirements vary by project.",
  },
  {
    category: "Substations",
    question: "How long does transformer approval take?",
    answer:
      "Transformer approval duration depends on design readiness, DEWA comments, substation location, equipment procurement, civil works, cable route, HV inspection and site readiness. The authority milestone may be short, but the project sequence can be longer.",
  },
  {
    category: "Substations",
    question: "Does every factory need a transformer?",
    answer:
      "No. A factory needs a transformer only when the load and supply arrangement require it. Smaller factories may use available LV supply, while larger manufacturing plants may need dedicated transformer capacity or HV infrastructure.",
  },
  {
    category: "Cables and Utility NOC",
    question: "What are HV cable works?",
    answer:
      "HV cable works involve high-voltage cable routing, trenching or ducts, pulling, jointing, terminations, protection, testing and coordination with substations or transformers. They require careful safety, utility and authority planning.",
  },
  {
    category: "Cables and Utility NOC",
    question: "What are LV cable works?",
    answer:
      "LV cable works involve low-voltage power cable installation between source, panels and loads. They include sizing, containment, trench or tray route, termination, protection, testing, labeling and coordination with building services.",
  },
  {
    category: "Cables and Utility NOC",
    question: "When do I need a DEWA NOC?",
    answer:
      "A DEWA NOC may be needed when proposed works may affect existing or planned DEWA assets, utility corridors, excavation zones, road works, building connections or network modifications. The exact NOC requirement depends on location and scope.",
  },
  {
    category: "Cables and Utility NOC",
    question: "What causes cable route approval delays?",
    answer:
      "Delays often come from unclear route drawings, existing utility conflicts, missing NOCs, incomplete survey information, unsafe excavation plans, changes in civil layout, stakeholder comments or failure to coordinate with master developer requirements.",
  },
  {
    category: "Cables and Utility NOC",
    question: "Can cable works be done at night?",
    answer:
      "Night work may be possible when approved by relevant stakeholders and safe to execute, but it depends on authority permissions, landlord rules, noise restrictions, shutdown window, site lighting, supervision and method statement approval.",
  },
  {
    category: "Cables and Utility NOC",
    question: "What is utility coordination?",
    answer:
      "Utility coordination is the process of aligning proposed electrical works with existing and planned utilities, authority requirements, master developer rules, access constraints and construction sequencing. It reduces clashes and protects live services.",
  },
  {
    category: "Cables and Utility NOC",
    question: "What is electricity network modification?",
    answer:
      "Electricity network modification involves changes to existing electricity network assets or service arrangements. It may be needed for diversions, relocations, new connections, development works or site constraints that affect DEWA infrastructure.",
  },
  {
    category: "Cables and Utility NOC",
    question: "What should be included in a DEWA NOC package?",
    answer:
      "A NOC package should clearly show project location, scope, existing utilities, proposed works, drawings, routes, method statement if required, stakeholder details, previous approvals and any authority or landlord correspondence.",
  },
  {
    category: "Documents",
    question: "What is a single line diagram?",
    answer:
      "A single line diagram is a simplified electrical drawing showing the power distribution path, main equipment, ratings, protection, cables, meters and load connections. It is one of the most important documents for design review and inspection.",
  },
  {
    category: "Documents",
    question: "What is a load schedule?",
    answer:
      "A load schedule lists electrical loads, connected load, demand assumptions, panel distribution and often meter or DB-level allocation. It helps DEWA and the project team understand the requested supply and distribution system.",
  },
  {
    category: "Documents",
    question: "What is maximum demand?",
    answer:
      "Maximum demand is the expected highest practical electrical demand after applying realistic operating assumptions. It is different from simply adding every connected load as if all equipment runs at full rating at the same time.",
  },
  {
    category: "Documents",
    question: "What is connected load?",
    answer:
      "Connected load is the total rating of electrical equipment connected to the system. It provides a base for design, but maximum demand and diversity assumptions help determine the realistic supply requirement.",
  },
  {
    category: "Documents",
    question: "Why do DEWA documents use DWF format?",
    answer:
      "Some DEWA drawing submissions require DWF format because it supports controlled drawing review and markup workflows. Always check the latest service page because acceptable file formats differ by document type and service.",
  },
  {
    category: "Documents",
    question: "Can I submit PDF drawings only?",
    answer:
      "Not always. Some documents may be accepted as PDF, while specific drawings may require DWF or another format. Submitting the wrong format can delay an otherwise complete technical package.",
  },
  {
    category: "Documents",
    question: "Do I need site photos for DEWA approval?",
    answer:
      "Site photos are commonly needed for inspection submissions or readiness evidence. They help demonstrate installed condition, electrical rooms, panels, cable routes, access and rectified snags when the service requires visual proof.",
  },
  {
    category: "Documents",
    question: "Do I need landlord NOC for DEWA fit-out connection?",
    answer:
      "Landlord NOC is commonly required for fit-out connection and tenant work, especially in malls, towers, warehouses, free zones and managed communities. The NOC should match the service requirement and project scope.",
  },
  {
    category: "Documents",
    question: "What if my old drawings are missing?",
    answer:
      "Missing old drawings create risk. The site may need survey, existing panel verification, load checks, as-built preparation and consultant review before a reliable DEWA submission can be prepared.",
  },
  {
    category: "Documents",
    question: "Can Emitronix review my DEWA comments?",
    answer:
      "Yes. Emitronix can review authority comments, identify technical and documentation gaps, coordinate with consultants and help build a practical response plan tied to drawings and site readiness.",
  },
  {
    category: "Inspection",
    question: "What is DEWA LV inspection?",
    answer:
      "DEWA LV inspection checks whether the low-voltage electrical installation is ready, safe and aligned with approved drawings and requirements. Panels, wiring, labels, metering, rooms, access and test evidence must be ready.",
  },
  {
    category: "Inspection",
    question: "What happens if DEWA inspection fails?",
    answer:
      "If inspection fails, a snag list or inspection notice identifies issues to rectify. The team must correct the snags, gather evidence, update documents if required and resubmit the inspection request.",
  },
  {
    category: "Inspection",
    question: "How do I prepare for DEWA inspection?",
    answer:
      "Prepare approved drawings, completed installation, safe access, panel labels, clean rooms, meter arrangement, test records, consultant sign-off, site photos and responsible staff. A pre-inspection checklist is strongly recommended.",
  },
  {
    category: "Inspection",
    question: "Can inspection be requested before work is complete?",
    answer:
      "It should not be requested before the relevant work is complete. Premature requests increase the chance of rejection, repeat inspection, delayed supply release and wasted coordination time.",
  },
  {
    category: "Inspection",
    question: "Who should attend a DEWA inspection?",
    answer:
      "The responsible contractor or consultant representative, site engineer, electrician and authorized access holder should be available. The right people depend on the service, site rules and authority requirement.",
  },
  {
    category: "Inspection",
    question: "What are common LV inspection snags?",
    answer:
      "Common snags include missing labels, incomplete wiring, poor cable dressing, inaccessible panels, incorrect meter location, incomplete electrical room, missing test reports, mismatch with approved drawings and housekeeping issues.",
  },
  {
    category: "Inspection",
    question: "Can inspection results be issued on the same day?",
    answer:
      "Some DEWA service information indicates inspection results can be issued quickly, but practical timing depends on submission route, service type, site condition and authority process. The safer focus is complete readiness.",
  },
  {
    category: "Inspection",
    question: "What is HV inspection?",
    answer:
      "HV inspection checks high-voltage or substation-related readiness such as equipment installation, civil room readiness, cable works, safety arrangements, access and required test or documentation evidence.",
  },
  {
    category: "Testing",
    question: "What testing is needed before DEWA approval?",
    answer:
      "Testing may include insulation resistance, continuity, earthing checks, functional checks, panel verification, cable tests, protection settings and other commissioning records depending on project type, voltage level and equipment.",
  },
  {
    category: "Testing",
    question: "What is testing and commissioning?",
    answer:
      "Testing and commissioning verifies that electrical systems are installed, connected, protected, labeled and functioning safely before energization and handover. It produces records that support inspection and long-term maintenance.",
  },
  {
    category: "Testing",
    question: "Why are test reports important?",
    answer:
      "Test reports prove that the installation was checked against technical requirements. They support authority inspection, client handover, defect control and future troubleshooting.",
  },
  {
    category: "Testing",
    question: "Does DEWA approval include commissioning?",
    answer:
      "DEWA approval and commissioning are related but not identical. Authority approval confirms required stages, while commissioning verifies the installed system performance and readiness. A professional handover needs both authority closure and technical records.",
  },
  {
    category: "Testing",
    question: "What is pre-energization check?",
    answer:
      "A pre-energization check confirms that panels, cables, protection, earthing, labeling, access, test results and safety arrangements are ready before the system is energized. It reduces safety and operational risk.",
  },
  {
    category: "Industries",
    question: "Do warehouses in JAFZA need DEWA approval?",
    answer:
      "Warehouses in JAFZA can require DEWA-related power approval, utility coordination, landlord or free zone NOC and authority-specific routes depending on scope. The project should be checked against JAFZA, landlord and DEWA requirements.",
  },
  {
    category: "Industries",
    question: "Do factories in Dubai Industrial City need additional load approval?",
    answer:
      "Factories in Dubai Industrial City may need additional load approval when equipment, production lines, HVAC or process loads exceed existing approved capacity. The route depends on current supply, landlord or zone controls and DEWA requirements.",
  },
  {
    category: "Industries",
    question: "Can Emitronix support DEWA approval in DIP?",
    answer:
      "Dubai Investment Park enquiries can include warehouse supply, industrial-load review, fit-out connections, cable routes, civil readiness and inspection records. Confirm the plot or unit, existing service, proposed load, landlord or developer conditions, consultant appointment and applicable DEWA process before defining the coordination scope.",
  },
  {
    category: "Industries",
    question: "Do restaurants need DEWA load approval?",
    answer:
      "Restaurants often need load review because kitchens, refrigeration, HVAC, exhaust systems and lighting can increase demand. If proposed load exceeds approved capacity, additional load or fit-out connection coordination may be required.",
  },
  {
    category: "Industries",
    question: "Do data centres need special DEWA coordination?",
    answer:
      "Yes. Data centres and server rooms need careful coordination for critical load, redundancy, cooling, UPS systems, generators, cable management, shutdowns and staged commissioning. The approval package must clearly explain demand and infrastructure.",
  },
  {
    category: "Industries",
    question: "Do villas need DEWA approval?",
    answer:
      "Villas can need DEWA approval for new connection, temporary construction power, permanent power, additional load, EV chargers, pool equipment, extensions or completion. The route depends on building permit status and electrical scope.",
  },
  {
    category: "Industries",
    question: "Do hotels need shutdown planning for DEWA work?",
    answer:
      "Hotels often need careful shutdown planning because guest operations, kitchens, lifts, life safety systems and back-of-house services are affected. Work should be scheduled with backup plans, stakeholder notices and safe switching procedures.",
  },
  {
    category: "Industries",
    question: "Do hospitals need special power approval planning?",
    answer:
      "Healthcare projects need stronger planning around critical loads, backup systems, safety, infection control areas, medical equipment and operational continuity. Authority coordination should be tied to risk management, not only document upload.",
  },
  {
    category: "Local Areas",
    question: "Do Dubai South projects follow the same DEWA process?",
    answer:
      "Dubai South projects may involve DEWA, Dubai South authority, landlord or master developer requirements. The technical requirements can be similar, but the submission route and NOCs must be verified for the exact plot or premises.",
  },
  {
    category: "Local Areas",
    question: "Do Al Quoz warehouses need landlord NOC?",
    answer:
      "Many Al Quoz warehouse and industrial units need landlord or owner NOC for electrical modifications, fit-out works or additional load. The NOC requirement depends on tenancy, property control and project scope.",
  },
  {
    category: "Local Areas",
    question: "Can Emitronix support DEWA approvals in Business Bay?",
    answer:
      "Yes. Business Bay offices, retail units and commercial spaces may need fit-out connection, load review, landlord NOC, electrical inspection readiness and authority coordination. Emitronix can support the practical approval workflow.",
  },
  {
    category: "Local Areas",
    question: "Can Emitronix support DEWA approvals in Dubai Marina?",
    answer:
      "Yes. Dubai Marina projects often involve tower management, landlord NOC, fit-out approvals, load review and inspection constraints. Emitronix can help coordinate the technical and stakeholder requirements.",
  },
  {
    category: "Local Areas",
    question: "Can Emitronix support DEWA approvals in Dubai Silicon Oasis?",
    answer:
      "Yes. Dubai Silicon Oasis commercial, technology, warehouse and office projects can need DEWA-related coordination, authority NOCs, fit-out connection support, inspection readiness and load review.",
  },
  {
    category: "Cost and Timing",
    question: "Is DEWA application registration free?",
    answer:
      "Some official DEWA builder service pages list service registration or e-service fees as free. That does not mean the full project is free, because connection estimates, contractor scope, consultant work, equipment, testing and upgrades may still cost money.",
  },
  {
    category: "Cost and Timing",
    question: "Why do DEWA approval quotations vary so much?",
    answer:
      "Quotations vary because scopes differ. A document review is not the same as panel upgrades, cable works, substation coordination, shutdown work, testing, inspection attendance or full design and authority management.",
  },
  {
    category: "Cost and Timing",
    question: "Can I get a fixed DEWA approval price without drawings?",
    answer:
      "A reliable fixed price is difficult without drawings, load information, authority status, site photos, landlord requirements and inspection condition. A preliminary assessment can identify likely cost drivers first.",
  },
  {
    category: "Cost and Timing",
    question: "What delays DEWA approval the most?",
    answer:
      "The biggest delays are incomplete documents, wrong authority route, missing landlord NOC, inconsistent load schedules, poor drawing format, site not ready for inspection, unresolved consultant comments and late discovery of capacity upgrades.",
  },
  {
    category: "Cost and Timing",
    question: "Can DEWA approval be expedited?",
    answer:
      "The best way to move faster is to submit complete, consistent documents and prepare the site before inspection. Some DEWA initiatives support faster service for eligible cases, but incomplete files and site snags cannot be solved by urgency alone.",
  },
  {
    category: "Cost and Timing",
    question: "What is the fastest DEWA approval path?",
    answer:
      "The fastest path is the correct path with complete documents, correct submitter, aligned consultant, available NOCs, accurate load data, no drawing contradictions and inspection-ready installation. The route depends on project type and authority jurisdiction.",
  },
  {
    category: "Cost and Timing",
    question: "Does approval time change by load size?",
    answer:
      "Yes. Larger loads typically require more review, design coordination, infrastructure checks, possible transformer or substation work and more inspection planning. Small loads can move faster when eligible and complete.",
  },
  {
    category: "Cost and Timing",
    question: "How soon should I start DEWA approval planning?",
    answer:
      "Start during design, not after installation. For warehouses, factories, hotels, data centres and large commercial spaces, DEWA planning should begin before equipment orders, civil rooms, cable routes and opening dates are finalized.",
  },
  {
    category: "Authority Coordination",
    question: "How does DEWA approval connect with Dubai Municipality approval?",
    answer:
      "Dubai Municipality building permit workflows can integrate with DEWA for relevant projects. Electrical room layouts, building use, drawings and completion steps may affect both authorities, so the approval plan should be coordinated early.",
  },
  {
    category: "Authority Coordination",
    question: "How does DEWA approval connect with DCD approval?",
    answer:
      "DEWA and DCD can intersect through electrical rooms, fire pumps, emergency systems, generators, cable routes, life safety loads and occupancy use. A change made for one authority should be checked against the other.",
  },
  {
    category: "Authority Coordination",
    question: "Do free zone projects need different coordination?",
    answer:
      "Yes. JAFZA, Dubai South, Trakhees-regulated areas and other free zones may require master developer or zone NOCs in addition to DEWA-related submission routes. Requirements should be checked by plot and tenancy.",
  },
  {
    category: "Authority Coordination",
    question: "What is authority coordination?",
    answer:
      "Authority coordination aligns the technical design, documents, applications, comments, NOCs, inspections and close-out actions across DEWA, Dubai Municipality, DCD, free zones, landlords, consultants and contractors.",
  },
  {
    category: "Authority Coordination",
    question: "Can one contractor manage all authority approvals?",
    answer:
      "One contractor can coordinate many tasks, but formal submission rights and approvals may depend on licensed consultants, enrolled contractors, landlords or authority portals. Good coordination defines responsibilities clearly instead of pretending one party can do everything.",
  },
  {
    category: "Authority Coordination",
    question: "What is a consultant's role in DEWA approval?",
    answer:
      "The consultant usually prepares or validates design documents, calculations, drawings and technical responses. The consultant's role is critical when DEWA comments require design changes or formal engineering clarification.",
  },
  {
    category: "Authority Coordination",
    question: "What is a contractor's role in DEWA approval?",
    answer:
      "The contractor may support submission, site works, inspection readiness, testing, snag rectification, cable works, panel installation and coordination. Some DEWA services are specifically for enrolled contractors or consultants.",
  },
  {
    category: "Authority Coordination",
    question: "What is the owner's role in DEWA approval?",
    answer:
      "The owner may need to provide authorization, sign supply terms, approve costs, arrange payment, appoint consultant or contractor, provide tenancy or property documents and make operational decisions about load and schedule.",
  },
  {
    category: "Project Completion",
    question: "What should be in a DEWA handover file?",
    answer:
      "A strong handover file includes approved drawings, application references, NOCs, inspection results, snag closure records, test reports, as-built updates, equipment documents, warranties where applicable and contact details for future maintenance.",
  },
  {
    category: "Project Completion",
    question: "Why are as-built drawings important?",
    answer:
      "As-built drawings show what was actually installed. They help future maintenance, additional load applications, tenant changes, inspections and troubleshooting. Without them, every future change starts with uncertainty.",
  },
  {
    category: "Project Completion",
    question: "Can DEWA approval be transferred to a new tenant?",
    answer:
      "Some records may remain tied to premises or project references, but tenant changes can require updated account, load, landlord and fit-out documentation. The correct path depends on tenancy, existing meter and proposed changes.",
  },
  {
    category: "Project Completion",
    question: "What happens after permanent supply is released?",
    answer:
      "The project should close out as-built records, testing files, panel labels, maintenance access, warranty documents and future expansion notes. Facility teams should know where approvals and electrical records are stored.",
  },
  {
    category: "Project Completion",
    question: "Can I start operations immediately after power connection?",
    answer:
      "Power connection is only one readiness item. Operations should also confirm equipment commissioning, DCD requirements, building completion, safety systems, landlord approvals, occupancy requirements and internal operational checks.",
  },
  {
    category: "Risk Control",
    question: "What is the biggest mistake in DEWA approval?",
    answer:
      "The biggest mistake is treating DEWA approval as paperwork after construction is finished. Approval affects design, load, panels, rooms, cables, inspection, landlord coordination and handover from the beginning.",
  },
  {
    category: "Risk Control",
    question: "Can incomplete documents be revised later?",
    answer:
      "Incomplete documents can often be revised, but each revision costs time and may create new comments. A cleaner first submission is almost always better than relying on repeated correction cycles.",
  },
  {
    category: "Risk Control",
    question: "What if the site installation differs from approved drawings?",
    answer:
      "Differences must be reviewed and corrected through as-built updates, consultant clarification or site rectification depending on severity. Significant mismatch can delay inspection or require revised approval.",
  },
  {
    category: "Risk Control",
    question: "Do I need a site visit before DEWA approval quotation?",
    answer:
      "A site visit is strongly recommended when existing panels, cable routes, electrical rooms, load condition or inspection readiness are uncertain. For simple document-only support, a drawing review may be enough to start.",
  },
  {
    category: "Risk Control",
    question: "Can a project proceed without DEWA approval?",
    answer:
      "Projects should not proceed with electrical works that require DEWA approval without confirming the authority route. Unauthorized or uncoordinated work can create safety, inspection, handover and operational risk.",
  },
  {
    category: "Risk Control",
    question: "What if my landlord refuses NOC?",
    answer:
      "The reason for refusal must be clarified. It may relate to load capacity, building rules, unpaid issues, missing drawings, safety concerns, lease restrictions or scope conflicts. Technical documents can help, but landlord approval remains a stakeholder requirement.",
  },
  {
    category: "Risk Control",
    question: "What if existing electrical capacity is not enough?",
    answer:
      "The project may need load management, equipment changes, panel upgrades, cable upgrades, transformer work, additional load approval or a revised operating plan. The right solution depends on safety, cost, timeline and DEWA requirements.",
  },
  {
    category: "Risk Control",
    question: "How can I reduce DEWA approval risk?",
    answer:
      "Use accurate load data, verified drawings, correct file formats, early landlord NOC, consultant review, site readiness checks, authority comment tracking and realistic timelines. Do not make commercial commitments before confirming power feasibility.",
  },
  {
    category: "Emitronix",
    question: "Why choose Emitronix for DEWA approval support?",
    answer:
      "Choose Emitronix when you need a Dubai contractor mindset around DEWA approval: technical document review, practical site coordination, inspection readiness, authority follow-up, civil and electrical interface awareness and clear communication with owners, consultants and tenants.",
  },
  {
    category: "Emitronix",
    question: "Is Emitronix a DEWA approved contractor?",
    answer:
      "This page does not make an unsupported blanket claim. DEWA services can require enrolled consultants or contractors, and the applicable submitter should be verified for your project route. Emitronix can coordinate the approval workflow and confirm the correct responsibility during assessment.",
  },
  {
    category: "Emitronix",
    question: "Can Emitronix provide a site visit?",
    answer:
      "Yes. Emitronix can arrange a site visit for DEWA approval assessment, electrical room review, load discussion, inspection readiness, cable route coordination, warehouse power checks and additional load planning.",
  },
  {
    category: "Emitronix",
    question: "Can Emitronix help with urgent DEWA approval?",
    answer:
      "Emitronix can help organize urgent cases by identifying the fastest practical route, missing documents, site readiness risks and authority comments. Urgency does not remove technical requirements, but disciplined coordination can reduce avoidable delays.",
  },
  {
    category: "Emitronix",
    question: "What should I send Emitronix for a quote?",
    answer:
      "Send project location, drawings, existing DEWA references, current load, required load, site photos, landlord or authority comments, consultant details, target date, tenancy or plot information and a short description of the power issue.",
  },
  {
    category: "Emitronix",
    question: "Can Emitronix support DEWA and DCD together?",
    answer:
      "Yes. Emitronix can coordinate DEWA-related electrical approval work alongside DCD and other Dubai authority workflows where the project requires connected civil, MEP, fire and handover planning.",
  },
  {
    category: "Emitronix",
    question: "Can Emitronix support small villa projects?",
    answer:
      "Yes. Villa projects may need temporary power, permanent connection, additional load, completion support or electrical inspection readiness. Emitronix can assess the required route based on project status and scope.",
  },
  {
    category: "Emitronix",
    question: "Can Emitronix support large industrial projects?",
    answer:
      "Yes. Industrial projects may involve additional load, HV approval, transformer coordination, package substation, cable works, shutdown planning, testing and commissioning. Emitronix can support the coordination and construction-side readiness.",
  },
  {
    category: "Emitronix",
    question: "Does Emitronix publish client names or project counts here?",
    answer:
      "No. This page avoids invented client names, project counts, testimonials or certification claims. Verified project-specific information can be discussed directly when appropriate and available.",
  },
  {
    category: "Emitronix",
    question: "How do I contact Emitronix for DEWA approval?",
    answer:
      `Use the office Call Now action, WhatsApp the team through the website, email ${site.email}, or submit the contact form with project location, drawings, load requirement and current authority status.`,
  },
];

const publishedFaqQuestions = new Set([
  "How do I get DEWA approval in Dubai?",
  "How much does DEWA approval cost in Dubai?",
  "How long does DEWA approval take?",
  "What documents are required for DEWA approval?",
  "How do warehouse DEWA approvals work?",
  "How does LV approval differ from HV approval?",
  "Can I apply for DEWA approval manually?",
  "What is a DEWA new connection?",
  "Can a tenant request a new DEWA electricity connection?",
  "What is temporary power supply?",
  "How do I avoid delays in a new connection application?",
  "What is DEWA additional load approval?",
  "Can I install new machines before additional load approval?",
  "What documents are needed for additional load?",
  "What if DEWA rejects additional load?",
]);

const publishedDewaFaqs = dewaFaqs.filter((faq) => publishedFaqQuestions.has(faq.question));
const faqCategories = Array.from(new Set(publishedDewaFaqs.map((faq) => faq.category)));

function CtaButtons({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${compact ? "text-sm" : ""}`}>
      <Link href="/contact?service=dewa-approval" className="premium-button">
        Request DEWA Assessment <ArrowRight className="h-4 w-4" />
      </Link>
      <Link href="/contact?intent=site-visit&service=dewa-approval" className="premium-button-light">
        Request Site Visit <CalendarCheck className="h-4 w-4" />
      </Link>
      <a href={phoneHref} className="premium-button-light">
        Call Now <PhoneCall className="h-4 w-4" />
      </a>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="premium-button-light">
        WhatsApp Us <MessageCircle className="h-4 w-4" />
      </a>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  id,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  align?: "left" | "center";
}) {
  return (
    <div id={id} className={`${align === "center" ? "mx-auto text-center" : ""} max-w-5xl scroll-mt-28`}>
      <p className="premium-kicker">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight text-charcoal sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className={`mt-5 max-w-3xl text-base leading-8 text-steel sm:text-lg ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

function MiniCardGrid({ items, columns = "three" }: { items: MiniCard[]; columns?: "two" | "three" | "four" }) {
  const gridClass =
    columns === "four"
      ? "md:grid-cols-2 xl:grid-cols-4"
      : columns === "two"
        ? "md:grid-cols-2"
        : "md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={`grid gap-5 ${gridClass}`}>
      {items.map((item) => {
        const Icon = item.icon ?? CheckCircle2;
        const content = (
          <>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-brand/[0.15] bg-brand-soft text-brand">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-xl font-semibold leading-snug text-charcoal">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-steel">{item.description}</p>
            {item.items ? (
              <ul className="mt-5 grid gap-2">
                {item.items.map((point) => (
                  <li key={point} className="flex gap-2 text-sm font-bold leading-6 text-charcoal">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
            {item.cta && item.href ? (
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase text-brand">
                {item.cta} <ArrowRight className="h-4 w-4" />
              </span>
            ) : null}
          </>
        );

        return item.href ? (
          <Link key={item.title} href={item.href} className="luxury-card rounded-lg p-6">
            {content}
          </Link>
        ) : (
          <article key={item.title} className="luxury-card rounded-lg p-6">
            {content}
          </article>
        );
      })}
    </div>
  );
}

function ImageFeature({
  asset,
  title,
  caption,
  priority = false,
}: {
  asset: InternalServiceImage;
  title: string;
  caption: string;
  priority?: boolean;
}) {
  return (
    <figure title={title} className="overflow-hidden rounded-lg border border-brand/[0.14] bg-white shadow-none">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={asset.src}
          alt={asset.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover"
        />
      </div>
      <figcaption className="border-t border-brand/[0.12] bg-white p-4 text-sm font-bold leading-6 text-charcoal">
        {caption}
        <span className="mt-2 block text-xs font-normal">{asset.caption}</span>
      </figcaption>
    </figure>
  );
}

function JsonLd() {
  const organizationId = absoluteUrl("/#organization");
  const webpageId = `${pageUrl}#webpage`;
  const serviceId = `${pageUrl}#service`;
  const faqId = `${pageUrl}#faq`;
  const articleId = `${pageUrl}#article`;
  const videoId = `${pageUrl}#video`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: pageUrl,
        name: "DEWA Approval Coordination Guide for Dubai Projects",
        description:
          "A practical guide to DEWA coordination, current-source checking, submission roles, documents and site readiness for Dubai projects.",
        inLanguage: "en-AE",
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
        about: [
          { "@type": "Thing", name: "DEWA approval" },
          { "@type": "Thing", name: "Dubai electricity connection" },
          { "@type": "Thing", name: "LV approval" },
          { "@type": "Thing", name: "HV approval" },
          { "@type": "Thing", name: "DEWA NOC" },
        ],
        primaryImageOfPage: {
          "@id": `${pageUrl}#primaryimage`,
        },
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`,
        },
        mainEntity: {
          "@id": serviceId,
        },
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: "DEWA Approval Coordination",
        serviceType: "Construction-side document, site-readiness and stakeholder coordination for DEWA-related project enquiries",
        provider: {
          "@id": organizationId,
        },
        areaServed: {
          "@type": "City",
          name: "Dubai",
        },
        url: pageUrl,
        description:
          "DEWA approval coordination support for Dubai project enquiries, subject to the formal submission route, appointed consultant responsibilities and current authority requirements.",
      },
      {
        "@type": "Article",
        "@id": articleId,
        headline: "DEWA Approval Coordination Guide for Dubai Projects",
        description:
          "A practical Dubai resource for project teams reviewing electricity-approval routes, documents, responsibilities and site readiness.",
        author: {
          "@id": organizationId,
        },
        publisher: {
          "@id": organizationId,
        },
        image: [absoluteUrl(heroImage), absoluteUrl(inspectionImage), absoluteUrl(cableImage)],
        datePublished: "2026-07-06",
        dateModified: trustContentLastReviewedIso,
        mainEntityOfPage: {
          "@id": webpageId,
        },
        articleSection: ["DEWA approval", "Dubai electrical approvals", "Authority coordination", "Electrical inspection"],
        publishingPrinciples: absoluteUrl("/editorial-policy"),
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        mainEntity: publishedDewaFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Authority Approvals", item: absoluteUrl("/approval") },
          { "@type": "ListItem", position: 3, name: "DEWA Approvals", item: pageUrl },
        ],
      },
      {
        "@type": "ImageObject",
        "@id": `${pageUrl}#primaryimage`,
        url: absoluteUrl(heroImage),
        contentUrl: absoluteUrl(heroImage),
        name: heroImageAsset.alt,
        caption: heroImageAsset.alt,
        description: heroImageAsset.caption,
        width: heroImageAsset.width,
        height: heroImageAsset.height,
      },
      {
        "@type": "ImageObject",
        "@id": `${pageUrl}#inspectionimage`,
        url: absoluteUrl(inspectionImage),
        contentUrl: absoluteUrl(inspectionImage),
        name: inspectionImageAsset.alt,
        caption: inspectionImageAsset.alt,
        description: inspectionImageAsset.caption,
        width: inspectionImageAsset.width,
        height: inspectionImageAsset.height,
      },
      {
        "@type": "ImageObject",
        "@id": `${pageUrl}#cableimage`,
        url: absoluteUrl(cableImage),
        contentUrl: absoluteUrl(cableImage),
        name: cableImageAsset.alt,
        caption: cableImageAsset.alt,
        description: cableImageAsset.caption,
        width: cableImageAsset.width,
        height: cableImageAsset.height,
      },
      {
        "@type": "VideoObject",
        "@id": videoId,
        name: "DEWA Approval Workflow Dubai",
        description:
          "Short visual overview of DEWA approval coordination, LV inspection preparation and HV/LV cable route planning for Dubai projects.",
        thumbnailUrl: absoluteUrl(videoThumbnail),
        uploadDate: "2026-07-06T09:00:00+04:00",
        duration: "PT15S",
        contentUrl: absoluteUrl(videoUrl),
        publisher: {
          "@id": organizationId,
        },
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default function DewaApprovalsPage() {
  return (
    <InternalPageFrame>
      <section className="internal-page-intro relative isolate overflow-hidden bg-brand-dark text-white">
        <Image
          src={heroImageAsset.src}
          alt={heroImageAsset.alt}
          fill
          priority
          quality={65}
          sizes={`(max-width: 1023px) ${heroImageAsset.width}px, 100vw`}
          className="absolute inset-0 z-0 object-cover"
        />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(11,31,58,0.96)_0%,rgba(18,58,115,0.82)_45%,rgba(11,31,58,0.42)_100%)]" />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(11,31,58,0.08)_0%,rgba(11,31,58,0.76)_100%)]" />
        <div className="container-pad relative z-20 grid min-h-[740px] gap-10 pt-32 lg:grid-cols-[0.98fr_0.62fr] lg:items-end lg:pb-24 lg:pt-40">
          <div className="max-w-5xl pb-16 lg:pb-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-sky">
              Dubai authority coordination guide
            </p>
            <h1 className="internal-page-title mt-6 text-5xl font-semibold leading-none text-white sm:text-6xl lg:text-7xl">
              DEWA Approval Coordination Guide for Dubai Projects
            </h1>
            <p id="dewa-direct-answer" className="mt-7 max-w-3xl text-lg font-medium leading-9 text-white/[0.88] sm:text-xl">
              A practical resource for defining the approval route, organizing project information, coordinating site readiness and confirming who is formally responsible for each submission.
            </p>
            <div className="mt-9">
              <CtaButtons />
            </div>
          </div>

          <aside className="hidden rounded-lg border border-white/25 bg-white/[0.14] p-5 shadow-none backdrop-blur-2xl lg:block">
            <div className="rounded-lg border border-white/20 bg-white/[0.9] p-5 text-charcoal shadow-none">
              <p className="premium-kicker">Request-ready summary</p>
              <ul className="mt-5 grid gap-3">
                {[
                  "Define the project-specific authority route",
                  "Organize documents and site-readiness evidence",
                  "Confirm the properly appointed formal submitter",
                  "Treat official requirements and outcomes as authority-controlled",
                ].map((point) => (
                  <li key={point} className="flex gap-3 text-sm font-bold leading-6">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <p className="container-pad py-3 text-xs leading-5 text-steel">
        {heroImageAsset.caption}
        {heroImageAttribution ? <PhotoAttribution {...heroImageAttribution} /> : null}
      </p>

      <section className="sticky top-0 z-30 border-b border-brand/[0.12] bg-white/[0.92] py-3 shadow-sm backdrop-blur-2xl" data-internal-nav-shell>
        <div className="container-pad">
          <nav className="flex gap-2 overflow-x-auto text-sm font-semibold text-charcoal" aria-label="DEWA approval page navigation" data-internal-section-nav>
            {anchorLinks.map((item) => (
              <a key={item.href} href={item.href} className="shrink-0 rounded-full border border-brand/[0.14] bg-white px-4 py-2 hover:border-brand hover:text-brand">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-pad">
          <nav className="mb-10 flex flex-wrap items-center gap-2 text-sm font-bold text-steel" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand">Home</Link>
            <ChevronRight size={16} aria-hidden="true" />
            <Link href="/approval" className="hover:text-brand">Approval</Link>
            <ChevronRight size={16} aria-hidden="true" />
            <span className="text-charcoal">DEWA Approvals</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[0.76fr_1.24fr]">
            <SectionIntro
              eyebrow="Authority resource"
              title="A practical guide for owners, tenants, consultants and project teams."
              description="Use this resource to frame early project questions, then confirm the current service route and document rules directly with the authority and the properly appointed consultant or contractor."
            />
            <div className="grid gap-5 text-lg leading-9 text-steel">
              <p>
                DEWA approval is not one document and it is not one meeting. For a Dubai project, it can involve Building NOC - Electricity, electricity permits and connections, design approval, connection estimates, additional load, fit-out connection, utility NOC, LV inspection, HV inspection, transformer coordination, cable works, testing, commissioning and final supply release. The correct route depends on location, authority jurisdiction, building use, connected load, maximum demand, existing supply, landlord requirements, consultant scope and site readiness.
              </p>
              <p>
                A sound coordination workflow connects documents, design, site execution, inspection readiness and completion records from the start. It also identifies landlord, master-developer and consultant dependencies before they become handover risks.
              </p>
              <p>
                The examples below are educational planning prompts for Dubai projects. They do not confirm that Emitronix is enrolled for, appointed to, or able to undertake every listed specialist or submission function.
              </p>
            </div>
          </div>
          <div className="mt-10 rounded-lg border border-amber-300 bg-amber-50 p-6 text-sm leading-7 text-amber-950">
            <p className="font-semibold">Authority and responsibility notice</p>
            <p className="mt-2">
              Emitronix is not DEWA and cannot guarantee an approval, inspection outcome or timeline. Formal submissions and regulated work must be handled by the properly appointed and currently eligible party for the specific service. Emitronix&apos;s exact coordination, construction or specialist scope must be confirmed in writing for each project.
            </p>
          </div>
        </div>
      </section>

      <section id="answers" className="section-pad soft-section scroll-mt-28">
        <div className="container-pad">
          <SectionIntro
            eyebrow="Quick reference"
            title="Short answers to common DEWA coordination questions."
            description="Each answer starts with the practical point, with documents, process limits and deeper detail explained throughout the page."
            align="center"
          />
          <div className="mt-12">
            <MiniCardGrid items={directAnswers} columns="three" />
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container-pad">
          <div className="grid gap-6 rounded-lg border border-brand/[0.15] bg-brand-soft p-6 shadow-none lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
            <div>
              <p className="premium-kicker">Project enquiry</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight text-charcoal sm:text-3xl">
                Need DEWA approval, additional load or inspection support now?
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-charcoal/85">
                Send your project location, available drawings, existing DEWA reference, required load, site photos and target date. The team can review the enquiry and confirm whether Emitronix can support the requested scope.
              </p>
            </div>
            <CtaButtons compact />
          </div>
        </div>
      </section>

      <section id="services" className="section-pad bg-white scroll-mt-28">
        <div className="container-pad">
          <SectionIntro
              eyebrow="DEWA coordination pathways"
              title="Common electricity approval and infrastructure routes explained in one workflow."
              description="A real project can touch new supply, load changes, fit-out connections, substations, cable routes, inspections, utility NOCs and completion evidence. Final capability and submission responsibility must be confirmed for the specific project."
            align="center"
          />
          <div className="mt-12">
            <MiniCardGrid items={serviceClusters} columns="three" />
          </div>
        </div>
      </section>

      <section className="blue-grid section-pad">
        <div className="container-pad grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionIntro
              eyebrow="Visual inspection"
              title="DEWA approval work must connect engineering documents with real site conditions."
              description="The best submissions are built from the same truth the inspector will see on site: actual panel locations, access, cable routing, electrical room dimensions, labels, load distribution, test evidence and safe completion status."
            />
            <div className="mt-8">
              <CtaButtons compact />
            </div>
          </div>
          <ImageFeature
            asset={inspectionImageAsset}
            title="LV switchgear inspection preparation"
            caption="In general, switchgear, test records, labels and access should align before an inspection request."
          />
        </div>
      </section>

      <section id="process" className="section-pad bg-white scroll-mt-28">
        <div className="container-pad">
          <SectionIntro
            eyebrow="Approval process"
            title="A disciplined DEWA approval process from scope review to power release."
            description="This process is intentionally practical. It shows what a client, consultant, contractor and site team must control before a Dubai power approval can move cleanly."
            align="center"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {processSteps.map((step) => (
              <article key={step.title} className="luxury-card rounded-lg p-6">
                <h3 className="text-xl font-semibold leading-snug text-charcoal">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-steel">{step.description}</p>
                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-900">
                  Owner focus: {step.ownerFocus}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad soft-section">
        <div className="container-pad">
          <div className="grid gap-12 lg:grid-cols-[0.74fr_1.26fr]">
            <SectionIntro
              eyebrow="Timeline planning"
              title="How long DEWA approval can take depends on more than DEWA review time."
              description="Official service milestones can be short when the file is complete. The full client timeline includes design preparation, NOCs, comments, payment, site works, inspection readiness and snag closure."
            />
            <div className="overflow-hidden rounded-lg border border-brand/[0.14] bg-white shadow-none">
              <table className="w-full border-collapse text-left text-sm">
                <caption id="dewa-timeline-answer" className="sr-only">
                  DEWA approval timeline planning table for Dubai projects
                </caption>
                <thead className="bg-brand text-white">
                  <tr>
                    <th scope="col" className="p-4 font-semibold">Phase</th>
                    <th scope="col" className="p-4 font-semibold">Typical planning view</th>
                    <th scope="col" className="p-4 font-semibold">What affects it</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineRows.map((row) => (
                    <tr key={row.phase} className="border-t border-brand/[0.12] align-top">
                      <th scope="row" className="p-4 font-semibold text-charcoal">{row.phase}</th>
                      <td className="p-4 leading-7 text-steel">{row.typical}</td>
                      <td className="p-4 leading-7 text-steel">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="documents" className="section-pad bg-white scroll-mt-28">
        <div className="container-pad">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <SectionIntro
              eyebrow="Documents required"
              title="DEWA approval documents must be complete, consistent and uploaded in the correct format."
              description="The exact document list changes by service, authority path and project type. These are the document groups that usually decide whether the file moves or returns with comments."
            />
            <SectionPhotograph photo={sectionPhotographs[0]} compact />
          </div>
          <div className="mt-12">
            <MiniCardGrid items={documentGroups} columns="two" />
          </div>
        </div>
      </section>

      <section className="blue-grid section-pad">
        <div className="container-pad grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <ImageFeature
            asset={cableImageAsset}
            title="Cable-route coordination"
            caption="Cable routes, NOCs, utility conflicts and inspection evidence generally need early planning."
          />
          <div>
            <SectionIntro
              eyebrow="Cable and utility coordination"
              title="HV cable works, LV cable works and utility NOCs need early route control."
              description="In industrial and logistics areas such as DIP, JAFZA, Dubai South, Dubai Industrial City and Jebel Ali, cable works can be delayed by existing utilities, civil interfaces, access restrictions, authority NOCs and late route changes."
            />
            <div className="mt-8 grid gap-3">
              {["Route drawings must match the real site.", "Existing utilities and crossings must be checked.", "Testing and reinstatement records should be planned before excavation starts."].map((point) => (
                <div key={point} className="flex gap-3 rounded-lg border border-brand/[0.12] bg-white p-4 text-sm font-bold leading-6 text-charcoal shadow-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-pad">
          <SectionIntro
            eyebrow="Engineering process"
            title="The engineering checks behind a successful DEWA approval."
            description="Good authority coordination is not guesswork. It depends on engineering clarity, drawing control, equipment data and site reality."
            align="center"
          />
          <div className="mt-12">
            <MiniCardGrid items={engineeringTopics} columns="three" />
          </div>
        </div>
      </section>

      <section id="inspection" className="section-pad soft-section scroll-mt-28">
        <div className="container-pad">
          <SectionIntro
            eyebrow="Inspection, testing and commissioning"
            title="Inspection readiness is the difference between approval progress and repeat visits."
            description="DEWA inspection should be requested only when the installation, documents and access conditions are ready. Testing and commissioning records protect the approval and the long-term facility."
            align="center"
          />
          <div className="mt-12">
            <MiniCardGrid items={inspectionTopics} columns="three" />
          </div>
          <div className="mt-10 grid gap-5 rounded-lg border border-brand/[0.14] bg-white p-6 shadow-none lg:grid-cols-3">
            {[
              "Pre-inspection: compare approved drawings, site condition, labels, tests and access.",
              "Inspection day: keep responsible people, keys, records and safe working conditions available.",
              "Post-inspection: close snags with evidence, update records and prepare resubmission if needed.",
            ].map((point) => (
              <div key={point} className="flex gap-3 text-sm font-bold leading-7 text-charcoal">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="industries" className="section-pad bg-white scroll-mt-28">
        <div className="container-pad">
          <SectionIntro
            eyebrow="Project environments"
            title="Electricity-approval planning changes with building use and operating risk."
            description="These examples explain how load profiles and stakeholder dependencies can differ. They are not a claim of completed projects in every environment."
            align="center"
          />
          <div className="mt-12">
            <MiniCardGrid items={industryCards.slice(0, 5)} columns="three" />
          </div>
        </div>
      </section>

      <section className="section-pad blue-grid">
        <div className="container-pad grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <SectionIntro
            eyebrow="Published service area"
            title="Start with the exact Dubai project location and jurisdiction."
            description="Emitronix publishes Dubai and the UAE as its service area. A specific project route still depends on the site, authority jurisdiction, landlord and master developer."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {["Dubai", site.location].map((location) => (
              <div key={location} className="flex min-h-20 items-center gap-3 rounded-lg border border-brand/[0.12] bg-white p-4 text-sm font-semibold text-charcoal shadow-sm">
                <MapPinIcon />
                {location}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-pad">
          <SectionIntro
            eyebrow="Illustrative planning scenarios"
            title="Example coordination pathways—not Emitronix case studies."
            description="These fictional scenarios help project teams frame common dependencies. They do not represent named clients, completed projects, outcomes or authority approvals."
            align="center"
          />
          <div className="mt-12">
            <MiniCardGrid items={sampleScenarios} columns="four" />
          </div>
        </div>
      </section>

      <section id="mistakes" className="section-pad soft-section scroll-mt-28">
        <div className="container-pad">
          <SectionIntro
            eyebrow="Approval tips"
            title="Common DEWA approval mistakes that cost Dubai projects time."
            description="Most approval delays are predictable. The earlier these risks are removed, the easier it becomes to protect the opening date, handover date or energization window."
            align="center"
          />
          <div className="mt-12">
            <MiniCardGrid items={commonMistakes} columns="three" />
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-pad grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionIntro
              eyebrow="Regulations and official resources"
              title="Use official DEWA sources for the latest service rules."
              description="Official service pages, portal routes, file formats, delivery times and conditions can change. The sources below were reviewed on 23 July 2026; verify the live official source again before submission."
            />
            <p id="dewa-cost-answer" className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-bold leading-7 text-amber-950">
              Cost note: public DEWA service pages may list some e-service registrations as free, but project owners should still plan for estimates, connection charges, contractor works, consultant drawings, equipment, testing and rectification when applicable.
            </p>
            <div className="mt-4 rounded-lg border border-brand/[0.14] bg-white p-5 text-sm leading-7 text-steel">
              <p className="font-semibold text-charcoal">Editorial status</p>
              <p className="mt-2">
                Last reviewed {trustContentLastReviewedLabel}. Emitronix is the organizational publisher. No named technical reviewer is presented until management verifies the reviewer&apos;s identity and credentials.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 font-bold text-brand">
                <Link href="/editorial-policy">Editorial policy</Link>
                <Link href="/technical-review-policy">Technical review policy</Link>
                <Link href="/corrections-policy">Corrections policy</Link>
                <Link href="/disclaimer">Disclaimer</Link>
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {officialResources.map((resource) => (
              <a
                key={resource.href}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-card rounded-lg p-5"
              >
                <span className="premium-kicker">Official DEWA resource</span>
                <h3 className="mt-3 text-xl font-semibold leading-snug text-charcoal">{resource.title}</h3>
                <p className="mt-2 text-sm leading-7 text-steel">{resource.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="video-briefing" className="section-pad blue-grid">
        <div className="container-pad grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <SectionIntro
            eyebrow="Video briefing"
            title="A short visual overview of the DEWA approval workflow."
            description="Use this short visual summary as an orientation to approval coordination, LV inspection preparation and cable-route planning."
          />
          <figure className="overflow-hidden rounded-lg border border-brand/[0.14] bg-white shadow-none">
            <video
              controls
              muted
              preload="none"
              poster={videoThumbnail}
              className="aspect-video w-full bg-brand-dark object-cover"
              aria-label="DEWA approval workflow visual overview for Dubai projects"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
            <figcaption className="border-t border-brand/[0.12] bg-white px-5 py-4 text-sm leading-7 text-steel">
              Silent visual summary. Equivalent page content: confirm the project and load context, organize the relevant drawings and documents, coordinate comments, prepare the site and test records for inspection, then maintain close-out evidence. Project-specific DEWA requirements must be confirmed through current official services.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-pad">
          <SectionIntro
            eyebrow="Related services"
            title="Connected Dubai approval and construction services."
            description="DEWA approval rarely stands alone. These resources connect electrical coordination with related construction and approval decisions."
            align="center"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {relatedServices.map((item) => (
              <Link key={item.href} href={item.href} className="luxury-card rounded-lg p-6">
                <span className="premium-kicker">Related</span>
                <h3 className="mt-4 text-xl font-semibold leading-snug text-charcoal">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-steel">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ContentReviewRecord
        title="DEWA approval guide content record"
        reviewScope="General editorial review of published DEWA source links, workflow explanations, non-guarantee language and project-planning boundaries. Current DEWA requirements and project-specific electrical responsibilities must be confirmed through official services and appropriately appointed professionals."
      />

      <section id="faq" className="section-pad soft-section scroll-mt-28">
        <div className="container-pad">
          <SectionIntro
            eyebrow="DEWA approval FAQs"
            title="Practical questions to review before a project enquiry."
            description="Concise answers for project teams preparing documents, a site visit, quotation discussion or authority-coordination request."
            align="center"
          />
          <div className="mt-12 grid gap-8">
            {faqCategories.map((category) => (
              <section key={category} aria-labelledby={`faq-${category.replace(/\s+/g, "-").toLowerCase()}`}>
                <h3 id={`faq-${category.replace(/\s+/g, "-").toLowerCase()}`} className="text-2xl font-semibold text-charcoal">
                  {category}
                </h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {publishedDewaFaqs
                    .filter((faq) => faq.category === category)
                    .map((faq) => (
                      <details key={faq.question} className="group rounded-lg border border-brand/[0.14] bg-white p-5 shadow-sm open:shadow-none">
                        <summary className="cursor-pointer list-none text-lg font-semibold leading-snug text-charcoal">
                          {faq.question}
                        </summary>
                        <p className="mt-4 text-sm leading-7 text-steel">{faq.answer}</p>
                      </details>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section-pad bg-white scroll-mt-28">
        <div className="container-pad grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <SectionIntro
              eyebrow="Request a DEWA assessment"
              title="Talk to the project team before power coordination becomes a deadline problem."
              description="Share the project location, drawings, existing DEWA status, current load, required load, authority comments, site photos and target handover date. The first response will focus on the next practical step."
            />
            <div className="mt-8 grid gap-3">
              {[
                { label: `Call: ${site.phone}`, href: site.phoneHref },
                { label: `Email: ${site.email}`, href: `mailto:${site.email}` },
                { label: `Location: ${site.location}`, href: undefined },
                { label: `Hours: ${site.hours}`, href: undefined },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 rounded-lg border border-brand/[0.12] bg-platinum p-4 text-sm font-bold leading-6 text-charcoal">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  {item.href ? <a href={item.href} className="transition hover:text-brand">{item.label}</a> : item.label}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <CtaButtons compact />
            </div>
            <SectionPhotograph photo={sectionPhotographs[1]} className="mt-6" compact />
          </div>
          <ContactForm
            scopeOptions={[
              "DEWA Approval",
              "DEWA New Connection",
              "DEWA Additional Load",
              "DEWA Load Reduction",
              "DEWA LV Approval",
              "DEWA HV Approval",
              "DEWA NOC",
              "DEWA Electrical Inspection",
              "DEWA Testing and Commissioning",
              "Transformer or Substation Work",
              "Temporary Power Supply",
              "Permanent Power Connection",
            ]}
          />
        </div>
      </section>

      <JsonLd />
    </InternalPageFrame>
  );
}

function MapPinIcon() {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-brand/[0.14] bg-brand-soft text-brand">
      <Building2 className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}
