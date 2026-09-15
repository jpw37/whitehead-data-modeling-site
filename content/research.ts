export type ResearchHighlight = {
  label: string;
  takeaway: string;
  title: string;
  publicationDate: string;
  citation: string;
  authors: string;
  href: string;
};

export type ResearchProgram = {
  slug: string;
  number: string;
  eyebrow?: string;
  title: string;
  shortTitle: string;
  summary: string;
  overview: string;
  questions: string[];
  collaborators?: string;
  funding?: {
    label: string;
    copy: string;
    href: string;
    agencyLabel: string;
    agencyHref: string;
    logoSrc: string;
    logoAlt: string;
    logoWidth: number;
    logoHeight: number;
    disclaimer: string;
  };
  highlights: ResearchHighlight[];
};

export type ResearchAward = {
  number: string;
  title: string;
  href: string;
};

export const nsfAwards: ResearchAward[] = [
  {
    number: "DMS-2206762",
    title: "Data Assimilation for Turbulent Flows: Dynamic Model Learning and Solution Capturing",
    href: "https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2206762",
  },
  {
    number: "CCF-2343286",
    title: "XTRIPODS: Advances and Novel Applications of Closed-Loop Data Assimilation, and Educational Improvements to Data Science Courses",
    href: "https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2343286",
  },
  {
    number: "DMS-2510495",
    title: "Augmenting Continuous Data Assimilation to Perform Equation Discovery with Applications in Geophysics",
    href: "https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2510495",
  },
];

export const researchPrograms: ResearchProgram[] = [
  {
    slug: "generalization",
    number: "01",
    eyebrow: "Over-parameterized regime",
    title: "Generalization in complex models",
    shortTitle: "Generalization",
    summary: "We study why highly parameterized models can generalize, using generalized aliasing to clarify the relationship between data, representations, and prediction.",
    overview: "Modern predictive models can behave in ways that classical bias–variance intuition does not explain. We develop mathematical tools for separating the effects of the model, the data, and their interaction—then use those tools to understand when added complexity helps rather than hurts.",
    questions: [
      "What creates double- and multiple-descent behavior?",
      "Which aspects of a sampling design control generalization?",
      "Can model quality be assessed before labels are collected?",
    ],
    collaborators: "In collaboration with Tyler Jarvis, Mark Transtrum, Gus Hart, and student researchers at BYU.",
    highlights: [
      {
        label: "Featured result",
        takeaway: "Prediction error can be separated into model insufficiency, data insufficiency, and generalized aliasing. This decomposition explains double descent and can inform model and experimental design.",
        title: "Generalized aliasing explains double descent and informs model design",
        publicationDate: "2025-09-12",
        citation: "Physical Review Research 7, 043268 (2025)",
        authors: "Mark K. Transtrum, Gus L. W. Hart, Tyler J. Jarvis, and Jared P. Whitehead",
        href: "https://doi.org/10.1103/qy5r-p5b7",
      },
    ],
  },
  {
    slug: "model-discovery",
    number: "02",
    eyebrow: "Interpretable regime",
    title: "Interpretable models from data",
    shortTitle: "Model discovery",
    summary: "We combine continuous data assimilation and optimization to estimate parameters, discover equations, and identify physical mechanisms directly from observations.",
    overview: "Rather than replace physics with a black box, this program asks how incoming observations can improve a model while preserving a form that scientists can interpret. Continuous data assimilation synchronizes a model with observations; optimization then turns the remaining mismatch into information about unknown parameters, forcing, or equations.",
    questions: [
      "Can state and parameters be recovered at the same time?",
      "How little of a complex system must be observed?",
      "Which optimization schemes remain reliable in chaotic dynamics?",
    ],
    highlights: [
      {
        label: "Research highlight",
        takeaway: "Continuous data assimilation turns online model discovery into a finite-dimensional optimization problem, enabling multiple unknown parameters to be updated as observations arrive.",
        title: "Model discovery on the fly using continuous data assimilation",
        publicationDate: "2025-05-25",
        citation: "Journal of Computational Physics 537, 114121 (2025)",
        authors: "Joshua Newey, Jared P. Whitehead, and Elizabeth Carlson",
        href: "https://doi.org/10.1016/j.jcp.2025.114121",
      },
      {
        label: "Research highlight",
        takeaway: "Relaxation least-squares and Newton schemes provide a general framework for recovering unknown state and parameters simultaneously in dissipative systems.",
        title: "Relaxation-based schemes for on-the-fly parameter estimation in dissipative dynamical systems",
        publicationDate: "2025-03-31",
        citation: "Inverse Problems 41, 055001 (2025)",
        authors: "Vincent R. Martinez, Jacob Murri, and Jared P. Whitehead",
        href: "https://doi.org/10.1088/1361-6420/adc766",
      },
      {
        label: "Research highlight",
        takeaway: "A complicated forcing mechanism in turbulent flow can be reconstructed from observations containing fewer than ten percent of the modes used to describe the full system.",
        title: "Identifying the body force from partial observations of a two-dimensional incompressible velocity field",
        publicationDate: "2024-05-06",
        citation: "Physical Review Fluids 9, 054602 (2024)",
        authors: "Aseel Farhat, Adam Larios, Vincent R. Martinez, and Jared P. Whitehead",
        href: "https://doi.org/10.1103/PhysRevFluids.9.054602",
      },
    ],
  },
  {
    slug: "cloud-physics",
    number: "03",
    title: "Discovering cloud physics",
    shortTitle: "Cloud physics",
    summary: "We apply interpretable model-discovery methods with a multi-institution team to reveal unresolved physical processes in cloud models.",
    overview: "Cloud models contain physical processes that occur below the scales a simulation can resolve. This project brings model discovery into that setting: use sparse, evolving observations to identify missing or misspecified processes while retaining equations that scientists can inspect and test.",
    questions: [
      "Which unresolved processes leave identifiable signatures in observations?",
      "Can those processes be represented by interpretable equations?",
      "How do discoveries transfer across models and observing systems?",
    ],
    collaborators: "A multi-institution effort with Michigan Technological University, the University of Utah, Brookhaven National Laboratory, Pacific Northwest National Laboratory, and NSF NCAR.",
    funding: {
      label: "DOE-supported research in progress",
      copy: "This program is supported through the U.S. Department of Energy's Genesis Mission. The project is now adapting the model-discovery methods developed in our interpretable-modeling program to cloud physics; no cloud-physics results have been published yet.",
      href: "https://genesis.energy.gov/",
      agencyLabel: "U.S. Department of Energy Awardee",
      agencyHref: "https://www.energy.gov/",
      logoSrc: "/images/funders/doe-awardee-logo.png",
      logoAlt: "U.S. Department of Energy Awardee",
      logoWidth: 4516,
      logoHeight: 900,
      disclaimer: "Logo was developed by the U.S. Department of Energy to indicate receipt of DOE funding. Not an endorsement by DOE.",
    },
    highlights: [],
  },
];
