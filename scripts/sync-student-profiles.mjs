#!/usr/bin/env node

import { access, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { applyApprovedProfileFeed, PROFILE_SCHEMA_VERSION } from "./student-profile-sync-lib.mjs";

const feedUrl = process.env.PROFILE_FEED_URL;
const seedPath = fileURLToPath(new URL("../content/student-profiles.seed.json", import.meta.url));
const generatedPath = fileURLToPath(new URL("../content/student-profiles.generated.json", import.meta.url));
const portraitDirectory = fileURLToPath(new URL("../public/images/people/", import.meta.url));
const RETRY_DELAYS_MS = [0, 1_000, 3_000, 8_000];
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function fetchWithRetry(url, label) {
  let lastError;
  for (const delay of RETRY_DELAYS_MS) {
    if (delay) await sleep(delay);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`${label} was unavailable after ${RETRY_DELAYS_MS.length} attempts: ${lastError?.message}`);
}

async function fetchJson(url, label) {
  const response = await fetchWithRetry(url, label);
  try {
    return await response.json();
  } catch {
    throw new Error(`${label} did not return valid JSON.`);
  }
}

async function fetchPortrait(token, slug) {
  const url = new URL(feedUrl);
  url.searchParams.set("photo", token);
  const payload = await fetchJson(url, `Portrait for ${slug}`);

  if (payload?.schemaVersion !== PROFILE_SCHEMA_VERSION || payload?.photoToken !== token) {
    throw new Error(`Portrait response for ${slug} did not match the requested approval.`);
  }
  if (typeof payload.base64 !== "string" || typeof payload.mimeType !== "string") {
    throw new Error(`Portrait response for ${slug} is incomplete.`);
  }
  if (!payload.mimeType.startsWith("image/")) {
    throw new Error(`Portrait response for ${slug} is not an image.`);
  }

  const source = Buffer.from(payload.base64, "base64");
  if (!source.length || source.length > MAX_PHOTO_BYTES) {
    throw new Error(`Portrait for ${slug} is empty or larger than 20 MB.`);
  }

  return sharp(source)
    .rotate()
    .resize(800, 1_000, { fit: "cover", position: "centre" })
    .jpeg({ quality: 84, progressive: true, mozjpeg: true })
    .toBuffer();
}

async function writeIfChanged(path, contents) {
  try {
    const current = await readFile(path);
    if (Buffer.compare(current, contents) === 0) return false;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const temporaryPath = `${path}.tmp-${process.pid}`;
  await writeFile(temporaryPath, contents);
  await rename(temporaryPath, path);
  return true;
}

async function removeIfPresent(path) {
  try {
    await unlink(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function main() {
  if (!feedUrl) {
    throw new Error("PROFILE_FEED_URL is not configured. Add the deployed Apps Script URL as a GitHub Actions repository variable.");
  }

  const [seed, previous, feed] = await Promise.all([
    readJson(seedPath),
    readJson(generatedPath),
    fetchJson(feedUrl, "Approved student-profile feed"),
  ]);
  const result = applyApprovedProfileFeed(seed, feed, previous.meta);
  const preparedPortraits = new Map();
  const portraitsToFetch = new Map(
    result.photosToFetch.map(({ slug, token }) => [slug, token]),
  );

  for (const [slug, token] of Object.entries(result.generated.meta.photoVersions)) {
    try {
      await access(`${portraitDirectory}${slug}.jpg`);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      portraitsToFetch.set(slug, token);
    }
  }

  for (const [slug, token] of portraitsToFetch) {
    preparedPortraits.set(slug, await fetchPortrait(token, slug));
  }

  await mkdir(portraitDirectory, { recursive: true });
  const changed = [];
  for (const [slug, portrait] of preparedPortraits) {
    const path = `${portraitDirectory}${slug}.jpg`;
    if (await writeIfChanged(path, portrait)) changed.push(`public/images/people/${slug}.jpg`);
  }
  for (const slug of result.photosToRemove) {
    const path = `${portraitDirectory}${slug}.jpg`;
    if (await removeIfPresent(path)) changed.push(`public/images/people/${slug}.jpg`);
  }

  const json = Buffer.from(`${JSON.stringify(result.generated, null, 2)}\n`);
  if (await writeIfChanged(generatedPath, json)) changed.push("content/student-profiles.generated.json");

  if (changed.length) {
    console.log(`Updated ${changed.length} student-profile file${changed.length === 1 ? "" : "s"}:`);
    for (const path of changed) console.log(`- ${path}`);
  } else {
    console.log("Approved student profiles are already current.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
