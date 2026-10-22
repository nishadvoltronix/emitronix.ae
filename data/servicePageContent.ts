import type { DeepCard, TechnicalTopic } from "@/data/serviceDeepContent";

/** Page-specific editorial copy; omitted sections retain the service defaults. */
export type ServiceDetailContent = {
  title?: string;
  description?: string;
  overview?: {
    title: string;
    paragraphs: string[];
    highlights?: DeepCard[];
  };
  documents?: {
    title: string;
    description: string;
    documentsTitle: string;
    documents: string[];
    deliverablesTitle: string;
    deliverables: string[];
  };
  audience?: { title: string; items: DeepCard[] };
  industries?: { title: string; items: DeepCard[] };
  methodology?: { title: string; description: string; steps: DeepCard[] };
  technical?: { title: string; description: string; topics: TechnicalTopic[] };
  decisions?: { title: string; description: string; items: DeepCard[] };
  controls?: {
    title: string;
    risksTitle: string;
    risks: DeepCard[];
    controlsTitle: string;
    controls: DeepCard[];
    qualityTitle: string;
    qualityChecks: string[];
    mistakesTitle: string;
    mistakes: string[];
    beforeTitle: string;
    beforeProceeding: string[];
  };
  authority?: {
    title: string;
    description: string;
    summary: string;
    requirementsTitle: string;
    requirements: DeepCard[];
    note: string;
    coverage: string;
  };
  timeline?: {
    title: string;
    description: string;
    factorsTitle: string;
    factors: DeepCard[];
    showProgrammeTable?: boolean;
  };
  resources?: {
    eyebrow: string;
    title: string;
    links: Array<DeepCard & { href: string }>;
  };
};
