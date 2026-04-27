import { RevealSection } from "../components/RevealSection";
import { defaultLetter } from "../types";

export function LetterPage() {
  return (
    <>
      <RevealSection className="hero-card">
        <p className="date-badge">✦ April 30, 2026 ✦</p>
        <h1>Happy 1st Monthsary!</h1>
        <p className="hero-subtitle">For Shelly S. Quijano — my forever baby girl and Love of my life</p>
        <p className="hero-description">
          This page is a little love story made for you: soft, gentle, and full of the moments
          that made our first month unforgettable.
        </p>
      </RevealSection>

      <RevealSection id="love-letter" className="letter-card" delay={120}>
        <header className="section-header">
          <h2>My Letter to You</h2>
          <p className="section-sub">Words written from the heart.</p>
        </header>
        <article className="letter-preview" aria-live="polite">
          {defaultLetter}
        </article>
      </RevealSection>
    </>
  );
}
