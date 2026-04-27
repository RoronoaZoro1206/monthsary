import { RevealSection } from "../components/RevealSection";

const defaultLetter = `My dearest Shelly,

Happy 1st Monthsary, Love.

Thank you for being my peace, my joy, and my favorite person to share every day with. Since April 30, 2026, every moment with you feels more meaningful and more beautiful.

I adore your smile, your kindness, and the way your presence makes my heart feel safe and full.

I promise to keep loving you gently, honestly, and deeply through every chapter we write together.

Forever yours.`;

export function LetterTab() {
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
