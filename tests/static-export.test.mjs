import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputDirectory = new URL("../dist/client/", import.meta.url);
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://jpw37.github.io/whitehead-data-modeling-site"
).replace(/\/+$/, "");

const routes = new Map([
  ["/", "index.html"],
  ["/about", "about.html"],
  ["/alumni", "alumni.html"],
  ["/people", "people.html"],
  ["/previous-work", "previous-work.html"],
  ["/research", "research.html"],
]);
const routeDirectories = [...routes.keys()].filter((route) => route !== "/");

function removeBasePath(pathname) {
  if (!basePath) return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  assert.ok(
    pathname === basePath || pathname.startsWith(`${basePath}/`),
    `${pathname} is missing the GitHub Pages base path ${basePath}`,
  );
  const unprefixed = pathname.slice(basePath.length) || "/";
  return unprefixed === "/" ? "/" : unprefixed.replace(/\/$/, "");
}

test("the static export contains every public page and its 404 page", async () => {
  for (const file of [...routes.values(), "404.html"]) {
    await access(new URL(file, outputDirectory));
  }
  for (const route of routeDirectories) {
    await access(new URL(`${route.slice(1)}/index.html`, outputDirectory));
  }
});

test("all exported page links and assets resolve under the configured site path", async () => {
  for (const [route, file] of routes) {
    const html = await readFile(new URL(file, outputDirectory), "utf8");

    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const reference = match[1];
      if (reference.startsWith("#") || reference.startsWith("mailto:")) continue;
      if (/^(?:https?:)?\/\//.test(reference)) continue;
      if (!reference.startsWith("/")) continue;

      const destination = new URL(reference, "https://pages.example");
      const path = removeBasePath(destination.pathname);

      if (routes.has(path)) continue;
      if (path === "/") continue;

      const outputFile = path.replace(/^\//, "");
      await assert.doesNotReject(
        access(new URL(outputFile, outputDirectory)),
        `${route} references missing static asset ${reference}`,
      );
    }
  }
});

test("the exported homepage uses the published URL for social metadata", async () => {
  const html = await readFile(new URL("index.html", outputDirectory), "utf8");
  assert.match(html, new RegExp(`property="og:image" content="${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/og\\.png"`));
});

test("the export does not retain unprefixed root assets in GitHub Pages mode", async () => {
  if (!basePath) return;

  for (const file of routes.values()) {
    const html = await readFile(new URL(file, outputDirectory), "utf8");
    for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
      const reference = match[1];
      assert.ok(
        reference === `${basePath}/` || reference.startsWith(`${basePath}/`),
        `${file} contains an unprefixed URL: ${reference}`,
      );
    }
  }
});
