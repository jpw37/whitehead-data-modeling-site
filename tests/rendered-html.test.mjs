import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const publicRoutes = ["/", "/research", "/people", "/alumni", "/previous-work", "/about"];
const routeFiles = new Map([
  ["/", "index.html"],
  ["/research", "research.html"],
  ["/people", "people.html"],
  ["/alumni", "alumni.html"],
  ["/previous-work", "previous-work.html"],
  ["/about", "about.html"],
]);
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://jpw37.github.io/whitehead-data-modeling-site"
).replace(/\/+$/, "");

function removeBasePath(pathname) {
  if (!basePath) return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  assert.ok(pathname === basePath || pathname.startsWith(`${basePath}/`), pathname);
  const unprefixed = pathname.slice(basePath.length) || "/";
  return unprefixed === "/" ? "/" : unprefixed.replace(/\/$/, "");
}

async function render(route = "/") {
  const file = routeFiles.get(route);
  if (!file) return new Response("Not found", { status: 404 });
  const html = await readFile(new URL(`../dist/client/${file}`, import.meta.url), "utf8");
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

test("renders every public route", async () => {
  for (const route of publicRoutes) {
    const response = await render(route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i, route);
  }
});

test("all internal links and anchors resolve", async () => {
  const pages = new Map();

  for (const route of publicRoutes) {
    pages.set(route, await (await render(route)).text());
  }

  for (const [sourceRoute, html] of pages) {
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const href = match[1];
      if (!href.startsWith("/") && !href.startsWith("#")) continue;

      const destination = new URL(href, `https://preview.example${sourceRoute}`);
      const destinationPath = href.startsWith("#")
        ? sourceRoute
        : removeBasePath(destination.pathname);
      if (/\.[a-z0-9]+$/i.test(destinationPath)) {
        await access(new URL(`../public${destinationPath}`, import.meta.url));
        continue;
      }

      assert.ok(pages.has(destinationPath), `${sourceRoute} links to missing route ${href}`);
      if (destination.hash) {
        const id = decodeURIComponent(destination.hash.slice(1));
        assert.match(
          pages.get(destinationPath),
          new RegExp(`id="${id}"`),
          `${sourceRoute} links to missing anchor ${href}`,
        );
      }
    }
  }
});

test("homepage leads with the group identity and carries an absolute social image", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /<title>Data-Driven Modeling Group<\/title>/i);
  assert.match(html, /<h1>Data-Driven Modeling Group<\/h1>/i);
  assert.match(html, /<strong>Jared P\. Whitehead<\/strong>/i);
  assert.doesNotMatch(html, /<h1>Jared P\. Whitehead<\/h1>/i);
  assert.match(html, /Professor &amp; principal investigator/i);
  assert.match(html, /professor of mathematics at Brigham Young University/i);
  assert.match(html, /alt="Portrait of Jared Whitehead"/i);
  assert.match(html, /jared-whitehead\.jpg/i);
  assert.doesNotMatch(html, /associate professor/i);
  assert.match(html, /href="https:\/\/math\.byu\.edu\/"/i);
  assert.match(html, /href="https:\/\/www\.byu\.edu\/"/i);
  assert.match(html, /Members, past &amp; present\./i);
  assert.doesNotMatch(html, /Built to stay current|One record per person/i);
  assert.match(html, /href="https:\/\/www\.churchofjesuschrist\.org\/"/i);
  assert.match(html, /Mathematics · Data · Physical systems/);
  assert.match(html, /Generalization in complex models/);
  assert.match(html, /Interpretable models from data/);
  assert.match(html, /Discovering cloud physics/);
  assert.match(html, /historical Indonesian tsunami accounts/i);
  assert.doesNotMatch(html, /archived research program/i);
  assert.match(
    html,
    new RegExp(`property="og:image" content="${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/og\\.png"`),
  );
  assert.doesNotMatch(html, /Applied Math Seminar/i);
});

