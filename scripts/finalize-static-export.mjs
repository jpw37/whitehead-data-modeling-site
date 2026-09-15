import { copyFile, mkdir } from "node:fs/promises";

const outputDirectory = new URL("../dist/client/", import.meta.url);
const routes = ["about", "alumni", "people", "previous-work", "research"];

for (const route of routes) {
  const routeDirectory = new URL(`${route}/`, outputDirectory);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(
    new URL(`${route}.html`, outputDirectory),
    new URL("index.html", routeDirectory),
  );
}
