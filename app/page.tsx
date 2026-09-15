import { PersonProfile } from "@/components/PersonProfile";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { featuredPeople } from "@/content/people";
import { researchPrograms } from "@/content/research";
import { sitePath } from "@/lib/site";

export const dynamic = "force-static";

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">Mathematics · Data · Physical systems</p>
          <h1>Data-Driven Modeling Group</h1>
          <p className="hero-byline">
            <strong>Jared P. Whitehead</strong>
            <span>Brigham Young University</span>
          </p>
          <h2 className="hero-question">What can data teach us about the models we trust?</h2>
          <p className="hero-intro">
            We use data to understand, construct, and improve mathematical
            models—from explaining generalization in over-parameterized systems
            to discovering interpretable physical mechanisms.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={sitePath("/research/")}>Explore our research</a>
            <a className="button button-secondary" href={sitePath("/people/")}>Meet the group</a>
          </div>
        </div>

        <div className="model-map" aria-label="A conceptual map from data to models">
          <div className="data-cluster" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
          </div>
          <div className="model-axis" aria-hidden="true"><span /></div>
          <div className="model-card model-card-dark">
            <span>One regime</span>
            <strong>Over-parameterized</strong>
            <small>How does generalization emerge?</small>
          </div>
          <div className="model-card model-card-light">
            <span>Another regime</span>
            <strong>Interpretable</strong>
            <small>What mechanism explains the data?</small>
          </div>
        </div>
      </section>

      <section
        className="landscape-band"
        role="img"
        aria-label="A mountain trail crossing a broad alpine basin"
        style={{ "--mountain-panorama-image": `url("${sitePath("/images/mountain-panorama.jpg")}")` } as React.CSSProperties}
      >
        <div className="landscape-caption">
          <span>Complex terrain. Useful structure.</span>
          <p>Our work looks for the paths that connect observations to understanding.</p>
        </div>
      </section>

      <section className="research-section" id="research">
        <div className="section-heading">
          <p className="kicker">Three active programs</p>
          <h2>Different questions.<br />One central idea.</h2>
          <p>Data do more than fit models. They can expose why models work, show where they fail, and help us build better ones.</p>
        </div>

        <div className="program-grid">
          {researchPrograms.map((program) => (
            <article className="program-card" key={program.number}>
              <div className="program-number">{program.number}</div>
              <p className="program-eyebrow">{program.eyebrow}</p>
              <h3>{program.title}</h3>
              <p>{program.summary}</p>
              <a href={sitePath(`/research/#${program.slug}`)}>Explore {program.shortTitle.toLowerCase()}<span aria-hidden="true"> ↗</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="people-section" id="people">
        <div className="section-heading compact">
          <p className="kicker">People</p>
          <h2>A collaborative group by design.</h2>
          <p>Member profiles connect people to research programs, publications, and the colleagues who bring each project to life.</p>
        </div>

        <div className="people-layout">
          <div className="people-grid">
            {featuredPeople.map((person) => <PersonProfile person={person} key={person.slug} />)}
          </div>

          <aside className="directory-note">
            <p className="kicker">Built to stay current</p>
            <h3>One record per person.</h3>
            <p>Each profile can include a degree level, short bio, research programs, personal links, and an optional portrait. Alumni remain part of the group history.</p>
            <div className="stacked-links">
              <a href={sitePath("/people/")}>Current members <span aria-hidden="true">→</span></a>
              <a href={sitePath("/alumni/")}>Group alumni <span aria-hidden="true">→</span></a>
            </div>
          </aside>
        </div>
      </section>

      <section className="acme-callout">
        <p className="kicker">Teaching & curriculum</p>
        <div>
          <h2>Applied mathematics as a complete educational experience.</h2>
          <p>Jared has played a substantial role in developing the curriculum for BYU’s Applied and Computational Mathematics Emphasis (ACME).</p>
        </div>
        <a className="button button-secondary" href={sitePath("/about/#acme")}>ACME and curriculum</a>
      </section>

      <section className="previous-section" id="previous-work">
        <p className="kicker">Previous work</p>
        <div>
          <h2>Historical earthquake and tsunami inference</h2>
          <p>Research using historical Indonesian tsunami accounts, Bayesian inference, MCMC, and GeoClaw simulations to reconstruct source earthquakes and improve modern seismic-risk assessment.</p>
        </div>
        <a href={sitePath("/previous-work/")}>Explore the previous work <span aria-hidden="true">→</span></a>
      </section>

      <SiteFooter />
    </main>
  );
}
