# Data-Driven Modeling Group website

The public website for Jared P. Whitehead’s Data-Driven Modeling Group at Brigham Young University. The site uses vinext during development and is exported as static HTML, CSS, and JavaScript for GitHub Pages.

## Local development

Node.js `>=22.13.0` is required.

```bash
npm install
npm run dev
```

Open the local address shown in the terminal. Before committing a change, run:

```bash
npm run lint
npm test
```

`npm test` builds all six public pages as a static export, verifies their rendered content, and checks that internal links and assets resolve.

## Publishing on GitHub Pages

The existing repository, `jpw37/whitehead-data-modeling-site`, is the source and host. No additional repository or deployment branch is required.

1. In GitHub, open **Settings → Pages** for the repository.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main`, or run **Deploy website to GitHub Pages** manually from the Actions tab.

The workflow in `.github/workflows/deploy-pages.yml` asks GitHub for the correct base URL and base path, builds the static site, runs the test suite, uploads `dist/client`, and deploys it. Until a custom domain is attached, the expected address is:

`https://jpw37.github.io/whitehead-data-modeling-site/`

When a BYU custom domain is configured in **Settings → Pages**, GitHub’s workflow reports the new base URL automatically; no code change is needed.

## Recent publications

The Research page contains a rolling two-year feed for journal articles and arXiv preprints. Run `npm run publications:update` for an immediate local refresh.

`.github/workflows/refresh-publications.yml` checks OpenAlex, Crossref, Semantic Scholar, and arXiv daily. When the generated publication data changes, it commits the update and calls the Pages workflow directly, ensuring the new static site is published even though the commit was created by GitHub Actions.

See `CONTENT_GUIDE.md` for routine member, alumni, collaborator, research-highlight, image, and publication-summary updates.

## Useful commands

- `npm run dev`: run the local development server
- `npm run build`: generate the static site in `dist/client`
- `npm run lint`: check source formatting and code quality
- `npm test`: build and run rendered-content and static-export tests
- `npm run publications:update`: refresh the rolling publication metadata

## Framework documentation

- [vinext](https://github.com/cloudflare/vinext)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
