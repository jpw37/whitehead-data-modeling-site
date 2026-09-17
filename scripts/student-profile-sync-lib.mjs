import { createHash } from "node:crypto";

export const PROFILE_SCHEMA_VERSION = 1;
export const RESEARCH_AREAS = [
  "Generalization in complex models",
  "Interpretable models from data",
  "Discovering cloud physics",
];

const DEGREE_LEVELS = new Set(["Undergraduate", "M.S.", "Ph.D."]);
const ACTIONS = new Set(["upsert", "remove"]);
const RESEARCH_AREA_SET = new Set(RESEARCH_AREAS);
const PROFILE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EVENT_ID_PATTERN = /^[A-Za-z0-9:_-]+$/;

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value, label, { required = false, max = 2_000 } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${label} is required.`);
    return "";
  }

  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const normalized = value.replace(/\s+/g, " ").trim();
  if (required && !normalized) throw new Error(`${label} is required.`);
  if (normalized.length > max) throw new Error(`${label} exceeds ${max} characters.`);
  return normalized;
}

function isoDate(value, label) {
  const normalized = text(value, label, { required: true, max: 40 });
  const timestamp = Date.parse(normalized);
  if (Number.isNaN(timestamp)) throw new Error(`${label} must be a valid date.`);
  return new Date(timestamp).toISOString();
}

function safeUrl(value, label) {
  const normalized = text(value, label, { max: 500 });
  if (!normalized) return "";

  const hasScheme = /^[A-Za-z][A-Za-z0-9+.-]*:/.test(normalized);
  const looksLikeDomain = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(normalized);
  const candidate = !hasScheme && looksLikeDomain ? `https://${normalized}` : normalized;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(`${label} must be a complete web address.`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`${label} must use http or https.`);
  }
  return url.toString();
}

function normalizeProfileId(value) {
  const profileId = text(value, "profileId", { required: true, max: 80 });
  if (!PROFILE_ID_PATTERN.test(profileId)) {
    throw new Error(`Invalid profileId: ${profileId}`);
  }
  return profileId;
}

function normalizeEvent(rawEvent) {
  if (!isObject(rawEvent)) throw new Error("Each feed submission must be an object.");

  const id = text(rawEvent.id, "submission id", { required: true, max: 160 });
  if (!EVENT_ID_PATTERN.test(id)) throw new Error(`Invalid submission id: ${id}`);

  const action = text(rawEvent.action, `action for ${id}`, { required: true, max: 20 });
  if (!ACTIONS.has(action)) throw new Error(`Unsupported action for ${id}: ${action}`);

  const normalized = {
    id,
    submittedAt: isoDate(rawEvent.submittedAt, `submittedAt for ${id}`),
    action,
    profileId: normalizeProfileId(rawEvent.profileId),
  };

  if (action === "remove") return normalized;

  const degreeLevel = text(rawEvent.degreeLevel, `degreeLevel for ${id}`, {
    required: true,
    max: 20,
  });
  if (!DEGREE_LEVELS.has(degreeLevel)) {
    throw new Error(`Unsupported degree level for ${id}: ${degreeLevel}`);
  }

  const researchAreas = rawEvent.researchAreas ?? [];
  if (!Array.isArray(researchAreas) || researchAreas.length > RESEARCH_AREAS.length) {
    throw new Error(`researchAreas for ${id} must be a short list.`);
  }
  const normalizedResearchAreas = [...new Set(researchAreas.map((area) =>
    text(area, `research area for ${id}`, { required: true, max: 80 }),
  ))];
  for (const area of normalizedResearchAreas) {
    if (!RESEARCH_AREA_SET.has(area)) throw new Error(`Unsupported research area for ${id}: ${area}`);
  }

  const photoToken = text(rawEvent.photoToken, `photoToken for ${id}`, { max: 160 });
  if (photoToken && !EVENT_ID_PATTERN.test(photoToken)) {
    throw new Error(`Invalid photoToken for ${id}.`);
  }
  if (photoToken && rawEvent.removePhoto === true) {
    throw new Error(`Submission ${id} cannot replace and remove a portrait at the same time.`);
  }

  return {
    ...normalized,
    name: text(rawEvent.name, `name for ${id}`, { required: true, max: 100 }),
    degreeLevel,
    years: text(rawEvent.years, `years for ${id}`, { max: 60 }),
    bio: text(rawEvent.bio, `bio for ${id}`, { required: true, max: 2_000 }),
    researchAreas: normalizedResearchAreas,
    website: safeUrl(rawEvent.website, `website for ${id}`),
    professionalLink: safeUrl(rawEvent.professionalLink, `professional link for ${id}`),
    removePhoto: rawEvent.removePhoto === true,
    photoToken,
  };
}

function eventHash(event) {
  return createHash("sha256").update(JSON.stringify(event)).digest("hex");
}

