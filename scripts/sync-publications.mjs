#!/usr/bin/env node

import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";

const AUTHOR = {
  name: "Jared P. Whitehead",
  openAlexId: "A5033349928",
  semanticScholarIds: ["47224789", "2300737312", "2284679080"],
  googleScholarUrl: "https://scholar.google.com/citations?user=lLR_YEYAAAAJ",
};

const CROSSREF_CANDIDATE_ORCID = "0000-0003-1936-0754";
const BYU_OPENALEX_ID = "I100005738";
const BYU_ROR = "https://ror.org/047rhhm47";
const CONTACT_EMAIL = "whitehead@mathematics.byu.edu";
const MAX_RECORDS = 24;
const RETRY_DELAYS_MS = [0, 750, 2_000, 5_000];
const ARXIV_RETRY_DELAYS_MS = [0, 3_000, 10_000, 30_000];
const REQUEST_TIMEOUT_MS = 25_000;
const ALLOWED_OPENALEX_TYPES = new Set(["article", "book", "book-chapter", "preprint"]);
const ALLOWED_CROSSREF_TYPES = new Set(["journal-article", "book", "book-chapter"]);
const ARXIV_SOURCE_NAME = "arXiv";
const SOURCE_NAMES = ["OpenAlex", "Crossref", "Semantic Scholar", ARXIV_SOURCE_NAME];

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const dataPath = fileURLToPath(new URL("../content/publications.generated.json", import.meta.url));
const overridesPath = fileURLToPath(new URL("../content/publication-overrides.json", import.meta.url));
const syncDate = process.env.PUBLICATIONS_SYNC_DATE ? new Date(process.env.PUBLICATIONS_SYNC_DATE) : new Date();

if (Number.isNaN(syncDate.valueOf())) throw new Error("PUBLICATIONS_SYNC_DATE must be a valid date when provided.");

const cutoff = new Date(syncDate);
cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 2);
const CUTOFF_DATE = cutoff.toISOString().slice(0, 10);

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

function decodeEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity);
}

