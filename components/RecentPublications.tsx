import { isWithinRollingPublicationWindow, publicationFeedMeta, recentPublications } from "@/content/publications";

function formatPublicationDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatAuthors(authors: string[]) {
  if (authors.length <= 5) return authors.join(", ");
  return `${authors.slice(0, 4).join(", ")}, and ${authors.length - 4} others`;
}

export function RecentPublications() {
  const publications = recentPublications.filter((publication) => isWithinRollingPublicationWindow(publication.date));

  if (!publications.length) return null;

  return (
    <section className="recent-publications" aria-labelledby="recent-publications-heading">
      <div className="recent-publications-inner">
        <div className="recent-publications-heading">
          <div>
            <p className="kicker">Rolling publication highlights</p>
            <h2 id="recent-publications-heading">Publications from the past two years</h2>
          </div>
          <p>New journal articles and arXiv preprints are added automatically and leave this section after 24 months. Hand-edited summaries are preserved when the metadata refreshes.</p>
        </div>

        <div className="recent-publication-grid">
          {publications.map((publication) => {
            const isPreprint = publication.type === "preprint";

            return (
              <article className="recent-publication-card" key={publication.key}>
                <p className="recent-publication-date">
                  <time dateTime={publication.date}>{formatPublicationDate(publication.date)}</time>
                  {publication.venue ? ` · ${publication.venue}` : ""}
                  {isPreprint ? <span className="publication-kind">Preprint</span> : null}
                </p>
                <h3>{publication.title}</h3>
                <p className="recent-publication-summary">{publication.summary}</p>
                <p className="recent-publication-authors">{formatAuthors(publication.authors)}</p>
                <a href={publication.href} target="_blank" rel="noreferrer">Read the {isPreprint ? "preprint" : "publication"} <span aria-hidden="true">↗</span></a>
              </article>
            );
          })}
        </div>

        <div className="publication-feed-footer">
          <p>Metadata is cross-checked through {publicationFeedMeta.sources.join(", ")}, with additional identity checks wherever an author index is ambiguous. Thank you to arXiv for use of its open access interoperability.</p>
          <a className="scholar-profile-link" href={publicationFeedMeta.author.googleScholarUrl} target="_blank" rel="noreferrer">View Jared Whitehead’s complete Google Scholar profile <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
