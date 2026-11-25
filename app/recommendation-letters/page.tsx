import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Recommendation Letters | Data-Driven Modeling Group",
  description: "How to request a letter of recommendation from Jared P. Whitehead: timing, application materials, deadlines, and submission instructions.",
  openGraph: { images: [] },
  twitter: { images: [] },
};

export const dynamic = "force-static";

export default function RecommendationLettersPage() {
  return (
    <main>
      <SiteHeader />
      <section className="inner-hero recommendation-hero">
        <p className="kicker">For students</p>
        <h1>Requesting a letter of recommendation</h1>
        <p>I’m glad to hear about your next steps. Please ask whether I can write a strong letter for you before listing me as a recommender.</p>
      </section>

      <div className="recommendation-layout">
        <aside className="recommendation-timing" aria-labelledby="request-timing">
          <p className="kicker">Plan ahead</p>
          <h2 id="request-timing">At least two weeks before your first deadline.</h2>
          <p>Earlier is appreciated. Send your materials and arrange submission requests with that earliest deadline in mind.</p>
          <a className="button button-primary" href="mailto:whitehead@mathematics.byu.edu?subject=Letter%20of%20recommendation%20request">Email your request</a>
          <a className="recommendation-email" href="mailto:whitehead@mathematics.byu.edu">whitehead@mathematics.byu.edu</a>
        </aside>

        <div className="recommendation-steps">
          <section aria-labelledby="request-materials">
            <p className="kicker">01 · Prepare</p>
            <h2 id="request-materials">Send one complete email.</h2>
            <p>Please include the following, with application documents as PDFs where possible:</p>
            <ul>
              <li>Your CV or résumé and an unofficial transcript.</li>
              <li>Drafts of your application statements or proposals, plus any instructions for recommenders.</li>
              <li>A list of programs or opportunities, deadlines with time zones, and submission methods.</li>
              <li>A reminder of our work together: courses and terms, research, projects, or other interactions.</li>
              <li>Your future goals, why each opportunity fits, and accomplishments or strengths you hope I can discuss.</li>
            </ul>
          </section>

          <section aria-labelledby="request-submission">
            <p className="kicker">02 · Coordinate</p>
            <h2 id="request-submission">Arrange the submission requests.</h2>
            <p>After I agree, trigger the application systems’ recommendation emails together when possible. Tell me whether a general letter will work or a particular program needs a tailored letter.</p>
          </section>

          <section aria-labelledby="request-follow-up">
            <p className="kicker">03 · Stay in touch</p>
            <h2 id="request-follow-up">Reminders are welcome.</h2>
            <p>If a deadline is approaching and the letter is still outstanding, please follow up. Send changes to your deadlines or application list in the same email thread.</p>
          </section>

          <p className="recommendation-credit">Adapted from <a href="https://adamlarios.github.io/LetterChecklist.html" target="_blank" rel="noreferrer">Adam Larios’s guidance for requesting recommendation letters</a>.</p>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
