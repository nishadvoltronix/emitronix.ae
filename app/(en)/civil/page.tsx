import { ServiceDetailPage, type ServiceDetailContent } from "@/components/ServiceDetailPage";
import { getServiceDeepContent } from "@/data/serviceDeepContent";
import { services } from "@/data/site";
import { createMetadataResolver } from "@/data/seo";

const service = services.find((item) => item.href === "/civil")!;
const deepContent = getServiceDeepContent(service);
const content = {
  title: "Civil Contracting Services in Dubai",
  description: "We provide civil contracting services for G+4 buildings, villas, warehouses, and commercial and industrial developments across Dubai and the UAE.",
  overview: {
    title: "Our Civil Contracting Approach",
    paragraphs: [
      "Every civil construction project begins with an assessment of the project requirements, approved drawings, site conditions and applicable authority approvals. These factors help define the scope of work, responsibilities and handover requirements.",
      "Emitronix focuses on buildability, site logistics, engineering coordination, inspection readiness and project documentation to support informed decisions and smoother project execution.",
    ],
  },
  documents: {
    title: "Civil Construction Documents and Deliverables",
    description: "The required documents and deliverables depend on the project scope, appointed consultants and contractors, and applicable authority requirements.",
    documentsTitle: "Documents Required for Civil Works",
    documents: [
      "Approved architectural drawings",
      "Structural drawings and calculations",
      "Site plans and plot details",
      "Construction method statements",
      "Material approval submittals",
      "Site inspection requests",
      "NOCs and authority comments",
      "As-built drawings and project close-out documents",
    ],
    deliverablesTitle: "Civil Project Deliverables",
    deliverables: [
      "Civil works execution plan",
      "Site mobilisation and logistics assessment",
      "Structural and masonry works coordination",
      "Inspection and approval tracking",
      "Snagging and handover documentation",
      "Support with authority-related project close-out",
    ],
  },
} satisfies ServiceDetailContent;

export const generateMetadata = createMetadataResolver({
  title: `${content.title} | Emitronix`,
  description: content.description,
  path: service.href,
  keywords: deepContent.semanticKeywords,
  image: service.image,
  imageAlt: service.imageAlt,
});

export default function CivilPage() {
  return <ServiceDetailPage service={service} content={content} />;
}
