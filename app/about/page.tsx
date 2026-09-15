import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { sitePath } from "@/lib/site";

export const metadata: Metadata = {
  title: "About | Data-Driven Modeling Group",
  description: "About Jared Whitehead, BYU ACME curriculum development, and the values behind the group.",
  openGraph: { images: [] },
  twitter: { images: [] },
};

export const dynamic = "force-static";

const acmeLinks = [
  { label: "Explore the ACME program", href: "https://acme.byu.edu/" },
  { label: "View degree requirements", href: "https://acme.byu.edu/degree-requirements" },
  { label: "Browse curriculum materials", href: "https://acme.byu.edu/textbooks-and-lab-materials" },
  { label: "See ACME contributors", href: "https://labs.acme.byu.edu/Pages/Contributors.html" },
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <section className="inner-hero about-hero">
        <p className="kicker">About</p>
        <h1>Mathematics grounded in data, collaboration, and experience.</h1>
        <p>Jared P. Whitehead is a professor of mathematics at Brigham Young University. He studies how data can help us understand why models work and how to discover better, interpretable descriptions of physical systems.</p>
      </section>

      <section className="acme-section" id="acme">
        <div className="acme-title">
          <p className="kicker">BYU ACME</p>
          <h2>Building an integrated applied-mathematics education.</h2>
        </div>
        <div className="acme-copy">
          <p className="detail-lead">Jared has played a substantial role in developing the curriculum for BYU’s Applied and Computational Mathematics Emphasis (ACME), an integrated degree combining rigorous mathematics, statistics, computation, and application-driven laboratory work.</p>
          <p>That curriculum work and the research group share the same conviction: students learn difficult mathematics most deeply when theory, computation, and real problems continually inform one another.</p>
          <div className="acme-links">
            {acmeLinks.map((link) => <a href={link.href} target="_blank" rel="noreferrer" key={link.href}>{link.label}<span aria-hidden="true">↗</span></a>)}
          </div>
        </div>
      </section>

      <section className="outdoors-section">
        <div className="outdoors-copy">
          <h2>Outside of work</h2>
          <p>Jared enjoys hiking, mountain biking, backpacking, rock climbing, canyoneering, and trail running whenever possible. He enjoys these activities most when sharing them with his wife and five children, three of whom are still at home.</p>
        </div>
        <div className="outdoors-gallery">
          <figure className="outdoors-wide">
            <Image src={sitePath("/images/mountain-panorama.jpg")} alt="A trail crossing a broad alpine basin beneath red mountain ridges" width={2600} height={866} sizes="(max-width: 760px) 100vw, 70vw" />
          </figure>
          <figure>
            <Image src={sitePath("/images/backpacking-overlook.jpg")} alt="Four backpackers looking across an alpine valley" width={1800} height={1350} sizes="(max-width: 760px) 100vw, 35vw" />
          </figure>
          <figure>
            <Image src={sitePath("/images/trail-running.jpg")} alt="A runner moving along a shaded woodland trail" width={1800} height={1350} sizes="(max-width: 760px) 100vw, 35vw" />
          </figure>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
