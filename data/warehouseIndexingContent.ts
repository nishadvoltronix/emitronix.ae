export type WarehouseIndexingContent = {
  purpose: string;
  sections: Array<{ title: string; paragraphs: string[] }>;
  contextualLinks: Array<{ label: string; href: string; context: string }>;
  metaDescription?: string;
};

export const warehouseIndexingSlugs = [
  "distribution-centre-construction",
  "factory-construction",
  "warehouse-concrete-works",
  "warehouse-construction-dubai",
  "warehouse-construction-timeline",
  "warehouse-design-build",
  "warehouse-dewa-approvals",
  "warehouse-fire-fighting",
  "warehouse-fit-out",
  "warehouse-flooring",
  "warehouse-foundations",
  "warehouse-infrastructure",
  "warehouse-loading-dock-construction",
  "warehouse-maintenance",
  "warehouse-planning",
  "warehouse-safety-standards",
  "warehouse-structural-steel",
  "warehouse-turnkey-contractor",
] as const;

export type WarehouseIndexingSlug = (typeof warehouseIndexingSlugs)[number];

export const warehouseIndexingContentBySlug = {
  "distribution-centre-construction": {
    purpose: "A distribution centre brief connects receiving, staging and dispatch to the building and yard. Use the following exercise to test peak activity before fixing dock positions, internal circulation and space allocations with the design team.",
    sections: [
      {
        title: "Trace one receiving and dispatch cycle",
        paragraphs: ["Describe how a delivery moves from the gate through unloading, checking, temporary staging, storage and onward dispatch. Record which movements happen together, where goods wait and who clears them for the next step. Include returns, damaged goods and staff access in the exercise. Give the designer the vehicle types, handling equipment and shift assumptions used in this scenario so the proposed layout can be reviewed against an identifiable operating brief."],
      },
      {
        title: "Review the busiest overlap in the yard",
        paragraphs: ["Ask the operator to describe a busy arrival and dispatch window, including vehicles waiting for a door or paperwork. Review that scenario on a coordinated yard plan showing gates, parking, dock approaches, pedestrian routes and emergency access. Identify who owns each unresolved conflict and what drawing or operational decision will close it. Keep the agreed scenario with the design record so later changes to loading equipment or door allocation can be tested against the same assumptions."],
      },
      {
        title: "Agree a practical readiness review",
        paragraphs: ["Before operational handover, bring together the yard, dock, floor, lighting, utility and warehouse layout records. Walk the proposed goods route with the operator and relevant specialists, checking whether equipment can be used and maintained with the planned storage arrangement in place. Record incomplete work, training information and access restrictions alongside the party responsible for closing them. This review gives the owner an operating acceptance record that is separate from the construction snag list."],
      },
    ],
    contextualLinks: [
      { label: "Logistics warehouse planning", href: "/warehouse/logistics-warehouse", context: "Develop the movement and storage assumptions used in the receiving-to-dispatch exercise." },
      { label: "Loading dock construction", href: "/warehouse/warehouse-loading-dock-construction", context: "Carry the agreed fleet and door arrangement into dock equipment and construction interfaces." },
      { label: "Warehouse parking construction", href: "/warehouse/warehouse-parking-construction", context: "Check waiting vehicles and staff parking against the yard circulation plan." },
    ],
  },
  "factory-construction": {
    purpose: "A factory building brief begins with the production process and the equipment it supports. These checks help an owner turn supplier information into coordinated civil and services decisions before procurement and construction assumptions become difficult to change.",
    sections: [
      {
        title: "Create an equipment interface register",
        paragraphs: ["List each production item with its supplier, current layout revision and available installation information. Ask the appointed designers to identify the foundation, structural, electrical, water, drainage, ventilation and maintenance inputs they need from that supplier. Track missing data with an owner and decision date. Keep installation access, lifting arrangements and the future removal route in the register so a machine can be considered throughout its working life, rather than only at its initial delivery."],
      },
      {
        title: "Separate production flow from building circulation",
        paragraphs: ["Map raw materials, processing, inspection or quality hold, finished goods, waste and personnel on the same plan. Record where the process introduces heat, moisture, extraction or special handling questions for the consultant and specialist designers. Compare those routes with doors, equipment bases, storage zones and service access. When production needs change, identify the affected drawings and utility assumptions before asking the contractor to price a revised layout."],
      },
      {
        title: "Plan equipment installation and commissioning interfaces",
        paragraphs: ["Agree which party receives the equipment, verifies the supporting works, makes each service connection and records the relevant installation checks. Put building readiness and supplier attendance on the same dependency schedule. Define the information the operator needs at handover, including equipment documents, isolations, access arrangements and outstanding actions. Project-specific testing and acceptance criteria should come from the appointed designers and suppliers, with responsibility recorded for each part of the integrated production system."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse foundations", href: "/warehouse/warehouse-foundations", context: "Use equipment and structural input records when reviewing the supporting substructure brief." },
      { label: "Warehouse MEP coordination", href: "/warehouse/warehouse-mep", context: "Translate production equipment requirements into coordinated service interfaces." },
      { label: "Warehouse utility services", href: "/warehouse/warehouse-utility-services", context: "Check how process demand connects to the wider utility and site infrastructure scope." },
    ],
  },
  "warehouse-concrete-works": {
    purpose: "Concrete works involve a sequence of irreversible site decisions. This brief focuses on identifying the element being poured, confirming its coordinated information and keeping a traceable placement record that the consultant can review against the agreed inspection plan.",
    sections: [
      {
        title: "Build an element-by-element pour register",
        paragraphs: ["Identify each slab, base or structural concrete element on the current drawings and record the planned pour boundaries. Link the entry to the relevant design revision, material submittal and agreed inspection requirements. Clarify who checks reinforcement, formwork, embedded items and service openings before the element is released. Treat a late opening or anchor change as a coordinated drawing question, with designer review recorded before it reaches the concrete placement team."],
      },
      {
        title: "Resolve the interfaces before placement",
        paragraphs: ["Compare the concrete setting-out information with adjoining foundations, finished floor levels, rack or equipment positions and drainage details. Record which items will become concealed and the evidence needed before they are covered. Where a pour meets earlier work, ask the consultant to confirm the relevant joint and connection details. The useful output is a short release record identifying the inspected area, drawing basis, outstanding actions and party authorising the next activity under the project inspection arrangements."],
      },
      {
        title: "Keep placement and protection evidence together",
        paragraphs: ["Agree how delivery records, placement locations, testing records and curing or protection observations will be linked to the pour register. Record interruptions or departures from the approved method and refer them to the responsible professional for disposition. Before follow-on trades use the area, confirm the applicable release conditions and any restrictions with the consultant. Retain the resulting records with survey information and approved changes so close-out can trace each concrete element back to its construction evidence."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse foundations", href: "/warehouse/warehouse-foundations", context: "Confirm the substructure design basis and formation records feeding the concrete work package." },
      { label: "Warehouse flooring", href: "/warehouse/warehouse-flooring", context: "Carry slab and joint information into the operating floor and finish acceptance brief." },
      { label: "Warehouse civil works", href: "/warehouse/warehouse-civil-works", context: "Coordinate concrete release points with the broader enabling and civil sequence." },
    ],
  },
  "warehouse-construction-dubai": {
    purpose: "This resource helps an owner prepare a warehouse construction enquiry with a clear pricing basis. It connects the operating brief to the proposed building scope, allowing the service conversation to start with documented assumptions and specific questions for the appointed team.",
    sections: [
      {
        title: "Define what the construction enquiry includes",
        paragraphs: ["Describe the proposed warehouse use, location, storage arrangement, vehicle movement and intended opening conditions. Mark which parts of the enquiry cover the shell, civil works, external areas, utilities, fire-safety interfaces, tenant fit-out or equipment installation. Identify the information already available and the decisions still being developed. This boundary record helps bidders see the same project rather than filling gaps with different assumptions about what a completed warehouse includes."],
      },
      {
        title: "Establish a common drawing and site basis",
        paragraphs: ["Give the consultant and prospective contractor a controlled drawing list, available site information and the known landlord or jurisdiction correspondence. Record existing services, access restrictions and any proposed work within a live operation. Ask each reviewer to identify the information they need before confirming quantities, sequencing or construction interfaces. Keep those questions in one clarification register so a new drawing revision or site finding can be assessed across the affected packages."],
      },
      {
        title: "Compare proposals against the same open decisions",
        paragraphs: ["Review each proposal against the scope boundary and clarification register. Look for stated allowances, exclusions, design dependencies, specialist interfaces and the basis of the programme. Ask how changes to racks, floor requirements, utility demand or operating layout will be reviewed and priced. Record the evidence expected at completion alongside the work packages it belongs to. The next appointment discussion can then focus on resolving defined differences rather than comparing headline totals alone."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse planning", href: "/warehouse/warehouse-planning", context: "Develop the operating and site assumptions before issuing a construction enquiry." },
      { label: "Warehouse authority approvals", href: "/warehouse/warehouse-authority-approvals", context: "Identify jurisdiction and submission responsibilities affecting the construction scope." },
      { label: "Warehouse cost guide", href: "/warehouse/warehouse-cost-guide", context: "Review the allowances and open decisions behind comparable contractor prices." },
    ],
    metaDescription: "Warehouse Construction Dubai: review operations, civil and structural interfaces, utilities, authority dependencies, site controls and handover evidence.",
  },
  "warehouse-construction-timeline": {
    purpose: "A useful warehouse programme explains what releases the next activity and who supplies that evidence. This brief focuses on dependencies, information dates and change tracking so an owner can discuss a realistic sequence without relying on a generic promised duration.",
    sections: [
      {
        title: "Record predecessors beside each work package",
        paragraphs: ["For each major activity, list the drawing, site access, procurement or approval input needed before it can proceed. Identify the person responsible for the input and the evidence showing it is ready. Review foundations, structural delivery, envelope closure, services, external works and fit-out as connected packages. A date without a release condition is difficult to assess; an explicit predecessor makes it possible to understand why a change affects a particular part of the programme."],
      },
      {
        title: "Track procurement and authority uncertainty",
        paragraphs: ["Ask suppliers to explain the basis of their current delivery assumptions and the decisions needed before an order can be confirmed. Track submissions and comment responses with the party responsible for the affected drawings. Keep unresolved items visible rather than treating them as completed milestones. When information changes, record its effect on dependent procurement and site activities, distinguishing a confirmed release from a forecast that still relies on another party's action."],
      },
      {
        title: "Work backwards from operational readiness",
        paragraphs: ["Define the planned handover evidence with the owner, consultant and relevant specialists, then identify the installation, testing, inspection and documentation activities supporting it. Check utility readiness, access to equipment and specialist attendance against the same schedule. Review progress using completed dependencies and remaining constraints as well as physical work. Keep an agreed record of decisions and revised assumptions so the team can explain the completion forecast as the project develops."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse planning", href: "/warehouse/warehouse-planning", context: "Establish the scope and operating decisions that underpin the programme." },
      { label: "Warehouse completion", href: "/warehouse/warehouse-completion", context: "Define the inspection, document and readiness evidence needed at the end of the sequence." },
      { label: "Warehouse authority approvals", href: "/warehouse/warehouse-authority-approvals", context: "Map submission and comment-response dependencies to the responsible parties." },
    ],
  },
  "warehouse-design-build": {
    purpose: "A design and build enquiry needs a usable owner brief and a clear method for approving design decisions. These checks focus on how requirements move into coordinated drawings, how responsibilities are recorded and how changes are managed before construction release.",
    sections: [
      {
        title: "Turn owner requirements into a decision record",
        paragraphs: ["Describe the intended warehouse operation, available site information, storage arrangement and the owner's priorities for access, services and future change. Record which requirements are fixed and which need options from the design team. Agree what information will be presented for each decision, who accepts it and where acceptance is recorded. This gives the developing design an identifiable basis and makes later discussions about scope or performance easier to trace."],
      },
      {
        title: "Agree design and submission responsibilities",
        paragraphs: ["Identify the appointed designers, specialist suppliers and parties responsible for formal submissions. Ask how architectural, structural, civil, MEP and fire-safety information will be coordinated before a drawing is issued for construction. Record the owner's inputs and any separate consultant or landlord review within that workflow. The delivery label alone cannot define these appointments; the proposal and project responsibility register should describe who produces, checks, submits and releases each relevant document."],
      },
      {
        title: "Connect design changes to construction release",
        paragraphs: ["Use a change record that identifies the reason, affected drawings, owner decision and consequences for pricing, procurement and site work. Before releasing a package, review whether its dependent layouts and specialist inputs are sufficiently resolved for that stage. Keep superseded revisions out of the active construction set. At handover, retain approved changes with the coordinated record drawings and operating information so the owner can understand the final design basis and the decisions behind it."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse consultant coordination", href: "/warehouse/warehouse-consultant", context: "Clarify appointed-party inputs and the design review responsibilities in the delivery route." },
      { label: "Warehouse engineering", href: "/warehouse/warehouse-engineering", context: "Review the technical interfaces that need coordinated design decisions." },
      { label: "Warehouse turnkey contractor", href: "/warehouse/warehouse-turnkey-contractor", context: "Extend the design responsibility discussion into package boundaries and operational handover scope." },
    ],
  },
  "warehouse-dewa-approvals": {
    purpose: "A warehouse utility enquiry is easier to coordinate when the operating demand and connection assumptions are recorded together. These checks help prepare the owner and MEP consultant's intake information while leaving the actual submission route and project requirements with the responsible parties.",
    sections: [
      {
        title: "Prepare a traceable demand basis",
        paragraphs: ["List the equipment and operational uses contributing to the proposed electrical and water demand, identifying the source of each input. Distinguish existing information, planned equipment and future allowances for the MEP designer to assess. Include refrigeration, material-handling charging or production equipment where these are part of the actual brief. Keep the assessed demand tied to the current layout and equipment schedule so changes can be reviewed before connection or distribution assumptions are treated as settled."],
      },
      {
        title: "Clarify the connection and site interfaces",
        paragraphs: ["Record the available utility information, known connection points and questions requiring confirmation from the relevant utility party. On the coordinated drawings, identify the spaces, routes and access associated with the proposed service arrangement. Ask who is responsible for information gathering, formal submission, on-site works and responses to comments. Compare those boundaries with the owner, landlord and consultant appointments so an unassigned connection task remains visible in the project scope."],
      },
      {
        title: "Link utility readiness to commissioning",
        paragraphs: ["Keep a register of submission references, outstanding comments and the drawings affected by each response. Ask the appointed team to identify the inspections, test records and enabling works relevant to the actual connection plan. Track the status of permanent and any temporary supply assumptions against equipment testing and handover activities. Confirm the current project requirements with DEWA and the appointed professionals before fixing a release date; this record supports coordination without promising approval or energisation timing."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse MEP coordination", href: "/warehouse/warehouse-mep", context: "Carry the demand assessment into the internal distribution and building-services design." },
      { label: "Warehouse utility services", href: "/warehouse/warehouse-utility-services", context: "Review utility routes and plot-level works alongside the connection enquiry." },
      { label: "Cold storage warehouse", href: "/warehouse/cold-storage-warehouse", context: "Develop refrigeration and operating inputs where cold-chain equipment forms part of the demand brief." },
    ],
  },
  "warehouse-fire-fighting": {
    purpose: "Fire-fighting coordination begins with a clear storage and operating brief for the appointed fire-safety professionals. This resource focuses on the construction interfaces and evidence needed to carry that project-specific design through installation, testing and handover.",
    sections: [
      {
        title: "Keep the storage brief tied to the design",
        paragraphs: ["Record the goods being stored, proposed rack arrangement, storage configuration and relevant operating activities for the specialist designer's assessment. Identify which parts of the brief are confirmed and which may change. Give later layout or commodity changes an owner and review status before equipment is ordered or installed. Retain the designer's current basis with the coordinated drawings so the construction team can recognise when an operational change needs a renewed design review."],
      },
      {
        title: "Resolve physical and services interfaces",
        paragraphs: ["Review the proposed equipment locations, water-supply arrangements, pipe routes, access and maintainability with the relevant designers and suppliers. Compare the system layout with racks, structural members, ceilings and other services before installation closes those spaces. Record fire-alarm and electrical interfaces with the party responsible for coordinating them. Use a drawing and issue register to close clashes and approved changes, rather than allowing separate specialists to assume that another package has resolved the same interface."],
      },
      {
        title: "Agree the installation and handover evidence",
        paragraphs: ["Ask the appointed professional to identify the project's inspection and testing plan, including the records and attendance needed at relevant stages. Link equipment submittals, installation observations, approved changes and test evidence to the current design set. Keep outstanding actions visible before the system is offered for the applicable inspection or operational acceptance. At handover, confirm who receives the operating information and who owns future changes to the warehouse layout or use that may affect the installed system."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse DCD approvals", href: "/warehouse/warehouse-dcd-approvals", context: "Coordinate the project-specific submission and inspection record with the fire-safety design team." },
      { label: "Warehouse fire alarm", href: "/warehouse/warehouse-fire-alarm", context: "Review detection, alarm and system interface responsibilities alongside fire-fighting installation." },
      { label: "Warehouse safety standards", href: "/warehouse/warehouse-safety-standards", context: "Keep construction work controls and operating safety responsibilities visible during installation." },
    ],
  },
  "warehouse-fit-out": {
    purpose: "Warehouse fit-out turns a shell or existing premises into a usable tenant layout. The following checks help connect tenant activities, base-building information and specialist work packages before partitions, finishes and services conceal unresolved interfaces.",
    sections: [
      {
        title: "Record the base-building and tenant boundary",
        paragraphs: ["Obtain the available landlord drawings and describe the condition and services being handed to the tenant team. List proposed tenant work separately from existing or landlord-provided installations. Record who verifies connection points, retained systems, fire-rated boundaries and existing defects relevant to the fit-out. Give assumptions an owner and status before tendering so bidders can identify the work they are pricing and the information that still needs confirmation."],
      },
      {
        title: "Coordinate storage, offices and service access",
        paragraphs: ["Review the warehouse operation, racks, office and welfare spaces on one current layout with the appointed designers. Compare doors, circulation, ceiling zones and service access with the intended occupancy and maintenance needs. Track penetrations and above-ceiling interfaces through the relevant specialist packages before the affected area is closed. If the tenant layout changes, identify its effect on the coordinated drawings and existing building systems before instructing the revised work."],
      },
      {
        title: "Plan tie-ins and tenant readiness",
        paragraphs: ["Where works connect to a live building, agree access, isolation and reinstatement arrangements with the responsible operator and specialists. Record which tests, documents and snag closures are needed before each area is released for use under the project plan. Include the tenant's equipment and furniture installation in the readiness discussion, with ownership of any remaining interface. Keep the final layout, approved changes and operating records together so later maintenance can find the installed service and fit-out information."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse office construction", href: "/warehouse/warehouse-office-construction", context: "Develop the office and administrative accommodation within the tenant layout." },
      { label: "Warehouse MEP coordination", href: "/warehouse/warehouse-mep", context: "Resolve the services and access interfaces before partitions and ceilings close." },
      { label: "Warehouse flooring", href: "/warehouse/warehouse-flooring", context: "Agree the operating floor condition and finish scope for the fit-out handover." },
    ],
  },
  "warehouse-flooring": {
    purpose: "A warehouse floor enquiry needs an operating performance brief and evidence about the receiving surface. These checks help separate new floor work, repairs and finishes so the owner and designer can compare proposals against the actual slab condition and warehouse use.",
    sections: [
      {
        title: "Describe how each floor zone will operate",
        paragraphs: ["Mark rack locations, handling routes, work areas and cleaning activities on the floor plan. Ask the operator and relevant suppliers to identify the performance information the designer needs for each zone, including equipment and traffic assumptions. Record which areas are new construction and which retain an existing slab. Keep the agreed use linked to the finish and acceptance brief so a change in handling equipment or layout can be assessed before it becomes a flooring variation."],
      },
      {
        title: "Establish the substrate and repair basis",
        paragraphs: ["For existing floors, record visible defects, previous repairs, joints and available construction information. Ask the appointed specialist what investigation is needed to assess the proposed treatment and any unresolved condition. Distinguish local repair, surface preparation and finish work in the quotation request. Explain access restrictions and the areas that remain operational. A controlled condition record allows proposals to state their assumptions and identify which quantities or methods still depend on further inspection."],
      },
      {
        title: "Agree acceptance and return-to-use conditions",
        paragraphs: ["Ask the designer or specialist to define the project-specific checks for the selected floor system and how results will be recorded. Agree representative sample areas or finish references where relevant to the chosen work. Coordinate protection, access and follow-on trades with the installation sequence. Before the operator resumes use, confirm the applicable release conditions, joint or repair records and care information. Keep that evidence with the floor plan so future damage and proposed layout changes can be reviewed against the installed scope."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse concrete works", href: "/warehouse/warehouse-concrete-works", context: "Review the slab placement and construction records supporting a new floor system." },
      { label: "Warehouse foundations", href: "/warehouse/warehouse-foundations", context: "Keep the underlying structural and ground assumptions visible when floor concerns need designer review." },
      { label: "Warehouse maintenance", href: "/warehouse/warehouse-maintenance", context: "Carry the condition and repair record into ongoing floor care and defect follow-up." },
    ],
  },
  "warehouse-foundations": {
    purpose: "The foundation brief connects ground information to the structural loads and site interfaces assessed by the appointed engineer. These checks focus on the evidence, setting-out and inspection records needed to construct that design with a traceable substructure handover.",
    sections: [
      {
        title: "Connect ground and load information",
        paragraphs: ["Collect the available site investigation, ground-level information and structural layout for the engineer's review. Record the source and revision of column reactions, equipment support requirements and proposed future changes being assessed. Identify missing information and the party responsible for obtaining it. Ask the designer to explain the foundation drawing basis and any construction assumptions requiring verification on site, keeping those questions separate from the finished slab or flooring specification."],
      },
      {
        title: "Review excavation and setting-out interfaces",
        paragraphs: ["Compare foundation positions and levels with site access, known services, adjoining structures and the coordinated building layout. Ask the responsible professionals to establish the excavation, formation verification and temporary work arrangements relevant to the actual site. Record survey checks and any unexpected conditions before proceeding with the affected work. Where structural steel or equipment anchors interface with the substructure, retain the coordinated setting-out information and assign responsibility for checking it before concealment."],
      },
      {
        title: "Retain the substructure release record",
        paragraphs: ["Link inspected foundation areas to the current drawings, consultant observations and agreed inspection plan. Record approved changes, reinforcement and embedded-item checks, concrete placement evidence and relevant survey results in the same element register. Give unresolved conditions a responsible professional and a documented disposition. Before the next structural activity, confirm the project release conditions and the receiving team's information needs. These records let the final handover show what was constructed below ground and how changes were authorised."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse concrete works", href: "/warehouse/warehouse-concrete-works", context: "Carry the foundation design and inspection basis into concrete placement records." },
      { label: "Warehouse structural steel", href: "/warehouse/warehouse-structural-steel", context: "Coordinate foundation setting-out and anchor information with the receiving steel package." },
      { label: "Warehouse flooring", href: "/warehouse/warehouse-flooring", context: "Review the separate operating floor brief alongside the underlying substructure interfaces." },
    ],
  },
  "warehouse-infrastructure": {
    purpose: "Warehouse infrastructure connects the building to the plot and surrounding services. This brief focuses on levels, utility corridors, drainage and external-work responsibilities so the team can coordinate buried and surface interfaces before the yard is completed.",
    sections: [
      {
        title: "Map the plot-edge responsibilities",
        paragraphs: ["Record the available survey, plot boundaries, known service information and proposed external connections on a controlled plan. Identify which works sit within the owner's scope and which involve a utility provider, landlord, master developer or another appointed party. Give each uncertain interface a named owner and the evidence needed to confirm it. Carry that boundary record into pricing so external connections and access arrangements are reviewed as explicit work packages."],
      },
      {
        title: "Coordinate levels and buried service routes",
        paragraphs: ["Ask the civil and services designers to review finished levels, building thresholds, drainage routes and utility corridors together. Compare the proposed layout with docks, roadways, parking and maintainable access to chambers or equipment. Identify crossings and work that will become concealed beneath later construction. Record the agreed inspections, survey information and drawing updates before backfilling or closing the area so the surface works are based on coordinated underground information."],
      },
      {
        title: "Sequence connections with yard completion",
        paragraphs: ["Create a sequence showing utility works, connection access, testing and reinstatement beside the planned pavement and landscape activities. Review how temporary routes or excavations affect warehouse access and vehicle movement. Assign responsibility for checking completed interfaces and providing the relevant records before adjoining work proceeds. At handover, retain the location and condition information for buried services with approved changes, access arrangements and outstanding connection actions, helping the operator plan future maintenance or alterations."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse utility services", href: "/warehouse/warehouse-utility-services", context: "Develop the utility corridor and connection interfaces within the external works plan." },
      { label: "Warehouse road works", href: "/warehouse/warehouse-road-works", context: "Coordinate access construction with buried services, drainage and finished levels." },
      { label: "Loading dock construction", href: "/warehouse/warehouse-loading-dock-construction", context: "Check the building threshold and dock interfaces affected by yard levels and routes." },
    ],
  },
  "warehouse-loading-dock-construction": {
    purpose: "A loading dock brings the vehicle fleet, dock equipment and building structure together at one interface. These checks help the operator, designer and equipment supplier agree a coordinated construction basis before setting out the dock and surrounding yard.",
    sections: [
      {
        title: "Start with the actual vehicle and goods brief",
        paragraphs: ["List the vehicle types expected to use the dock and the information available about their loading arrangements. Describe the handling equipment, goods movement and busiest loading scenario with the operator. Identify any fleet or operating assumptions still under review. Give these inputs to the appointed designers and dock supplier so they can assess the equipment and approach arrangement against the intended operation, with unanswered questions recorded before the structural details are frozen."],
      },
      {
        title: "Coordinate the dock equipment setting-out",
        paragraphs: ["Review the supplier's current installation information alongside the structural opening, concrete edge, doors, external levels and service requirements. Ask the responsible designers to identify the support, fixing, clearance and drainage details for the selected equipment. Record who verifies each interface and which drawings will be used on site. Treat a supplier or fleet change as a coordinated review item so construction teams receive updated information across the affected concrete, steel, door and electrical packages."],
      },
      {
        title: "Review operation before releasing the dock",
        paragraphs: ["Bring the approach, parking and pedestrian arrangements into the installation and readiness review. Confirm that the relevant supplier and appointed team have recorded the project's installation checks, operating information and remaining actions. Walk the planned loading process with the operator, noting access or maintenance constraints needing attention. Keep equipment documents and approved changes with the dock layout so future vehicle or loading changes can be referred back to an identifiable installation basis."],
      },
    ],
    contextualLinks: [
      { label: "Distribution centre construction", href: "/warehouse/distribution-centre-construction", context: "Test dock demand against the centre's receiving, staging and dispatch operation." },
      { label: "Warehouse concrete works", href: "/warehouse/warehouse-concrete-works", context: "Coordinate equipment support and opening details before concrete placement." },
      { label: "Warehouse parking construction", href: "/warehouse/warehouse-parking-construction", context: "Review approach, waiting and pedestrian arrangements around the loading area." },
    ],
  },
  "warehouse-maintenance": {
    purpose: "A useful maintenance enquiry describes an asset's condition, operating constraints and repair priorities. These checks help facility managers create a traceable work record and distinguish a specific maintenance intervention from a wider renovation or change to the building.",
    sections: [
      {
        title: "Create a location-based condition record",
        paragraphs: ["Identify the affected floor, roof, envelope, door or service area on a current plan. Record the observed issue, available photographs, previous repairs and the operator's account of when it occurs. Refer safety-critical or uncertain conditions to the relevant qualified professional for assessment. Give each investigation or action an owner and status so recurring defects can be followed through the records rather than described afresh at every contractor visit."],
      },
      {
        title: "Define the repair and access scope",
        paragraphs: ["Ask the appointed specialist to explain the investigation and proposed repair basis, including assumptions that depend on opening up or testing. Record quantities, access equipment, isolation needs and protection of goods or occupied areas in the enquiry. Agree the operator's availability and the party coordinating each affected system. If investigation reveals a wider alteration, keep the changed scope visible for designer and authority review where applicable before treating it as an extension of the original repair."],
      },
      {
        title: "Close the action and retain the follow-up basis",
        paragraphs: ["Agree the relevant completion evidence with the specialist and operator, including observations, test records or care information appropriate to the repair. Confirm that isolated or affected systems have been returned to the agreed operating condition by the responsible parties. Update the condition record with the completed work, remaining concerns and recommended follow-up from the appointed professional. Future maintenance planning can then use the asset's actual history and condition instead of an unsupported universal replacement interval."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse flooring", href: "/warehouse/warehouse-flooring", context: "Develop a floor-specific investigation, treatment and acceptance brief where damage is observed." },
      { label: "Warehouse roofing", href: "/warehouse/warehouse-roofing", context: "Review roof and weatherproofing interfaces when leaks or envelope defects affect operations." },
      { label: "Warehouse renovation", href: "/warehouse/warehouse-renovation", context: "Assess a wider alteration separately when investigation expands the original maintenance scope." },
    ],
  },
  "warehouse-planning": {
    purpose: "Warehouse planning creates the operating and site brief before a delivery route or construction package is selected. The exercise below helps owners document their options, distinguish confirmed needs from future assumptions and identify the decisions that make design development useful.",
    sections: [
      {
        title: "Describe the operation before allocating space",
        paragraphs: ["Record the goods profile, storage method, handling equipment, receiving and dispatch pattern, staffing and special operating needs. Ask the operator to show how goods and people move during an ordinary period and a busy one. Identify the information still needed from suppliers or users. Keep those assumptions together so proposed area, height and circulation options can be reviewed against an agreed use rather than a drawing that has already fixed the building arrangement."],
      },
      {
        title: "Compare options against site constraints",
        paragraphs: ["Use the available plot or existing-building information to review access, known utilities, current approvals and landlord or jurisdiction questions with the appointed team. Compare the feasible layout options using the same operating brief. Record which options depend on further investigation or another party's confirmation. Identify current requirements and future ambitions separately, asking the designers to state what has actually been assessed before an expansion or equipment allowance is relied on."],
      },
      {
        title: "Choose the next decision and delivery brief",
        paragraphs: ["Summarise the preferred option, remaining questions and information owners in a decision register. Agree which drawings and specialist inputs are needed for the next pricing or appointment stage. Review whether the owner needs separate design appointments, a design and build proposal or another delivery arrangement, with responsibilities described explicitly. Carry the unresolved decisions into the cost and programme basis so a developing concept can progress through controlled choices without presenting early assumptions as a fully coordinated design."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse design and build", href: "/warehouse/warehouse-design-build", context: "Translate the selected operating option into design responsibilities and release decisions." },
      { label: "Warehouse cost guide", href: "/warehouse/warehouse-cost-guide", context: "Carry confirmed needs and unresolved options into a transparent pricing basis." },
      { label: "Warehouse construction timeline", href: "/warehouse/warehouse-construction-timeline", context: "Map the remaining planning decisions to their procurement and construction dependencies." },
    ],
  },
  "warehouse-safety-standards": {
    purpose: "Warehouse safety planning spans construction activity and the intended operation. These checks help owners keep work controls, specialist design responsibilities and changes to the operating layout in separate, traceable records that the relevant appointed professionals can assess.",
    sections: [
      {
        title: "Describe the work and the people it affects",
        paragraphs: ["Identify the proposed construction or maintenance activities, access routes and adjacent occupied areas. Record where lifting, excavation, deliveries, temporary works or service isolation create questions for the responsible site and specialist teams. Include contractors, staff, visitors and emergency access in the coordination discussion. Ask the appointed competent parties to establish the controls relevant to the actual work, with ownership and communication recorded before the affected activity begins."],
      },
      {
        title: "Coordinate live operations and construction changes",
        paragraphs: ["Where part of the warehouse remains in use, agree how people, vehicles, goods and work areas will be coordinated with the operator. Track changes to segregation, access and isolated systems as the work progresses. Keep temporary construction arrangements distinct from the permanent building design record. A revised rack layout, commodity profile or occupancy should be referred to the relevant designers for assessment of its operating and fire-safety implications before it is assumed compatible with existing information."],
      },
      {
        title: "Make release and handover responsibilities visible",
        paragraphs: ["Agree how observations, corrective actions and specialist checks will be recorded and reviewed under the project arrangements. Identify the party confirming that a work area or affected system is ready for the planned next activity. At handover, provide the operator with the relevant layout, system information and outstanding actions, assigning responsibility for later changes. Applicable standards and formal approval requirements should be confirmed for the actual jurisdiction, use and scope by the appointed professionals and authorities."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse fire-fighting coordination", href: "/warehouse/warehouse-fire-fighting", context: "Review storage and physical system interfaces with the appointed fire-safety designers." },
      { label: "Warehouse DCD approvals", href: "/warehouse/warehouse-dcd-approvals", context: "Keep the formal fire-safety submission and inspection record connected to the project scope." },
      { label: "Warehouse maintenance", href: "/warehouse/warehouse-maintenance", context: "Record condition, access and reinstatement responsibilities for work within an operating asset." },
    ],
    metaDescription: "Warehouse Safety Standards: review operations, civil and structural interfaces, utilities, authority dependencies, site controls and handover evidence.",
  },
  "warehouse-structural-steel": {
    purpose: "Structural steel coordination connects the frame design, fabrication information and site erection plan. These checks focus on document release, setting-out interfaces and traceable installation evidence, with structural design and temporary stability decisions remaining with the appointed professionals.",
    sections: [
      {
        title: "Coordinate fabrication information with the building",
        paragraphs: ["Track the current structural drawings and relevant connection information alongside fabrication submittals. Compare the frame with openings, service penetrations, dock or equipment interfaces and envelope supports before the affected components are released. Record who reviews each interface and how approved changes reach the fabricator. Keep unresolved questions visible in the drawing register so the steel package is based on a coordinated design set rather than separate assumptions from adjoining trades."],
      },
      {
        title: "Check the receiving site and erection basis",
        paragraphs: ["Review foundation and anchor survey information against the steel setting-out drawings with the responsible team. Ask the appointed parties to establish the lifting, access and erection sequence, including the temporary stability arrangements appropriate to the actual structure. Record the approved method and the inspections or release points identified for the project. Refer unexpected site differences to the designer before changing a connection or support detail to suit the conditions encountered."],
      },
      {
        title: "Retain inspection and change records",
        paragraphs: ["Link delivered components and installation areas to their approved fabrication information and the relevant project quality records. Record the inspections, connection evidence and coating or protection information specified by the appointed team. Keep approved site modifications with the affected drawings and communicate their consequences to roof, wall and services packages. At structural handover, provide the receiving team with current survey, inspection and change records so later work can proceed from an identifiable frame configuration."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse foundations", href: "/warehouse/warehouse-foundations", context: "Coordinate foundation and anchor setting-out evidence before the steel package reaches site." },
      { label: "Steel warehouse construction", href: "/warehouse/steel-warehouse-construction", context: "Review the frame's relationship to the wider warehouse building and delivery scope." },
      { label: "Warehouse roofing", href: "/warehouse/warehouse-roofing", context: "Carry approved support, opening and frame changes into the envelope package." },
    ],
    metaDescription: "Warehouse Structural Steel: review operations, civil and structural interfaces, utilities, authority dependencies, site controls and handover evidence.",
  },
  "warehouse-turnkey-contractor": {
    purpose: "A turnkey enquiry needs an explicit definition of the warehouse being handed over and the packages included in that outcome. These checks help owners review scope boundaries, specialist responsibilities and acceptance evidence before comparing end-to-end delivery proposals.",
    sections: [
      {
        title: "Define the completed operating scope",
        paragraphs: ["Describe the warehouse condition the owner expects at handover, covering the shell, external works, services and operating fit-out relevant to the enquiry. Identify where racks, production equipment, specialist systems, utility connections or tenant items are supplied under separate appointments. Ask bidders to explain the limits of each included package and the information they have used. Keep these boundaries beside the proposal so the term turnkey refers to a recorded scope and an agreed readiness outcome."],
      },
      {
        title: "Assign each specialist and owner interface",
        paragraphs: ["Use a responsibility schedule to identify who develops the design, procures each specialist item, coordinates formal submissions and manages connections between packages. Record owner-supplied information and equipment with the dates and access arrangements needed by the delivery team. Ask how changes or unresolved specialist inputs affect price and programme assumptions. The appointment discussion should produce identifiable owners for these interfaces, making it easier to follow an issue from enquiry through procurement and site delivery."],
      },
      {
        title: "Tie package completion to acceptance evidence",
        paragraphs: ["For each included package, agree the drawings, checks, test records, operating information and outstanding-action process relevant to handover. Review how separately appointed suppliers contribute to integrated readiness and who coordinates their attendance. Compare proposals using this acceptance basis alongside exclusions and allowances. Retain the final scope record and approved changes with the handover information so the owner can see what was delivered, which dependencies were closed and which ongoing responsibilities belong to the operator or another party."],
      },
    ],
    contextualLinks: [
      { label: "Warehouse completion", href: "/warehouse/warehouse-completion", context: "Develop the package acceptance and document record used to define handover readiness." },
      { label: "Warehouse fit-out", href: "/warehouse/warehouse-fit-out", context: "Clarify tenant and operational fit-out boundaries within the turnkey proposal." },
      { label: "Warehouse design and build", href: "/warehouse/warehouse-design-build", context: "Review how the agreed delivery scope assigns design decisions and drawing release responsibilities." },
    ],
    metaDescription: "Warehouse Turnkey Contractor: review operations, civil and structural interfaces, utilities, authority dependencies, site controls and handover evidence.",
  },
} satisfies Record<WarehouseIndexingSlug, WarehouseIndexingContent>;

export function getWarehouseIndexingContent(slug: string): WarehouseIndexingContent | undefined {
  return Object.hasOwn(warehouseIndexingContentBySlug, slug)
    ? warehouseIndexingContentBySlug[slug as WarehouseIndexingSlug]
    : undefined;
}
