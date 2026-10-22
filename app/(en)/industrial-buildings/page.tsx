import { ServiceDetailPage } from "@/components/ServiceDetailPage";
import { industrialContent, industrialMetadata } from "@/data/industrialContent";
import { createMetadataResolver } from "@/data/seo";
import { getServiceDeepContent } from "@/data/serviceDeepContent";
import { services } from "@/data/site";

const service = services.find((item) => item.href === "/industrial-buildings")!;
const deepContent = getServiceDeepContent(service);

export const generateMetadata = createMetadataResolver({
  title: industrialMetadata.title,
  description: industrialMetadata.description,
  path: service.href,
  keywords: deepContent.semanticKeywords,
  image: service.image,
  imageAlt: service.imageAlt,
});

export default function IndustrialBuildingsPage() {
  return <ServiceDetailPage service={service} content={industrialContent} />;
}
