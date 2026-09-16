import generatedStudentProfiles from "./student-profiles.generated.json";

export type DegreeLevel = "Undergraduate" | "M.S." | "Ph.D.";

export type PersonLink = {
  label: string;
  href: string;
};

export type Person = {
  slug: string;
  name: string;
  role: string;
  affiliation: string;
  bio?: string;
  levels?: DegreeLevel[];
  years?: string;
  programs?: string[];
  photo?: string;
  links?: PersonLink[];
  active: boolean;
  verified: boolean;
};

const principalInvestigator: Person = {
  slug: "jared-whitehead",
  name: "Jared Whitehead",
  role: "Professor & principal investigator",
  affiliation: "Brigham Young University",
  bio:
    "Jared Whitehead is a professor of mathematics at Brigham Young University. His group studies how data can be used to build, understand, and improve mathematical models, from highly over-parameterized learning systems to interpretable models of physical processes.",
  photo: "/images/jared-whitehead.jpg",
  links: [
    { label: "BYU Mathematics", href: "https://math.byu.edu/" },
    { label: "Google Scholar", href: "https://scholar.google.com/citations?user=lLR_YEYAAAAJ" },
    { label: "CV", href: "/vita.pdf" },
  ],
  active: true,
  verified: true,
};

// Student profiles are generated from reviewed Google Form responses. The seed
// file preserves the current roster until each person submits their first update.
const studentProfiles = generatedStudentProfiles.profiles as Person[];

export const people: Person[] = [principalInvestigator, ...studentProfiles];

export const activePeople = people.filter((person) => person.active);

export const featuredPeople = activePeople.filter(
  (person) => person.slug === "jared-whitehead",
);
