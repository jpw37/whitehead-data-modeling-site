import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { sitePath } from "@/lib/site";

export const metadata: Metadata = {
  title: "Previous Work | Data-Driven Modeling Group",
  description: "Previous research using historical Indonesian tsunami records, Bayesian inference, MCMC, and GeoClaw to reconstruct earthquakes and assess seismic risk.",
  openGraph: { images: [] },
  twitter: { images: [] },
};

export const dynamic = "force-static";

const publications = [
  {
    takeaway: "Sparse, anecdotal historical accounts can still yield meaningful earthquake estimates when their uncertainty is modeled explicitly.",
    title: "Embracing Uncertainty in ‘Small Data’ Problems: Estimating Earthquakes From Historical Anecdotes",
    citation: "Journal of Geophysical Research: Machine Learning and Computation 2 (2025)",
    href: "https://doi.org/10.1029/2025JH000667",
  },
  {
    takeaway: "Nearly 200,000 tsunami simulations helped compare competing source hypotheses for the 1820 Flores Sea earthquake.",
    title: "A tale of two faults: statistical reconstruction of the 1820 Flores Sea earthquake using tsunami observations alone",
    citation: "Geophysical Journal International 237, 419–435 (2024)",
    href: "https://doi.org/10.1093/gji/ggae044",
  },
];

export default function PreviousWorkPage() {
  return (
    <main>
      <SiteHeader />
      <section className="inner-hero previous-hero">
        <p className="kicker">Previous work</p>
        <h1>Reconstructing earthquakes from historical tsunamis.</h1>
        <p>This work used historical records of tsunamis—particularly accounts recorded by Dutch soldiers in Indonesia—to identify the earthquakes that caused them and strengthen modern seismic and tsunami risk assessment.</p>
      </section>

      <section className="archive-overview">
        <div>
          <p className="kicker">Historical tsunami inference</p>
          <h2>Connecting eyewitness accounts to modern hazard assessment.</h2>
        </div>
        <div>
          <p className="detail-lead">Bayesian statistical techniques, including extensive use of Markov chain Monte Carlo (MCMC), made it possible to compare competing earthquake scenarios and quantify uncertainty from sparse historical observations.</p>
          <p>The GeoClaw software package was used extensively to simulate tsunami generation and propagation, allowing modeled wave heights and arrival times to be compared with the historical record.</p>
          <div className="fulbright-support">
            <a href="https://fulbrightscholars.org/what-fulbright/fulbright-scholar-program" target="_blank" rel="noreferrer" aria-label="Learn about the Fulbright Scholar Program">
              <Image className="fulbright-logo" src={sitePath("/images/funders/fulbright-scholar-program.svg")} alt="Fulbright Scholar Program" width={1200} height={300} sizes="(max-width: 640px) 80vw, 300px" unoptimized />
            </a>
            <p>Jared Whitehead was supported by a Fulbright Faculty Award to visit Bandung Institute of Technology in the winter of 2025, strengthening research collaboration in Indonesia.</p>
          </div>
        </div>
      </section>

      <section className="archive-publications">
        <p className="kicker">Selected publications</p>
        <div className="highlight-grid">
          {publications.map((publication) => (
            <article className="highlight-card" key={publication.href}>
              <p className="highlight-label">Published result</p>
              <h3>{publication.takeaway}</h3>
              <div className="publication-meta"><cite>{publication.title}</cite><span>{publication.citation}</span></div>
              <a href={publication.href} target="_blank" rel="noreferrer">Read the publication <span aria-hidden="true">↗</span></a>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
