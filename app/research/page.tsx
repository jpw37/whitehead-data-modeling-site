import type { Metadata } from "next";
import Image from "next/image";
import { RecentPublications } from "@/components/RecentPublications";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isWithinRollingPublicationWindow } from "@/content/publications";
import { nsfAwards, researchPrograms } from "@/content/research";

export const metadata: Metadata = {
  title: "Research | Data-Driven Modeling Group",
  description: "Research on generalization, interpretable model discovery, and cloud physics.",
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default function ResearchPage() {
  return (
    <main>
      <SiteHeader />
      <section className="inner-hero inner-hero-photo">
        <p className="kicker">Research</p>
        <h1>Using data to understand the models we build.</h1>
        <p>Our programs span two modeling regimes: systems with more parameters than classical intuition expects, and interpretable systems whose mechanisms can be discovered from observations.</p>
      </section>

      <nav className="section-jump" aria-label="Research programs">
        {researchPrograms.map((program) => <a href={`#${program.slug}`} key={program.slug}><span>{program.number}</span>{program.shortTitle}</a>)}
      </nav>

      <div className="research-detail-list">
        {researchPrograms.map((program) => {
          const recentHighlights = program.highlights.filter((highlight) => isWithinRollingPublicationWindow(highlight.publicationDate));

          return (
            <section className="research-program-detail" id={program.slug} key={program.slug}>
            <aside>
              <span className="detail-number">{program.number}</span>
              {program.eyebrow ? <p className="program-eyebrow">{program.eyebrow}</p> : null}
            </aside>
            <div className="research-program-body">
              <h2>{program.title}</h2>
              <p className="detail-lead">{program.overview}</p>
              {program.collaborators ? <p className="collaboration-line">{program.collaborators}</p> : null}

              <div className="question-block">
                <p className="kicker">Questions we are asking</p>
                <ul>{program.questions.map((question) => <li key={question}>{question}</li>)}</ul>
              </div>

              {program.funding ? (
                <article className="funding-card">
                  <a className="funder-logo-link" href={program.funding.agencyHref} target="_blank" rel="noreferrer">
                    <Image
                      className="funder-logo funder-logo-doe"
                      src={program.funding.logoSrc}
                      alt={program.funding.logoAlt}
                      width={program.funding.logoWidth}
                      height={program.funding.logoHeight}
                      sizes="(max-width: 640px) 80vw, 560px"
                    />
                  </a>
                  <p className="kicker"><a className="funder-identity-link" href={program.funding.agencyHref} target="_blank" rel="noreferrer">{program.funding.agencyLabel}</a></p>
                  <h3>{program.funding.label}</h3>
                  <p className="funding-card-copy">{program.funding.copy}</p>
                  <div className="funding-links">
                    <a href={program.funding.href} target="_blank" rel="noreferrer">About DOE’s Genesis Mission <span aria-hidden="true">↗</span></a>
                    <a href="#model-discovery">See the methodological foundation <span aria-hidden="true">↑</span></a>
                  </div>
                  <p className="funder-disclaimer">{program.funding.disclaimer}</p>
                </article>
              ) : null}

              {recentHighlights.length ? (
                <div className="highlights-block">
                  <div className="highlights-heading">
                    <p className="kicker">Published research highlights</p>
                    <p>Each highlight leads with the result, then provides the complete publication record.</p>
                  </div>
                  <div className="highlight-grid">
                    {recentHighlights.map((highlight) => (
                      <article className="highlight-card" key={highlight.href}>
                        <p className="highlight-label">{highlight.label}</p>
                        <h3>{highlight.takeaway}</h3>
                        <div className="publication-meta">
                          <cite>{highlight.title}</cite>
                          <span>{highlight.authors}</span>
                          <span>{highlight.citation}</span>
                        </div>
                        <a href={highlight.href} target="_blank" rel="noreferrer">Read the publication <span aria-hidden="true">↗</span></a>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
          );
        })}
      </div>

      <RecentPublications />

      <section className="research-support" aria-labelledby="research-support-heading">
        <div className="research-support-inner">
          <div className="research-support-brand">
            <a className="nsf-logo-link" href="https://www.nsf.gov/" target="_blank" rel="noreferrer">
              <Image className="nsf-logo" src="/images/funders/nsf-logo.png" alt="U.S. National Science Foundation" width={500} height={324} sizes="180px" />
            </a>
            <div>
              <p className="kicker">Research support</p>
              <h2 id="research-support-heading">Supported by the U.S. National Science Foundation</h2>
            </div>
          </div>

          <p className="research-support-copy">This material is based upon work supported by the U.S. National Science Foundation under the following current and recent awards to Jared P. Whitehead at Brigham Young University.</p>

          <div className="nsf-award-list">
            {nsfAwards.map((award) => (
              <a className="nsf-award" href={award.href} target="_blank" rel="noreferrer" key={award.number}>
                <span>{award.number}</span>
                <strong>{award.title}</strong>
                <small>View the NSF award record <span aria-hidden="true">↗</span></small>
              </a>
            ))}
          </div>

          <p className="support-disclaimer">Any opinions, findings, conclusions, or recommendations expressed on this site are those of the authors and do not necessarily reflect the views of the U.S. National Science Foundation.</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
