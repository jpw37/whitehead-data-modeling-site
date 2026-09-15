const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const siteBasePath = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";

export function sitePath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${siteBasePath}${path}`;
}

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://jpw37.github.io/whitehead-data-modeling-site"
).replace(/\/+$/, "");
