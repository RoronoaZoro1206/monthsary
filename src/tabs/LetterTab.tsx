import { useState } from "react";
import { RevealSection } from "../components/RevealSection";
import { Heart } from "lucide-react";

const letterContent = `My dearest Shelly,

Happy 1st Monthsary, my Love.

Thank you for being my peace, my joy, and my favorite person to share every single day with. Since April 30, 2026, every moment with you feels infinitely more meaningful and more beautiful.

I adore your smile, the genuine kindness in your eyes, and the gentle way your presence makes my heart feel completely safe and full. You have a magical way of making the ordinary feel extraordinary just by being there. 

Every laugh we share and every quiet moment we spend together reinforces how lucky I am to have found you. I look forward to all our simple mornings and our cozy evenings.

I promise to keep loving you gently, honestly, and deeply through every beautiful chapter we write together. I'll always be your safe harbor, your biggest supporter, and your closest confidant.

Forever yours,`;

export function LetterTab() {
  const [isOpen, setIsOpen] = useState(false);

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
          <h2>A Letter Just For You</h2>
          <p className="section-sub">Words written from the heart.</p>
        </header>
        
        <div className={`envelope-wrapper ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
          <div className="envelope">
            <div className="envelope-back"></div>
            
            <div className="letter-paper">
               <div className="letter-header">
                 {/* <img src="/images/seal-stamp.png" alt="" className="watermark" /> */}
               </div>
               <div className="letter-content">
                 {letterContent}
               </div>
               <div className="letter-signature">Lawrence</div>
            </div>
            
            <div className="envelope-front"></div>
            
            <div className="envelope-flap">
              <div className="wax-seal"></div>
            </div>
            
            <div className="envelope-hint">
               <Heart size={16} />
               <span>{isOpen ? "Click to read" : "Break the seal"}</span>
               <Heart size={16} />
            </div>
          </div>
        </div>
      </RevealSection>
    </>
  );
}
