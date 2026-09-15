import type { DegreeLevel, PersonLink } from "./people";

export type Mentee = {
  name: string;
  level: DegreeLevel;
  years: string;
  note?: string;
  currentRole?: string;
  links?: PersonLink[];
};

// Mentoring periods are transcribed from Jared Whitehead's supplied CV and
// subsequent roster updates.
// Optional current roles, portraits, and websites can be added to any record.
export const alumni: Mentee[] = [
  {
    name: "Shane McQuarrie",
    level: "Undergraduate",
    years: "2014–2016",
    links: [
      {
        label: "BYU Mathematics profile",
        href: "https://math.byu.edu/directory/shane-mcquarrie",
      },
    ],
  },
  { name: "Jessica Eggleston (Layton)", level: "Undergraduate", years: "2014–2016" },
  { name: "Austin Talbot", level: "Undergraduate", years: "2014–2015" },
  { name: "Tucker Albers", level: "Undergraduate", years: "2014–2015" },
  { name: "Marcus Horton", level: "Undergraduate", years: "2014–2015" },
  { name: "Ned Thomas", level: "Undergraduate", years: "2014–2015" },
  { name: "Allayna McFarlane", level: "Undergraduate", years: "2015", note: "Also supervised at the M.S. level" },
  { name: "Aaron Escamilla", level: "Undergraduate", years: "2015–2016" },
  { name: "David Reber", level: "Undergraduate", years: "2015–2016" },
  { name: "Webster Wong", level: "Undergraduate", years: "2015–2018" },
  { name: "Alexander White", level: "Undergraduate", years: "2016–2017" },
  { name: "Martha Morrise", level: "Undergraduate", years: "2017–2018" },
  { name: "Spencer Giddens", level: "Undergraduate", years: "2017–2018", note: "Also supervised at the M.S. level" },
  { name: "Joshua Fullwood", level: "Undergraduate", years: "2017–2019" },
  { name: "Easton Dunn", level: "Undergraduate", years: "2017" },
  { name: "Hunter Klein", level: "Undergraduate", years: "2017–2019", note: "Mechanical Engineering" },
  { name: "Bryce Berrett", level: "Undergraduate", years: "2017–2019", note: "Geology / Civil Engineering" },
  { name: "Cody Kessler", level: "Undergraduate", years: "2018–2019" },
  { name: "Adam Robertson", level: "Undergraduate", years: "2018–2020" },
  { name: "Mckay Harward", level: "Undergraduate", years: "2018–2020" },
  { name: "Garrett Carver", level: "Undergraduate", years: "2018–2026" },
  { name: "Josh Lapicola", level: "Undergraduate", years: "2019–2021" },
  { name: "Camille Carter", level: "Undergraduate", years: "2019–2020" },
  { name: "Alice Oveson", level: "Undergraduate", years: "2019" },
  { name: "Ryan Hilton", level: "Undergraduate", years: "2019–2021" },
  { name: "Mingyan Zhao", level: "Undergraduate", years: "2019" },
  { name: "Ashley Avery", level: "Undergraduate", years: "2019–2026" },
  { name: "Kameron Lightheart", level: "Undergraduate", years: "2020", note: "Also supervised at the M.S. level" },
  { name: "Isaac Sorenson", level: "Undergraduate", years: "2020–2022" },
  { name: "Zac Yauney", level: "Undergraduate", years: "2020–2021" },
  { name: "Patrick Beal", level: "Undergraduate", years: "2021" },
  { name: "Dallin Stuart", level: "Undergraduate", years: "2022–2024" },
  { name: "Paul Smith", level: "Undergraduate", years: "2022–2026", note: "Also supervised at the M.S. level" },
  { name: "Luke Green", level: "Undergraduate", years: "2023" },
  { name: "Ilha Hwang", level: "Undergraduate", years: "2023–2026" },
  { name: "Ashley Spencer", level: "Undergraduate", years: "2023–2026", note: "Continued with the group at the M.S. level" },
  { name: "Wyatt Wimmer", level: "Undergraduate", years: "2023–2025", note: "Continued with the group at the M.S. level" },
  { name: "Cameron Chamberlain", level: "Undergraduate", years: "2024" },
  { name: "Addison Dhulst", level: "Undergraduate", years: "2024–2025" },
  { name: "Benjamin Harris", level: "Undergraduate", years: "2024" },
  { name: "Brie Barzee", level: "Undergraduate", years: "2024" },
  { name: "Emily Martin", level: "Undergraduate", years: "2024" },
  { name: "Stella Martin", level: "Undergraduate", years: "2024" },
  { name: "Hannah Bloomfield", level: "Undergraduate", years: "2024–2025" },
  { name: "Nephi Suryama", level: "Undergraduate", years: "2024–2026" },
  { name: "Norman Rasmussen", level: "Undergraduate", years: "2024–2026" },
  { name: "Rowan Williams", level: "Undergraduate", years: "2025–2026" },
  { name: "Emmaline McKinnon", level: "Undergraduate", years: "2025–2026" },
  { name: "Jacob Schonlau", level: "Undergraduate", years: "2026" },
  { name: "Spencer Bringhurst", level: "Undergraduate", years: "2026" },
  { name: "Allayna McFarlane", level: "M.S.", years: "2015–2017" },
  {
    name: "Shane McQuarrie",
    level: "M.S.",
    years: "2016–2018",
    currentRole: "Assistant Professor · Brigham Young University Mathematics",
    links: [
      {
        label: "BYU Mathematics profile",
        href: "https://math.byu.edu/directory/shane-mcquarrie",
      },
    ],
  },
  { name: "Yajing Zhao", level: "M.S.", years: "2017–2020" },
  { name: "Spencer Giddens", level: "M.S.", years: "2018–2020" },
  { name: "Hayden Ringer", level: "M.S.", years: "2018–2020" },
  { name: "Benjamin Pachev", level: "M.S.", years: "2019–2020" },
  { name: "McKenna Pitts", level: "M.S.", years: "2020–2021" },
  { name: "Marja Crawford", level: "M.S.", years: "2019–2022" },
  { name: "Kameron Lightheart", level: "M.S.", years: "2020–2021" },
  { name: "Taylor Paskett", level: "M.S.", years: "2020–2022" },
  { name: "James Griffin", level: "M.S.", years: "2020–2022" },
  { name: "Carol Herrera Glenn", level: "M.S.", years: "2021–2022" },
  {
    name: "Jacob Murri",
    level: "M.S.",
    years: "2021–2022",
    currentRole: "Ph.D. candidate in applied mathematics · UCLA",
    links: [
      {
        label: "Personal website",
        href: "https://www.jwmurri.com/home",
      },
    ],
  },
  { name: "Jake Callahan", level: "M.S.", years: "2021–2023" },
  { name: "Raelynn Wonnacott", level: "M.S.", years: "2021–2023" },
  { name: "Chelsey Noorda", level: "M.S.", years: "2021–2023" },
  { name: "Kelly Chang", level: "M.S.", years: "2022–2024" },
  { name: "Joshua Newey", level: "M.S.", years: "2022–2024" },
  { name: "Collin Free", level: "M.S.", years: "2022–2023" },
  { name: "Paul Smith", level: "M.S.", years: "2023–2025" },
  { name: "Nathan Schill", level: "M.S.", years: "2024–2026" },
  { name: "Melanie Neller", level: "M.S.", years: "2024–2026" },
  {
    name: "Zhao Pan",
    level: "Ph.D.",
    years: "2015–2016",
    currentRole: "Associate Professor, Mechanical and Mechatronics Engineering · University of Waterloo",
    links: [
      {
        label: "University of Waterloo profile",
        href: "https://uwaterloo.ca/mechanical-mechatronics-engineering/contacts/zhao-pan",
      },
    ],
  },
  { name: "Ryan Wood", level: "Ph.D.", years: "2017–2019", note: "Chemical Engineering" },
];

export const alumniByLevel = {
  Undergraduate: alumni.filter((person) => person.level === "Undergraduate"),
  "M.S.": alumni.filter((person) => person.level === "M.S."),
  "Ph.D.": alumni.filter((person) => person.level === "Ph.D."),
};