test("research page identifies Genesis funding without claiming cloud publications", async () => {
  const response = await render("/research");
  const html = await response.text();

  assert.match(html, /supported through the U\.S\. Department of Energy(?:&#x27;|')s Genesis Mission/i);
  assert.match(html, /U\.S\. Department of Energy Awardee/i);
  assert.match(html, /doe-awardee-logo\.png/i);
  assert.match(html, /Not an endorsement by DOE/i);
  assert.match(html, /no cloud-physics results have been published yet/i);
  assert.match(html, /Published research highlights/i);
  assert.match(html, /Supported by the U\.S\. National Science Foundation/i);
  assert.match(html, /nsf-logo\.png/i);
  assert.match(html, /DMS-2206762/);
  assert.match(html, /CCF-2343286/);
  assert.match(html, /DMS-2510495/);
  assert.match(html, /Google Scholar profile/i);
  assert.match(html, /https:\/\/scholar\.google\.com\/citations\?user=lLR_YEYAAAAJ/);
  assert.match(html, /Publications from the past two years/i);
  assert.match(html, /journal articles and arXiv preprints are added automatically/i);
  assert.match(html, /leave this section after 24 months/i);
  assert.match(html, /Generalized aliasing explains double descent/i);
  assert.match(html, /Continuous data assimilation in steady Navier-Stokes equations with unknown viscosity/i);
  assert.match(html, /https:\/\/arxiv\.org\/abs\/2609\.02862/i);
  assert.match(html, />Preprint<\/span>/i);
  assert.match(html, /Thank you to arXiv for use of its open access interoperability/i);
  assert.doesNotMatch(html, /10\.1103\/physrevfluids\.9\.054602/i);
  const cloudSection = html.match(/<section[^>]*id="cloud-physics"[\s\S]*?<\/section>/i)?.[0] ?? "";
  assert.doesNotMatch(cloudSection, /Nebraska/i);
  assert.doesNotMatch(html, /Flagship collaboration/i);
  assert.doesNotMatch(html, /property="og:image"/i);
  assert.doesNotMatch(html, /name="twitter:image"/i);
});

test("generated publication records use a validated rolling two-year window", async () => {
  const path = new URL("../content/publications.generated.json", import.meta.url);
  const publicationData = JSON.parse(await readFile(path, "utf8"));
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 2);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  assert.equal(publicationData.meta.rollingWindowMonths, 24);
  assert.deepEqual(publicationData.meta.sources, ["OpenAlex", "Crossref", "Semantic Scholar", "arXiv"]);
  assert.ok(publicationData.publications.length > 0);

  const normalizedTitles = new Set();

  for (const publication of publicationData.publications) {
    assert.ok(publication.date >= cutoffDate, `${publication.title} is outside the rolling window`);
    assert.ok(publication.validatedBy.length > 0, `${publication.title} lacks identity validation`);
    assert.notEqual(publication.doi, "10.1016/j.bpj.2023.11.1214", "false author match was included");

    const normalizedTitle = publication.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    assert.ok(!normalizedTitles.has(normalizedTitle), `${publication.title} appears as both a preprint and publication`);
    normalizedTitles.add(normalizedTitle);

    if (publication.type === "preprint") {
      assert.ok(publication.arxivId, `${publication.title} is missing its arXiv identifier`);
      assert.match(publication.href, /^https:\/\/arxiv\.org\/abs\//);
    }
  }

  const currentPreprint = publicationData.publications.find((publication) => publication.arxivId === "2609.02862");
  assert.equal(currentPreprint?.type, "preprint");
  assert.equal(currentPreprint?.key, "arxiv:2609.02862");
});

test("people page shows only the confirmed current roster", async () => {
  const peopleHtml = await (await render("/people")).text();

  for (const name of [
    "Ashley Spencer",
    "Ashtyn Whipple",
    "Thea Spigarelli",
    "Quinn Oveson",
    "Lydia Tolman",
    "Tiara Eddington",
    "Eli Sampson",
    "Dawson Collins",
    "Wyatt Wimmer",
  ]) {
    assert.match(peopleHtml, new RegExp(name));
  }

  for (const name of ["Garrett Carver", "Ashley Avery", "Paul Smith", "Nathan Schill", "Melanie Neller"]) {
    assert.doesNotMatch(peopleHtml, new RegExp(name));
  }

  assert.equal((peopleHtml.match(/class="person-card/g) ?? []).length, 10);
  assert.match(peopleHtml, /Undergraduate/);
  assert.match(peopleHtml, /M\.S\./);
  assert.match(peopleHtml, /Ph\.D\./);
  assert.doesNotMatch(peopleHtml, /Roster review before launch/);
});

test("people page lists the requested research colleagues and Google Scholar profile", async () => {
  const peopleHtml = await (await render("/people")).text();

  for (const name of [
    "Adam Larios",
    "Vincent R. Martinez",
    "Ali Pakzad",
    "Amir Arzani",
    "Leo G. Rebholz",
    "Jorge Reyes Jr.",
    "Nathan Glatt-Holtz",
    "Juraj Földes",
    "Tuan N. Pham",
    "Ron Harris",
    "Aseel Farhat",
    "University of Nebraska–Lincoln",
  ]) {
    assert.match(peopleHtml, new RegExp(name));
  }

  for (const href of [
    "https://math.unl.edu/person/adam-larios/",
    "https://math.hunter.cuny.edu/vmartine/",
    "https://sites.google.com/view/pakzad",
    "https://bio.mech.utah.edu/",
    "https://www.clemson.edu/science/academics/departments/mathstat/about/profiles/rebholz",
    "https://faculty.txstate.edu/profile/2705034",
    "https://negh.pages.iu.edu/",
    "https://uva.theopenscholar.com/juraj-foldes/",
    "https://blogs.oregonstate.edu/tpham/",
    "https://geology.byu.edu/directory/ron-a-harris",
    "https://as.virginia.edu/faculty-profile/aseel-farhat",
    "https://scholar.google.com/citations?user=lLR_YEYAAAAJ",
    "https://www.unl.edu/",
  ]) {
    assert.match(peopleHtml, new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("alumni page is a degree-grouped list without summary counts", async () => {
  const alumniHtml = await (await render("/alumni")).text();

  for (const name of [
    "Garrett Carver",
    "Ashley Avery",
    "Paul Smith",
    "Ilha Hwang",
    "Nephi Suryama",
    "Norman Rasmussen",
    "Rowan Williams",
    "Emmaline McKinnon",
    "Jacob Schonlau",
    "Spencer Bringhurst",
    "Nathan Schill",
    "Melanie Neller",
  ]) {
    assert.match(alumniHtml, new RegExp(name));
  }

  assert.match(alumniHtml, /Undergraduate students/);
  assert.match(alumniHtml, /M\.S\. students/);
  assert.match(alumniHtml, /Ph\.D\. students/);
  assert.doesNotMatch(alumniHtml, /researchers/);
  assert.match(alumniHtml, /Zhao Pan/);
  assert.match(alumniHtml, /University of Waterloo/);
  assert.match(alumniHtml, /Jacob Murri/);
  assert.match(alumniHtml, /https:\/\/www\.jwmurri\.com\/home/);
  assert.match(alumniHtml, /Shane McQuarrie/);
  assert.match(alumniHtml, /https:\/\/math\.byu\.edu\/directory\/shane-mcquarrie/);
  assert.doesNotMatch(alumniHtml, /mentoring records/);
  assert.doesNotMatch(alumniHtml, /\d+ records/);
  assert.doesNotMatch(alumniHtml, /About this record/);
});

test("about page uses the requested outside-of-work description", async () => {
  const aboutHtml = await (await render("/about")).text();

  assert.match(aboutHtml, /<h2>Outside of work<\/h2>/);
  assert.match(aboutHtml, /hiking, mountain biking, backpacking, rock climbing, canyoneering, and trail running/);
  assert.match(aboutHtml, /wife and five children, three of whom are still at home/);
  assert.doesNotMatch(aboutHtml, /Finding the next line through complex terrain/);
});

test("previous work page emphasizes historical tsunami inference, methods, and Fulbright support", async () => {
  const previousWorkHtml = await (await render("/previous-work")).text();

  assert.match(previousWorkHtml, /Dutch soldiers in Indonesia/i);
  assert.match(previousWorkHtml, /modern seismic and tsunami risk assessment/i);
  assert.match(previousWorkHtml, /Bayesian statistical techniques/i);
  assert.match(previousWorkHtml, /Markov chain Monte Carlo \(MCMC\)/i);
  assert.match(previousWorkHtml, /GeoClaw software package was used extensively/i);
  assert.match(previousWorkHtml, /Fulbright Faculty Award/i);
  assert.match(previousWorkHtml, /Bandung Institute of Technology/i);
  assert.match(previousWorkHtml, /winter of 2025/i);
  assert.match(previousWorkHtml, /fulbright-scholar-program\.svg/i);
  assert.match(previousWorkHtml, /https:\/\/fulbrightscholars\.org\/what-fulbright\/fulbright-scholar-program/i);
  assert.doesNotMatch(previousWorkHtml, /Preserved, but no longer a primary active program/i);
  assert.doesNotMatch(previousWorkHtml, /not currently a focus of the group/i);
  assert.doesNotMatch(previousWorkHtml, /dedicated archive/i);
});

test("the linked CV is included as a nonempty PDF", async () => {
  const cv = new URL("../public/vita.pdf", import.meta.url);
  const details = await stat(cv);

  assert.ok(details.size > 0);
});

test("official funding logos are included as nonempty image assets", async () => {
  for (const asset of ["nsf-logo.png", "doe-awardee-logo.png", "fulbright-scholar-program.svg"]) {
    const logo = new URL(`../public/images/funders/${asset}`, import.meta.url);
    const details = await stat(logo);
    assert.ok(details.size > 0, asset);
  }
});
