# Updating the Whitehead Data-Driven Modeling Group website

Most routine updates live in four small data files. Editing these files updates the cards and directories automatically; page layouts do not need to be rewritten.

## Current group members

Student profiles are collected with a Google Form and reviewed in its private linked response spreadsheet. Choose `Approved` in the `Website approval` column only after checking the submitted wording, links, degree level, and portrait. The approved profile is added during the next daily GitHub refresh; the **Refresh approved student profiles** workflow can also be run manually from the Actions tab.

- Form responses and uploaded source photographs stay private in Google Drive. Only approved public fields are exported.
- Students should submit a new response for every correction or removal. Do not edit or unapprove a row after it has synced; approve the newer request instead.
- Portraits are automatically cropped to a 4:5 ratio at 800 × 1000 pixels and rewritten without embedded metadata.
- `content/student-profiles.seed.json` is the starting roster. `content/student-profiles.generated.json` and `public/images/people/` are maintained by the sync workflow.
- Jared's profile remains hand-maintained in `content/people.ts`.

Full setup and troubleshooting instructions are in `google-apps-script/README.md`.

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
- `.github/workflows/refresh-publications.yml` runs once daily, in step with arXiv's daily metadata cycle. It commits only when the publication list changes, then calls the GitHub Pages deployment workflow so the public site is refreshed.
- Journal articles and arXiv preprints are included only while their publication or first-submission date falls in the rolling 24-month window. A preprint is replaced by its published version when the latter is indexed.
- Edit `content/publication-overrides.json` to replace an automated summary or exclude a DOI or arXiv identifier. A hand-edited summary is never overwritten by later metadata refreshes.
- `approvedArxivIds` confirms an arXiv result when only initials are available. `preprintSeeds` provides a verified fallback record while external author indexes catch up; normal source data replaces or enriches the seed automatically.
- Run `npm run publications:update` to check immediately. GitHub also exposes a manual “Run workflow” button for the same purpose.

## Automatically refreshed student profiles

- `scripts/sync-student-profiles.mjs` reads only the reviewed Apps Script feed configured in the `PROFILE_FEED_URL` GitHub Actions variable.
- The importer strictly validates names, degree levels, research areas, links, and images. It rejects non-web links, unknown values, oversized files, or an altered approval history.
- `.github/workflows/refresh-people.yml` checks once daily, commits only actual changes, and calls the GitHub Pages deployment workflow.
- Run `PROFILE_FEED_URL="https://script.google.com/macros/s/…/exec" npm run people:update` for an immediate local check.

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

## GitHub Pages publishing

The site is statically exported and published from the existing `jpw37/whitehead-data-modeling-site` repository. In the repository, open **Settings → Pages** and select **GitHub Actions** as the source. The workflow in `.github/workflows/deploy-pages.yml` then builds and publishes every push to `main`; it also supports a manual run from the Actions tab.

GitHub supplies the correct site URL and repository base path to the build automatically. This lets the same workflow work first at `https://jpw37.github.io/whitehead-data-modeling-site/` and later at a custom BYU domain without source-code changes. Give the final Pages or custom-domain URL to the BYU administrator when the institutional redirect is ready.
