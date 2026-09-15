import type { DegreeLevel } from "@/content/people";

export function DegreeBadges({ levels }: { levels?: DegreeLevel[] }) {
  if (!levels?.length) return null;

  return (
    <div className="degree-badges" aria-label={`Degree level: ${levels.join(", ")}`}>
      {levels.map((level) => <span key={level}>{level}</span>)}
    </div>
  );
}
