import generatedPublicationData from "./publications.generated.json";

export type RecentPublication = {
  key: string;
  title: string;
  summary: string;
  summaryOrigin: "manual" | "abstract" | "title";
  authors: string[];
  date: string;
  year: number;
  venue: string;
  citation: string;
  href: string;
  doi: string;
  type: string;
  arxivId?: string;
  openAlexId?: string;
  semanticScholarId?: string;
  sources: string[];
  validatedBy: string[];
};

type PublicationData = {
  meta: {
    author: {
      name: string;
      openAlexId: string;
      semanticScholarIds: string[];
      googleScholarUrl: string;
    };
    sources: string[];
    rollingWindowMonths: number;
    cutoffDate: string;
    lastContentChange: string | null;
  };
  publications: RecentPublication[];
};

const publicationData = generatedPublicationData as PublicationData;

export const publicationFeedMeta = publicationData.meta;
export const recentPublications = publicationData.publications;

export function rollingPublicationCutoff(referenceDate = new Date()) {
  const cutoff = new Date(referenceDate);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 2);
  return cutoff.toISOString().slice(0, 10);
}

export function isWithinRollingPublicationWindow(publicationDate: string, referenceDate = new Date()) {
  return publicationDate >= rollingPublicationCutoff(referenceDate);
}
