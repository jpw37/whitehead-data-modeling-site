import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { alumniByLevel } from "@/content/mentoring";
import type { DegreeLevel } from "@/content/people";

export const metadata: Metadata = {
  title: "Group Alumni | Data-Driven Modeling Group",
  description: "Undergraduate, master's, and doctoral students mentored by Jared Whitehead.",
  openGraph: { images: [] },
  twitter: { images: [] },
};

export const dynamic = "force-static";

const levels: DegreeLevel[] = ["Undergraduate", "M.S.", "Ph.D."];

export default function AlumniPage() {
  return (
    <main>
      <SiteHeader />
      <section className="inner-hero alumni-hero">
        <p className="kicker">Group alumni</p>
        <h1>Alumni</h1>
      </section>

      <div className="alumni-sections">
        {levels.map((level) => (
          <section className="alumni-level" id={level.toLowerCase().replaceAll(".", "")} key={level}>
            <div className="alumni-level-heading">
              <p className="kicker">{level}</p>
              <h2>{level === "Undergraduate" ? "Undergraduate students" : `${level} students`}</h2>
            </div>
            <div className="alumni-grid">
              {alumniByLevel[level].map((person) => (
                <article className={`alumni-card${person.currentRole ? " alumni-card-featured" : ""}`} key={`${person.name}-${person.level}`}>
                  <div className="alumni-card-top">
                    <span className="degree-pill">{person.level}</span>
                    <span>{person.years}</span>
                  </div>
                  <h3>{person.name}</h3>
                  {person.currentRole ? <p className="current-role">{person.currentRole}</p> : null}
                  {person.note ? <p>{person.note}</p> : null}
                  {person.links?.map((link) => <a href={link.href} target="_blank" rel="noreferrer" key={link.href}>{link.label} <span aria-hidden="true">↗</span></a>)}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      <SiteFooter />
    </main>
  );
}
