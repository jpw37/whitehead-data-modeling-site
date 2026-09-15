import Image from "next/image";
import type { Person } from "@/content/people";
import { sitePath } from "@/lib/site";
import { DegreeBadges } from "./DegreeBadges";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join("");
}

export function PersonProfile({ person, compact = false }: { person: Person; compact?: boolean }) {
  return (
    <article className={`person-card${compact ? " person-card-compact" : ""}`} id={person.slug}>
      {person.photo ? (
        <Image className="portrait-photo" src={sitePath(person.photo)} alt={`Portrait of ${person.name}`} width={720} height={720} />
      ) : (
        <div className="portrait-placeholder" aria-hidden="true">{initials(person.name)}</div>
      )}
      <div>
        <div className="person-topline">
          <p className="person-role">{person.role}</p>
          <DegreeBadges levels={person.levels} />
        </div>
        <h3>{person.name}</h3>
        <p className="person-affiliation">{person.affiliation}{person.years ? ` · ${person.years}` : ""}</p>
        {person.bio ? <p>{person.bio}</p> : <p className="profile-prompt">Brief bio and research interests can be added here.</p>}
        {person.programs?.length ? (
          <div className="tag-list">
            {person.programs.map((program) => <span key={program}>{program}</span>)}
          </div>
        ) : null}
        {person.links?.length ? (
          <div className="person-links">
            {person.links.map((link) => link.href.startsWith("/") ? (
              <a href={sitePath(link.href)} key={link.href}>{link.label}</a>
            ) : (
              <a href={link.href} key={link.href} target="_blank" rel="noreferrer">{link.label}</a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
