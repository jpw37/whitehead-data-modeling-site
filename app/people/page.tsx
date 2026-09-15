import type { Metadata } from "next";
import { DegreeBadges } from "@/components/DegreeBadges";
import { PersonProfile } from "@/components/PersonProfile";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { individualCollaborators, partnerInstitutions } from "@/content/collaborators";
import { activePeople } from "@/content/people";

export const metadata: Metadata = {
  title: "People | Data-Driven Modeling Group",
  description: "Current members, colleagues, and collaborators in the Data-Driven Modeling Group.",
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default function PeoplePage() {
  const profiles = activePeople.filter((person) => person.verified);
  const importedRoster = activePeople.filter((person) => !person.verified);

  return (
    <main>
      <SiteHeader />
      <section className="inner-hero">
        <p className="kicker">People</p>
        <h1>Research is a team effort.</h1>
        <p>Our directory connects each person’s interests and degree level to the projects, publications, and collaborations they help advance.</p>
      </section>

      <section className="directory-section">
        <div className="section-title-row">
          <div><p className="kicker">Current profiles</p><h2>Group members</h2></div>
          <p>Profiles support a brief bio, portrait, degree level, research programs, and external links.</p>
        </div>
        <div className="people-grid profile-grid">
          {profiles.map((person) => <PersonProfile person={person} key={person.slug} />)}
        </div>

        {importedRoster.length ? (
          <>
            <div className="draft-roster-note">
              <strong>Roster review before launch</strong>
              <p>The names below were imported from the supplied CV because it lists them as “present.” Their current status and profile details should be confirmed before the site is made public.</p>
            </div>
            <div className="current-roster">
              {importedRoster.map((person) => (
                <article className="roster-row" key={person.slug}>
                  <div>
                    <h3>{person.name}</h3>
                    <p>{person.years}</p>
                  </div>
                  <DegreeBadges levels={person.levels} />
                  <span className="roster-action">Bio, photo & links ready to add</span>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section className="collaborator-section">
        <div className="section-title-row">
          <div><p className="kicker">Network</p><h2>Colleagues & collaborators</h2></div>
          <p>Individual and institutional links can be expanded as projects develop.</p>
        </div>
        <div className="collaborator-columns">
          <div>
            <h3>Research colleagues</h3>
            {individualCollaborators.map((collaborator) => (
              <a className="collaborator-link" href={collaborator.href} target="_blank" rel="noreferrer" key={collaborator.href}>
                <span><strong>{collaborator.name}</strong><small>{collaborator.context}</small></span><span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
          <div>
            <h3>Partner institutions</h3>
            {partnerInstitutions.map((collaborator) => (
              <a className="collaborator-link" href={collaborator.href} target="_blank" rel="noreferrer" key={collaborator.href}>
                <span><strong>{collaborator.name}</strong><small>{collaborator.context}</small></span><span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
        <a className="button button-primary" href="/alumni">View group alumni</a>
      </section>
      <SiteFooter />
    </main>
  );
}
