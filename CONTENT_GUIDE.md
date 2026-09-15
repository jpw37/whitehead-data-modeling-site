# Updating the Whitehead Data-Driven Modeling Group website

Most routine updates live in four small data files. Editing these files updates the cards and directories automatically; page layouts do not need to be rewritten.

## Current group members

Edit `content/people.ts`.

- Add or remove one object in the `people` array.
- Set `active: true` for current members and `active: false` when someone moves to the alumni directory.
- Use `levels` to show `Undergraduate`, `M.S.`, or `Ph.D.` badges. A person may have more than one.
- Add a short `bio`, one or more `programs`, and optional website links.
- Put portraits in `public/images/people/` and set `photo` to a public path such as `/images/people/jane-doe.jpg`.
- Set `verified: true` only after the person's current status and details have been confirmed.

The CV-derived names currently marked `verified: false` appear in the clearly labeled roster-review section on the People page.

## Alumni

Edit `content/mentoring.ts`.

- Keep a separate record for each degree level at which a student was mentored.
- Use `level` to distinguish undergraduate, master's, and doctoral records.
- Add `currentRole`, `note`, and `links` whenever updated information is available.
- The dates shown are mentoring periods from the CV, not assumed graduation dates.

## Research programs and highlights

Edit `content/research.ts`.

- Each research program controls its homepage summary and full Research-page section.
- Add a published result to the program's `highlights` array using a short result-first takeaway, full title, authors, citation, and DOI or publisher URL.
- The cloud-physics program intentionally has an empty highlights list. Its `funding` block describes support through the DOE Genesis Mission without implying that cloud-physics papers have already appeared.
- Add an ISO publication date (`YYYY-MM-DD`) to every hand-curated highlight. The Research page automatically hides a highlight after its two-year anniversary.

## Automatically refreshed publications

The “Publications from the past two years” section is generated from `content/publications.generated.json`.

- `scripts/sync-publications.mjs` checks the BYU-validated OpenAlex record, selected Semantic Scholar author records, Crossref metadata, and arXiv's public metadata feed. It deduplicates journal versions and preprints by DOI, arXiv identifier, and normalized title; retries temporary failures; and retains the last known good data if a source is unavailable.
- `.github/workflows/refresh-publications.yml` runs once daily, in step with arXiv's daily metadata cycle. It commits only when the publication list changes, which prompts Cloudflare to rebuild the public site.
- Journal articles and arXiv preprints are included only while their publication or first-submission date falls in the rolling 24-month window. A preprint is replaced by its published version when the latter is indexed.
- Edit `content/publication-overrides.json` to replace an automated summary or exclude a DOI or arXiv identifier. A hand-edited summary is never overwritten by later metadata refreshes.
- `approvedArxivIds` confirms an arXiv result when only initials are available. `preprintSeeds` provides a verified fallback record while external author indexes catch up; normal source data replaces or enriches the seed automatically.
- Run `npm run publications:update` to check immediately. GitHub also exposes a manual “Run workflow” button for the same purpose.

## Collaborators and partner institutions

Edit `content/collaborators.ts` to add, remove, or update external links. Favor official university, laboratory, or project pages.

## Images

General site images live in `public/images/`. The homepage panorama and outdoor-interest photographs are already optimized for the web. The generated social-preview image is `public/og.png`.

## Local preview

From this project directory, run:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/`. Run `npm run build` before publishing.

## Cloudflare publishing

This project builds as a Cloudflare Worker. After pushing it to a GitHub repository, import that repository in Cloudflare Workers Builds and use:

- Build command: `npm run build`
- Deploy command: leave Cloudflare's default `npx wrangler deploy`
- Production branch: `main`

The root `wrangler.jsonc` points that default command to the built Worker and its static assets. If the Cloudflare form asks for a **build output directory** instead of showing Worker build settings, the repository was imported as a Pages project; create a Worker application instead.

Cloudflare will publish each accepted commit automatically. Give the resulting public URL to the BYU administrator; the institutional address can then redirect to it, or be attached as a custom domain if the relevant DNS zone is available in the Cloudflare account.