function normalizeFeed(rawFeed) {
  if (!isObject(rawFeed)) throw new Error("The profile feed must be a JSON object.");
  if (rawFeed.schemaVersion !== PROFILE_SCHEMA_VERSION) {
    throw new Error(`Unsupported profile feed schema: ${rawFeed.schemaVersion}`);
  }
  isoDate(rawFeed.generatedAt, "feed generatedAt");

  if (!Array.isArray(rawFeed.submissions) || rawFeed.submissions.length > 500) {
    throw new Error("The profile feed must contain at most 500 submissions.");
  }

  const submissions = rawFeed.submissions.map(normalizeEvent).sort((left, right) =>
    left.submittedAt.localeCompare(right.submittedAt) || left.id.localeCompare(right.id),
  );
  const ids = new Set();
  for (const submission of submissions) {
    if (ids.has(submission.id)) throw new Error(`Duplicate submission id: ${submission.id}`);
    ids.add(submission.id);
  }

  return submissions;
}

function roleFor(degreeLevel) {
  if (degreeLevel === "Undergraduate") return "Undergraduate researcher";
  if (degreeLevel === "Ph.D.") return "Doctoral researcher";
  return "Graduate researcher";
}

function linksFor(submission) {
  const links = [];
  if (submission.website) links.push({ label: "Website", href: submission.website });
  if (submission.professionalLink && submission.professionalLink !== submission.website) {
    links.push({ label: "Professional profile", href: submission.professionalLink });
  }
  return links;
}

function validateSeed(rawSeed) {
  if (!isObject(rawSeed) || !Array.isArray(rawSeed.profiles)) {
    throw new Error("The student profile seed file is invalid.");
  }

  const slugs = new Set();
  return rawSeed.profiles.map((profile) => {
    if (!isObject(profile)) throw new Error("Each seed profile must be an object.");
    const slug = normalizeProfileId(profile.slug);
    if (slugs.has(slug)) throw new Error(`Duplicate seed profile: ${slug}`);
    slugs.add(slug);
    return structuredClone(profile);
  });
}

export function applyApprovedProfileFeed(rawSeed, rawFeed, previousMeta = {}) {
  const submissions = normalizeFeed(rawFeed);
  const profiles = new Map();
  const order = [];
  for (const profile of validateSeed(rawSeed)) {
    profiles.set(profile.slug, profile);
    order.push(profile.slug);
  }

  const sourceEvents = Object.create(null);
  const previousEvents = isObject(previousMeta.sourceEvents) ? previousMeta.sourceEvents : {};
  const previousPhotoVersions = isObject(previousMeta.photoVersions) ? previousMeta.photoVersions : {};
  const photoVersions = Object.create(null);

  for (const submission of submissions) {
    sourceEvents[submission.id] = eventHash(submission);
  }
  for (const [id, hash] of Object.entries(previousEvents)) {
    if (!sourceEvents[id]) {
      throw new Error(`Previously published approval ${id} disappeared from the feed. Submit a new correction instead of changing approved rows.`);
    }
    if (sourceEvents[id] !== hash) {
      throw new Error(`Previously published approval ${id} changed. Submit a new correction instead of editing an approved row.`);
    }
  }

  for (const submission of submissions) {
    const { profileId } = submission;
    if (submission.action === "remove") {
      profiles.delete(profileId);
      const position = order.indexOf(profileId);
      if (position >= 0) order.splice(position, 1);
      delete photoVersions[profileId];
      continue;
    }

    const existing = profiles.get(profileId);
    const links = linksFor(submission);
    const profile = {
      slug: profileId,
      name: submission.name,
      role: roleFor(submission.degreeLevel),
      affiliation: "Brigham Young University",
      bio: submission.bio,
      levels: [submission.degreeLevel],
      active: true,
      verified: true,
    };

    if (submission.years) profile.years = submission.years;
    if (submission.researchAreas.length) profile.programs = submission.researchAreas;
    if (links.length) profile.links = links;

    if (submission.removePhoto) {
      delete photoVersions[profileId];
    } else if (submission.photoToken) {
      profile.photo = `/images/people/${profileId}.jpg`;
      photoVersions[profileId] = submission.photoToken;
    } else if (existing?.photo && photoVersions[profileId]) {
      profile.photo = existing.photo;
    }

    if (!profiles.has(profileId)) order.push(profileId);
    profiles.set(profileId, profile);
  }

  const photosToFetch = Object.entries(photoVersions)
    .filter(([slug, token]) => previousPhotoVersions[slug] !== token)
    .map(([slug, token]) => ({ slug, token }));
  const photosToRemove = Object.keys(previousPhotoVersions)
    .filter((slug) => !photoVersions[slug]);
  const sourceUpdatedAt = submissions.at(-1)?.submittedAt ?? null;

  return {
    generated: {
      meta: {
        schemaVersion: PROFILE_SCHEMA_VERSION,
        source: "Google Forms approved-response feed",
        sourceUpdatedAt,
        sourceEvents,
        photoVersions,
      },
      profiles: order.map((slug) => profiles.get(slug)).filter(Boolean),
    },
    photosToFetch,
    photosToRemove,
  };
}
