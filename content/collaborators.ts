export type Collaborator = {
  name: string;
  context: string;
  href: string;
};

export const individualCollaborators: Collaborator[] = [
  {
    name: "Tyler Jarvis",
    context: "BYU Mathematics · generalization and generalized aliasing",
    href: "https://math.byu.edu/directory/jarvis-tyler",
  },
  {
    name: "Mark Transtrum",
    context: "Generalized aliasing and complex systems",
    href: "https://physics.byu.edu/department/directory/transtrum",
  },
  {
    name: "Gus Hart",
    context: "BYU Physics and Astronomy · machine learning and modeling",
    href: "https://physics.byu.edu/groups/theory",
  },
  {
    name: "Adam Larios",
    context: "University of Nebraska–Lincoln · mathematics",
    href: "https://math.unl.edu/person/adam-larios/",
  },
  {
    name: "Vincent R. Martinez",
    context: "CUNY Hunter College · mathematics",
    href: "https://math.hunter.cuny.edu/vmartine/",
  },
  {
    name: "Ali Pakzad",
    context: "Cal State Northridge · data assimilation and turbulence modeling",
    href: "https://sites.google.com/view/pakzad",
  },
  {
    name: "Amir Arzani",
    context: "University of Utah · biomedical engineering",
    href: "https://bio.mech.utah.edu/",
  },
  {
    name: "Leo G. Rebholz",
    context: "Clemson University · mathematical and statistical sciences",
    href: "https://www.clemson.edu/science/academics/departments/mathstat/about/profiles/rebholz",
  },
  {
    name: "Jorge Reyes Jr.",
    context: "Texas State University · numerical analysis and fluid dynamics",
    href: "https://faculty.txstate.edu/profile/2705034",
  },
  {
    name: "Nathan Glatt-Holtz",
    context: "Indiana University · statistics",
    href: "https://negh.pages.iu.edu/",
  },
  {
    name: "Juraj Földes",
    context: "University of Virginia · PDEs and probability",
    href: "https://uva.theopenscholar.com/juraj-foldes/",
  },
  {
    name: "Tuan N. Pham",
    context: "BYU–Hawaii · mathematics",
    href: "https://blogs.oregonstate.edu/tpham/",
  },
  {
    name: "Ron Harris",
    context: "BYU Geological Sciences · tectonics and natural hazards",
    href: "https://geology.byu.edu/directory/ron-a-harris",
  },
  {
    name: "Aseel Farhat",
    context: "University of Virginia · PDEs and fluid dynamics",
    href: "https://as.virginia.edu/faculty-profile/aseel-farhat",
  },
];

export const partnerInstitutions: Collaborator[] = [
  { name: "University of Nebraska–Lincoln", context: "Data-assimilation collaboration", href: "https://www.unl.edu/" },
  { name: "Michigan Technological University", context: "Cloud-physics collaboration", href: "https://www.mtu.edu/" },
  { name: "University of Utah", context: "Cloud-physics collaboration", href: "https://www.utah.edu/" },
  { name: "Brookhaven National Laboratory", context: "Cloud-physics collaboration", href: "https://www.bnl.gov/" },
  { name: "Pacific Northwest National Laboratory", context: "Cloud-physics collaboration", href: "https://www.pnnl.gov/" },
  { name: "NSF National Center for Atmospheric Research", context: "Cloud-physics collaboration", href: "https://ncar.ucar.edu/" },
];