function cleanText(value) {
  if (!value) return "";
  return decodeEntities(String(value).replace(/<[^>]*>/g, " "))
    .replace(/^\s*abstract\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDoi(value) {
  if (!value) return "";
  return String(value)
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .toLowerCase();
}

function publisherDoi(value) {
  const doi = normalizeDoi(value);
  return doi.startsWith("10.48550/arxiv.") ? "" : doi;
}

function normalizeArxivId(value) {
  if (!value) return "";
  const text = String(value).trim();
  const modern = text.match(/(?:arxiv[:./]|\/abs\/)?(\d{4}\.\d{4,5})(?:v\d+)?(?:$|[?#])/i);
  if (modern) return modern[1];

  const legacy = text.match(/(?:arxiv[:./]|\/abs\/)?([a-z-]+(?:\.[a-z-]+)?\/\d{7})(?:v\d+)?(?:$|[?#])/i);
  return legacy?.[1] ?? "";
}

function normalizePersonName(value) {
  const cleaned = cleanText(value).toLowerCase();
  const parts = cleaned.includes(",")
    ? cleaned.split(",").map((part) => part.trim()).reverse()
    : [cleaned];

  return parts
    .join(" ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizedTitle(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function recordKey({ doi, arxivId, openAlexId, title }) {
  const normalizedDoi = publisherDoi(doi);
  if (normalizedDoi) return `doi:${normalizedDoi}`;
  if (arxivId) return `arxiv:${normalizeArxivId(arxivId)}`;
  if (openAlexId) return `openalex:${String(openAlexId).split("/").at(-1)}`;
  return `title:${normalizedTitle(title)}`;
}

function validDate(value, fallbackYear) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return value;
  if (Number.isInteger(fallbackYear)) return `${fallbackYear}-01-01`;
  return "1900-01-01";
}

function dateFromParts(parts) {
  if (!Array.isArray(parts) || !Number.isInteger(parts[0])) return "";
  const [year, month = 1, day = 1] = parts;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== "object") return "";
  const words = [];

  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (!Array.isArray(positions)) continue;
    for (const position of positions) words[position] = word;
  }

  return cleanText(words.filter(Boolean).join(" "));
}

function authorNames(authorships) {
  return (authorships ?? [])
    .map((authorship) => cleanText(authorship?.author?.display_name))
    .filter(Boolean);
}

function crossrefAuthorNames(authors) {
  return (authors ?? [])
    .map((author) => cleanText([author?.given, author?.family].filter(Boolean).join(" ")))
    .filter(Boolean);
}

function hasByuAffiliation(affiliations) {
  return (affiliations ?? []).some((affiliation) => {
    const text = cleanText(affiliation?.name ?? affiliation).toLowerCase();
    const identifiers = (affiliation?.id ?? []).map((identifier) => String(identifier?.id ?? "").toLowerCase());
    return text.includes("brigham young") || identifiers.includes(BYU_ROR);
  });
}

function hasTargetCrossrefAuthor(authors) {
  return (authors ?? []).some((author) => {
    const given = cleanText(author?.given).toLowerCase();
    const family = cleanText(author?.family).toLowerCase();
    const nameMatches = family === "whitehead" && (given.startsWith("jared") || /^j\.?\s*p\.?$/.test(given));
    return nameMatches && hasByuAffiliation(author?.affiliation);
  });
}

function hasTargetOpenAlexAuthorship(authorships) {
  return (authorships ?? []).some((authorship) => {
    const authorId = String(authorship?.author?.id ?? "").split("/").at(-1);
    if (authorId !== AUTHOR.openAlexId) return false;

    const institutionMatches = (authorship.institutions ?? []).some((institution) =>
      String(institution?.id ?? "").endsWith(`/${BYU_OPENALEX_ID}`) || institution?.ror === BYU_ROR,
    );
    const affiliationMatches = (authorship.raw_affiliation_strings ?? []).some((affiliation) =>
      cleanText(affiliation).toLowerCase().includes("brigham young"),
    );
    return institutionMatches || affiliationMatches;
  });
}

function citationFor({ venue, volume, issue, pages, year }) {
  const volumeIssue = [volume, issue ? `(${issue})` : ""].filter(Boolean).join("");
  return [venue, volumeIssue, pages, year ? `(${year})` : ""].filter(Boolean).join(", ");
}

function openAlexRecord(work) {
  if (!ALLOWED_OPENALEX_TYPES.has(work?.type) || !hasTargetOpenAlexAuthorship(work?.authorships)) return null;

  const title = cleanText(work.title ?? work.display_name);
  if (!title) return null;

  const arxivId = normalizeArxivId(work.doi)
    || normalizeArxivId(work.primary_location?.landing_page_url)
    || normalizeArxivId(work.primary_location?.pdf_url);
  const isPreprint = work.type === "preprint" || (!publisherDoi(work.doi) && Boolean(arxivId));
  const doi = publisherDoi(work.doi);
  const date = validDate(work.publication_date, work.publication_year);
  const venue = isPreprint ? ARXIV_SOURCE_NAME : cleanText(work.primary_location?.source?.display_name);
  const biblio = work.biblio ?? {};
  const record = {
    openAlexId: String(work.id ?? "").split("/").at(-1) ?? "",
    arxivId,
    doi,
    title,
    date,
    year: Number(work.publication_year) || Number(date.slice(0, 4)),
    type: isPreprint ? "preprint" : work.type,
    authors: authorNames(work.authorships),
    venue,
    citation: isPreprint
      ? `arXiv:${arxivId} (${Number(work.publication_year) || Number(date.slice(0, 4))})`
      : citationFor({
          venue,
          volume: cleanText(biblio.volume),
          issue: cleanText(biblio.issue),
          pages: cleanText(biblio.first_page && biblio.last_page ? `${biblio.first_page}–${biblio.last_page}` : biblio.first_page),
          year: Number(work.publication_year) || Number(date.slice(0, 4)),
        }),
    href: doi
      ? `https://doi.org/${doi}`
      : arxivId
        ? `https://arxiv.org/abs/${arxivId}`
        : cleanText(work.primary_location?.landing_page_url ?? work.id),
    abstract: reconstructAbstract(work.abstract_inverted_index),
    sources: ["OpenAlex"],
    validatedBy: ["OpenAlex BYU affiliation"],
  };

  return { ...record, key: recordKey(record) };
}

function preferredCrossrefDate(item) {
  for (const field of ["published-online", "published-print", "published", "issued"]) {
    const date = dateFromParts(item?.[field]?.["date-parts"]?.[0]);
    if (date) return date;
  }
  return "";
}

function crossrefRecord(item) {
  if (!ALLOWED_CROSSREF_TYPES.has(item?.type) || !hasTargetCrossrefAuthor(item?.author)) return null;

  const title = cleanText(item.title?.[0]);
  const doi = normalizeDoi(item.DOI);
  const date = preferredCrossrefDate(item);
  if (!title || !date || date < CUTOFF_DATE) return null;

  const venue = cleanText(item["container-title"]?.[0] ?? item.publisher);
  const record = {
    openAlexId: "",
    arxivId: "",
    doi,
    title,
    date,
    year: Number(date.slice(0, 4)),
    type: item.type,
    authors: crossrefAuthorNames(item.author),
    venue,
    citation: citationFor({
      venue,
      volume: cleanText(item.volume),
      issue: cleanText(item.issue),
      pages: cleanText(item.page ?? item.article_number),
      year: Number(date.slice(0, 4)),
    }),
    href: doi ? `https://doi.org/${doi}` : cleanText(item.URL),
    abstract: cleanText(item.abstract),
    sources: ["Crossref"],
    validatedBy: ["Crossref BYU affiliation"],
  };

  return { ...record, key: recordKey(record) };
}

function semanticScholarRecord(paper, authorId) {
  const publicationTypes = paper?.publicationTypes ?? [];
  const arxivId = normalizeArxivId(paper?.externalIds?.ArXiv) || normalizeArxivId(paper?.externalIds?.DOI);
  const doi = publisherDoi(paper?.externalIds?.DOI);
  const isPreprint = Boolean(arxivId) && !doi;
  if (!publicationTypes.includes("JournalArticle") && !isPreprint) return null;

  const title = cleanText(paper?.title);
  const date = validDate(paper?.publicationDate, paper?.year);
  if (!title || date < CUTOFF_DATE) return null;

  const venue = isPreprint ? ARXIV_SOURCE_NAME : cleanText(paper?.journal?.name ?? paper?.venue);
  const record = {
    semanticScholarId: paper.paperId ?? "",
    openAlexId: "",
    arxivId,
    doi,
    title,
    date,
    year: Number(paper?.year) || Number(date.slice(0, 4)),
    type: isPreprint ? "preprint" : "article",
    authors: (paper?.authors ?? []).map((author) => cleanText(author?.name)).filter(Boolean),
    venue,
    citation: isPreprint
      ? `arXiv:${arxivId} (${Number(paper?.year) || Number(date.slice(0, 4))})`
      : citationFor({
          venue,
          volume: cleanText(paper?.journal?.volume),
          pages: cleanText(paper?.journal?.pages),
          year: Number(paper?.year) || Number(date.slice(0, 4)),
        }),
    href: doi
      ? `https://doi.org/${doi}`
      : arxivId
        ? `https://arxiv.org/abs/${arxivId}`
        : cleanText(paper?.url),
    abstract: cleanText(paper?.abstract),
    sources: ["Semantic Scholar"],
    validatedBy: [`Semantic Scholar author ${authorId}`],
  };

  return { ...record, key: recordKey(record) };
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function arxivAuthorData(authors) {
  return asArray(authors)
    .map((author) => ({
      name: cleanText(author?.name ?? author),
      affiliation: cleanText(author?.affiliation),
    }))
    .filter((author) => author.name);
}

function parseArxivFeed(xml) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
    parseTagValue: false,
    trimValues: true,
  });
  const feed = parser.parse(xml)?.feed;
  return asArray(feed?.entry).filter((entry) => !String(entry?.id ?? "").includes("/api/errors#"));
}

function arxivRecord(entry, { approvedArxivIds, trustedTitles }) {
  const title = cleanText(entry?.title);
  const arxivId = normalizeArxivId(entry?.id);
  const date = validDate(String(entry?.published ?? "").slice(0, 10));
  if (!title || !arxivId || date < CUTOFF_DATE) return null;

  const authorData = arxivAuthorData(entry?.author);
  const authors = authorData.map((author) => author.name);
  const exactAuthorMatch = authorData.some((author) => {
    const name = normalizePersonName(author.name);
    return name === "jared p whitehead" || name === "jared whitehead";
  });
  const byuAffiliationMatch = authorData.some((author) => {
    const name = normalizePersonName(author.name);
    return name.endsWith("whitehead") && author.affiliation.toLowerCase().includes("brigham young");
  });
  const crossIndexedMatch = trustedTitles.has(normalizedTitle(title));
  const approvedIdMatch = approvedArxivIds.has(arxivId.toLowerCase());
  const validatedBy = [
    exactAuthorMatch ? "arXiv exact author name" : "",
    byuAffiliationMatch ? "arXiv BYU affiliation" : "",
    crossIndexedMatch ? "arXiv title cross-indexed to a selected author profile" : "",
    approvedIdMatch ? "Approved arXiv identifier" : "",
  ].filter(Boolean);
  if (!validatedBy.length) return null;

  const publisherDoiValue = publisherDoi(entry?.doi);
  const year = Number(date.slice(0, 4));
  const journalReference = cleanText(entry?.journal_ref);
  const record = {
    arxivId,
    openAlexId: "",
    semanticScholarId: "",
    doi: publisherDoiValue,
    title,
    date,
    year,
    type: publisherDoiValue || journalReference ? "article" : "preprint",
    authors,
    venue: publisherDoiValue || journalReference ? journalReference : ARXIV_SOURCE_NAME,
    citation: publisherDoiValue || journalReference ? journalReference : `arXiv:${arxivId} (${year})`,
    href: publisherDoiValue ? `https://doi.org/${publisherDoiValue}` : `https://arxiv.org/abs/${arxivId}`,
    abstract: cleanText(entry?.summary),
    sources: [ARXIV_SOURCE_NAME],
    validatedBy,
  };

  return { ...record, key: recordKey(record) };
}

function seededPreprintRecord(seed) {
  const arxivId = normalizeArxivId(seed?.arxivId);
  const title = cleanText(seed?.title);
  const date = validDate(seed?.date);
  if (!arxivId || !title || date < CUTOFF_DATE) return null;

  const record = {
    arxivId,
    openAlexId: "",
    semanticScholarId: "",
    doi: "",
    title,
    date,
    year: Number(date.slice(0, 4)),
    type: "preprint",
    authors: asArray(seed?.authors).map(cleanText).filter(Boolean),
    venue: ARXIV_SOURCE_NAME,
    citation: `arXiv:${arxivId} (${date.slice(0, 4)})`,
    href: `https://arxiv.org/abs/${arxivId}`,
    abstract: cleanText(seed?.abstract),
    sources: [ARXIV_SOURCE_NAME],
    validatedBy: ["Manually verified arXiv identifier"],
  };

  return { ...record, key: recordKey(record) };
}

function mergeRecords(existing, incoming) {
  if (!existing) return incoming;

  const existingIsPublished = existing.type !== "preprint";
  const incomingIsPublished = incoming.type !== "preprint";
  const publishedRecord = incomingIsPublished && !existingIsPublished
    ? incoming
    : existingIsPublished
      ? existing
      : null;
  const incomingIsOpenAlex = incoming.sources.includes("OpenAlex") && incomingIsPublished;
  const preferIncomingTitle = incoming.title.length > existing.title.length;
  const doi = publisherDoi(existing.doi) || publisherDoi(incoming.doi);
  const arxivId = normalizeArxivId(existing.arxivId) || normalizeArxivId(incoming.arxivId);
  const type = publishedRecord?.type ?? "preprint";
  const date = publishedRecord
    ? incomingIsOpenAlex
      ? incoming.date
      : publishedRecord.date
    : existing.date || incoming.date;
  const year = Number(date.slice(0, 4));
  const venue = publishedRecord
    ? incomingIsOpenAlex
      ? incoming.venue || existing.venue
      : publishedRecord.venue
    : ARXIV_SOURCE_NAME;
  const citation = publishedRecord
    ? incomingIsOpenAlex
      ? incoming.citation || existing.citation
      : publishedRecord.citation
    : `arXiv:${arxivId} (${year})`;

  return {
    ...existing,
    openAlexId: existing.openAlexId || incoming.openAlexId,
    semanticScholarId: existing.semanticScholarId || incoming.semanticScholarId,
    arxivId,
    doi,
    title: preferIncomingTitle ? incoming.title : existing.title,
    date,
    year,
    type,
    authors: existing.authors.length >= incoming.authors.length ? existing.authors : incoming.authors,
    venue,
    citation,
    href: doi ? `https://doi.org/${doi}` : arxivId ? `https://arxiv.org/abs/${arxivId}` : incoming.href || existing.href,
    abstract: existing.abstract.length >= incoming.abstract.length ? existing.abstract : incoming.abstract,
    sources: [...new Set([...existing.sources, ...incoming.sources])].sort(),
    validatedBy: [...new Set([...(existing.validatedBy ?? []), ...(incoming.validatedBy ?? [])])].sort(),
  };
}

function recordsMatch(left, right) {
  const leftDoi = publisherDoi(left.doi);
  const rightDoi = publisherDoi(right.doi);
  const leftArxivId = normalizeArxivId(left.arxivId);
  const rightArxivId = normalizeArxivId(right.arxivId);

  return Boolean(
    (leftDoi && rightDoi && leftDoi === rightDoi)
      || (leftArxivId && rightArxivId && leftArxivId === rightArxivId)
      || (normalizedTitle(left.title) && normalizedTitle(left.title) === normalizedTitle(right.title)),
  );
}

function upsertRecord(records, incoming) {
  let matchingKey = "";
  let existing;

  for (const [key, candidate] of records) {
    if (!recordsMatch(candidate, incoming)) continue;
    matchingKey = key;
    existing = candidate;
    break;
  }

  const mergedRecord = mergeRecords(existing, incoming);
  const canonicalKey = recordKey(mergedRecord);
  if (matchingKey && matchingKey !== canonicalKey) records.delete(matchingKey);
  records.set(canonicalKey, { ...mergedRecord, key: canonicalKey });
}

function summaryScore(sentence) {
  let score = 0;
  if (/^(we|the authors|this (study|paper|work))\s+(show|demonstrate|find|establish|prove|develop|introduce|present|propose|derive|identify|recover|reconstruct)/i.test(sentence)) score += 9;
  if (/\b(show|demonstrat|find|establish|prove|develop|introduc|propos|derive|identif|recover|reconstruct|enable|explain)/i.test(sentence)) score += 5;
  if (/\b(result|method|framework|algorithm|model|analysis|evidence)\b/i.test(sentence)) score += 2;
  if (/^(background|motivated by|a central problem|in recent years|seismic risk estimates)/i.test(sentence)) score -= 4;
  const wordCount = sentence.split(/\s+/).length;
  if (wordCount >= 12 && wordCount <= 48) score += 2;
  if (wordCount > 70) score -= 3;
  return score;
}

function conciseSentence(sentence) {
  let result = cleanText(sentence)
    .replace(/^We\s+/i, "The authors ")
    .replace(/^In this (paper|article|work),?\s+we\s+/i, "The authors ");

  const words = result.split(/\s+/);
  if (words.length > 58) result = `${words.slice(0, 58).join(" ").replace(/[,;:]$/, "")}…`;
  if (!/[.!?…]$/.test(result)) result += ".";
  return result;
}

function automaticSummary(abstract, title) {
  if (!abstract) return `This publication presents new work described in “${title}.”`;

  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
  const sentences = [...segmenter.segment(abstract)]
    .map(({ segment }, index) => ({ index, sentence: cleanText(segment) }))
    .filter(({ sentence }) => sentence.split(/\s+/).length >= 8);

  if (!sentences.length) return `This publication presents new work described in “${title}.”`;

  sentences.sort((left, right) => summaryScore(right.sentence) - summaryScore(left.sentence) || left.index - right.index);
  return conciseSentence(sentences[0].sentence);
}

async function fetchJson(url, label) {
  let lastError;

  for (const [attempt, delay] of RETRY_DELAYS_MS.entries()) {
    if (delay) await sleep(delay);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          "user-agent": `WhiteheadDataModelingPublicationSync/1.0 (mailto:${CONTACT_EMAIL})`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`${label} returned HTTP ${response.status}`);
        if (response.status < 500 && response.status !== 429) throw error;
        lastError = error;
        continue;
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_DELAYS_MS.length - 1) break;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error(`${label} request failed`);
}

async function fetchText(url, label, retryDelays = RETRY_DELAYS_MS) {
  let lastError;

  for (const [attempt, delay] of retryDelays.entries()) {
    if (delay) await sleep(delay);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/atom+xml, application/xml;q=0.9, text/xml;q=0.8",
          "user-agent": `WhiteheadDataModelingPublicationSync/1.0 (mailto:${CONTACT_EMAIL})`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`${label} returned HTTP ${response.status}`);
        if (response.status < 500 && response.status !== 429) throw error;
        lastError = error;
        continue;
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt === retryDelays.length - 1) break;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error(`${label} request failed`);
}

async function fetchOpenAlex() {
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("filter", `author.id:${AUTHOR.openAlexId},from_publication_date:${CUTOFF_DATE}`);
  url.searchParams.set("sort", "publication_date:desc");
  url.searchParams.set("per-page", "100");
  url.searchParams.set("mailto", CONTACT_EMAIL);
  url.searchParams.set("select", "id,doi,title,display_name,publication_year,publication_date,type,authorships,primary_location,abstract_inverted_index,biblio");

  const payload = await fetchJson(url, "OpenAlex");
  return (payload.results ?? []).map(openAlexRecord).filter(Boolean);
}

async function fetchCrossref() {
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("filter", `orcid:${CROSSREF_CANDIDATE_ORCID},from-pub-date:${CUTOFF_DATE}`);
  url.searchParams.set("sort", "published");
  url.searchParams.set("order", "desc");
  url.searchParams.set("rows", "100");
  url.searchParams.set("mailto", CONTACT_EMAIL);

  const payload = await fetchJson(url, "Crossref");
  return (payload.message?.items ?? []).map(crossrefRecord).filter(Boolean);
}

async function fetchSemanticScholar() {
  const records = [];
  let successfulProfiles = 0;

  for (const authorId of AUTHOR.semanticScholarIds) {
    const url = new URL(`https://api.semanticscholar.org/graph/v1/author/${authorId}/papers`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("fields", "title,year,publicationDate,externalIds,authors,venue,journal,url,abstract,publicationTypes");

    try {
      const payload = await fetchJson(url, `Semantic Scholar author ${authorId}`);
      successfulProfiles += 1;
      records.push(...(payload.data ?? []).map((paper) => semanticScholarRecord(paper, authorId)).filter(Boolean));
    } catch (error) {
      console.warn(`Semantic Scholar author ${authorId} unavailable: ${error?.message ?? error}`);
    }

    await sleep(350);
  }

  if (!successfulProfiles) throw new Error("all selected Semantic Scholar author profiles were unavailable");
  return records;
}

async function fetchArxiv() {
  const url = new URL("https://export.arxiv.org/api/query");
  const from = `${CUTOFF_DATE.replaceAll("-", "")}0000`;
  const through = `${syncDate.toISOString().slice(0, 10).replaceAll("-", "")}2359`;
  url.searchParams.set("search_query", `au:whitehead_j AND submittedDate:[${from} TO ${through}]`);
  url.searchParams.set("start", "0");
  url.searchParams.set("max_results", "100");
  url.searchParams.set("sortBy", "submittedDate");
  url.searchParams.set("sortOrder", "descending");

  return parseArxivFeed(await fetchText(url, ARXIV_SOURCE_NAME, ARXIV_RETRY_DELAYS_MS));
}

function stablePayload(payload) {
  return JSON.stringify({
    ...payload,
    meta: { ...payload.meta, cutoffDate: null, lastContentChange: null },
  });
}

function normalizeOverrideIdentifier(value) {
  const text = String(value ?? "").trim();
  const arxivId = normalizeArxivId(text);
  if (arxivId && (/arxiv/i.test(text) || /^\d{4}\.\d{4,5}(?:v\d+)?$/i.test(text))) {
    return `arxiv:${arxivId.toLowerCase()}`;
  }
  return normalizeDoi(text);
}

async function main() {
  const previous = await readJson(dataPath, { publications: [] });
  const overrides = await readJson(overridesPath, {
    approvedArxivIds: [],
    exclude: [],
    preprintSeeds: [],
    summaries: {},
  });
  const previousByKey = new Map((previous.publications ?? []).map((publication) => [publication.key, publication]));
  const previousByTitle = new Map(
    (previous.publications ?? []).map((publication) => [normalizedTitle(publication.title), publication]),
  );
  const merged = new Map();

  for (const publication of (previous.publications ?? []).filter((item) => item.validatedBy?.length)) {
    upsertRecord(merged, { ...publication, abstract: "", sources: publication.sources ?? [] });
  }

  const seededPreprints = (overrides.preprintSeeds ?? []).map(seededPreprintRecord).filter(Boolean);
  for (const publication of seededPreprints) upsertRecord(merged, publication);

  const sourceResults = await Promise.allSettled([
    fetchOpenAlex(),
    fetchCrossref(),
    fetchSemanticScholar(),
    fetchArxiv(),
  ]);
  const successfulSources = [];

  sourceResults.slice(0, 3).forEach((result, index) => {
    if (result.status === "fulfilled") {
      successfulSources.push(SOURCE_NAMES[index]);
      for (const publication of result.value) upsertRecord(merged, publication);
    } else {
      console.warn(`${SOURCE_NAMES[index]} unavailable; preserving last-known-good data: ${result.reason?.message ?? result.reason}`);
    }
  });

  const trustedTitles = new Set([...merged.values()].map((publication) => normalizedTitle(publication.title)));
  const approvedArxivIds = new Set(
    (overrides.approvedArxivIds ?? []).map((value) => normalizeArxivId(value).toLowerCase()).filter(Boolean),
  );
  const arxivResult = sourceResults[3];
  if (arxivResult.status === "fulfilled") {
    successfulSources.push(ARXIV_SOURCE_NAME);
    for (const entry of arxivResult.value) {
      const publication = arxivRecord(entry, { approvedArxivIds, trustedTitles });
      if (publication) upsertRecord(merged, publication);
    }
  } else {
    console.warn(`${ARXIV_SOURCE_NAME} unavailable; preserving last-known-good data: ${arxivResult.reason?.message ?? arxivResult.reason}`);
  }

  if (!successfulSources.length && !seededPreprints.length) {
    if ((previous.publications ?? []).length) {
      console.log("No source was available. Existing publication data was left unchanged.");
      return;
    }
    throw new Error("No publication source was available and no last-known-good data exists.");
  }

  const excluded = new Set((overrides.exclude ?? []).map(normalizeOverrideIdentifier));
  const summaries = Object.fromEntries(
    Object.entries(overrides.summaries ?? {}).map(([identifier, summary]) => [normalizeOverrideIdentifier(identifier), cleanText(summary)]),
  );

  const publications = [...merged.values()]
    .filter((publication) => {
      const identifiers = [
        publication.key.toLowerCase(),
        publisherDoi(publication.doi),
        publication.arxivId ? `arxiv:${normalizeArxivId(publication.arxivId).toLowerCase()}` : "",
      ].filter(Boolean);
      return publication.date >= CUTOFF_DATE && !identifiers.some((identifier) => excluded.has(identifier));
    })
    .sort((left, right) => right.date.localeCompare(left.date) || left.title.localeCompare(right.title))
    .slice(0, MAX_RECORDS)
    .map((publication) => {
      const previousPublication = previousByKey.get(publication.key) ?? previousByTitle.get(normalizedTitle(publication.title));
      const summaryIdentifiers = [
        publication.key.toLowerCase(),
        publisherDoi(publication.doi),
        publication.arxivId ? `arxiv:${normalizeArxivId(publication.arxivId).toLowerCase()}` : "",
      ].filter(Boolean);
      const manualSummary = summaryIdentifiers.map((identifier) => summaries[identifier]).find(Boolean);
      const summary = manualSummary || previousPublication?.summary || automaticSummary(publication.abstract, publication.title);

      return {
        key: publication.key,
        title: publication.title,
        summary,
        summaryOrigin: manualSummary ? "manual" : previousPublication?.summaryOrigin ?? (publication.abstract ? "abstract" : "title"),
        authors: publication.authors,
        date: publication.date,
        year: publication.year,
        venue: publication.venue,
        citation: publication.citation,
        href: publication.href,
        doi: publication.doi,
        type: publication.type,
        arxivId: publication.arxivId,
        openAlexId: publication.openAlexId,
        semanticScholarId: publication.semanticScholarId,
        sources: publication.sources,
        validatedBy: publication.validatedBy,
      };
    });

  const next = {
    meta: {
      author: AUTHOR,
      sources: SOURCE_NAMES,
      rollingWindowMonths: 24,
      cutoffDate: CUTOFF_DATE,
      lastContentChange: null,
    },
    publications,
  };

  if (stablePayload(previous) === stablePayload(next)) {
    console.log(`Publication data is current (${publications.length} records; checked ${successfulSources.join(" and ")}).`);
    return;
  }

  next.meta.lastContentChange = new Date().toISOString();
  const temporaryPath = `${dataPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await rename(temporaryPath, dataPath);
  console.log(`Updated ${publications.length} publication records from ${successfulSources.join(" and ")} in ${projectRoot}.`);
}

await main();
