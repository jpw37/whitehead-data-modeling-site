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

// Add an optional portrait under /public/images/people and set photo below.
// Move former students to content/mentoring.ts when their work with the group ends.
export const people: Person[] = [
  {
    slug: "jared-whitehead",
    name: "Jared Whitehead",
    role: "Principal investigator",
    affiliation: "Brigham Young University",
    bio:
      "Jared Whitehead is an associate professor of mathematics at Brigham Young University. His group studies how data can be used to build, understand, and improve mathematical models, from highly over-parameterized learning systems to interpretable models of physical processes.",
    links: [
      { label: "BYU Mathematics", href: "https://math.byu.edu/" },
      { label: "Google Scholar", href: "https://scholar.google.com/citations?user=lLR_YEYAAAAJ" },
      { label: "CV", href: "/vita.pdf" },
    ],
    active: true,
    verified: true,
  },
  {
    slug: "ashley-spencer",
    name: "Ashley Spencer",
    role: "Graduate researcher",
    affiliation: "Brigham Young University",
    levels: ["M.S."],
    years: "Current",
    active: true,
    verified: true,
  },
  {
    slug: "ashtyn-whipple",
    name: "Ashtyn Whipple",
    role: "Undergraduate researcher",
    affiliation: "Brigham Young University",
    levels: ["Undergraduate"],
    years: "2024–present",
    active: true,
    verified: true,
  },
  {
    slug: "thea-spigarelli",
    name: "Thea Spigarelli",
    role: "Undergraduate researcher",
    affiliation: "Brigham Young University",
    levels: ["Undergraduate"],
    years: "2024–present",
    active: true,
    verified: true,
  },
  {
    slug: "quinn-oveson",
    name: "Quinn Oveson",
    role: "Undergraduate researcher",
    affiliation: "Brigham Young University",
    levels: ["Undergraduate"],
    years: "2026–present",
    active: true,
    verified: true,
  },
  {
    slug: "lydia-tolman",
    name: "Lydia Tolman",
    role: "Graduate researcher",
    affiliation: "Brigham Young University",
    levels: ["M.S."],
    years: "2025–present",
    active: true,
    verified: true,
  },
  {
    slug: "tiara-eddington",
    name: "Tiara Eddington",
    role: "Graduate researcher",
    affiliation: "Brigham Young University",
    levels: ["M.S."],
    years: "2025–present",
    active: true,
    verified: true,
  },
  {
    slug: "eli-sampson",
    name: "Eli Sampson",
    role: "Graduate researcher",
    affiliation: "Brigham Young University",
    levels: ["M.S."],
    years: "2025–present",
    active: true,
    verified: true,
  },
  {
    slug: "dawson-collins",
    name: "Dawson Collins",
    role: "Doctoral researcher",
    affiliation: "Brigham Young University",
    levels: ["Ph.D."],
    years: "Current",
    active: true,
    verified: true,
  },
  {
    slug: "wyatt-wimmer",
    name: "Wyatt Wimmer",
    role: "Graduate researcher",
    affiliation: "Brigham Young University",
    levels: ["M.S."],
    years: "2025–present",
    active: true,
    verified: true,
  },
];

export const activePeople = people.filter((person) => person.active);

export const featuredPeople = activePeople.filter(
  (person) => person.slug === "jared-whitehead",
);
