import { ServiceDetailPage } from "@/components/ServiceDetailPage";
import { WarehouseServiceOverview, WarehouseServiceSections, warehouseServiceKeywords } from "@/components/WarehouseServiceContent";
import { createMetadataResolver } from "@/data/seo";
import { getServiceDeepContent } from "@/data/serviceDeepContent";
import { services } from "@/data/site";

const service = services.find((item) => item.href === "/warehouse-construction")!;
const deepContent = getServiceDeepContent(service);

export const generateMetadata = createMetadataResolver({
  title: deepContent.seoTitle,
  description: deepContent.metaDescription,
  path: service.href,
  keywords: Array.from(new Set([...warehouseServiceKeywords, ...deepContent.semanticKeywords])),
  image: service.image,
  imageAlt: service.imageAlt,
});

export default function WarehouseConstructionPage() {
  return (
    <ServiceDetailPage
      service={service}
      overviewContent={<WarehouseServiceOverview />}
      afterOverview={<WarehouseServiceSections />}
      showVideo={false}
    />
  );
}
