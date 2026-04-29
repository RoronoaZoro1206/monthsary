import { useState } from "react";
import { RevealSection } from "../components/RevealSection";
import { Heart } from "lucide-react";

const letterContent = `To my dearest Future Wife,

Happy 1st Monthsary, my Love <3 <3 <3

Thank you for being my peace, my joy, and my favorite person to share every single day with. Now, we're celebrating our first monthsary and the first month of being officially together lablab hehehehe.

Happy kaayo ko love kay nagkaila tang duha and the rest was history. Compatible kaayo tang duha like even sa times na we have misunderstandings kay mas pilion jud nato ang usa't-usa lablab nako and I'm very happy to be with someone na dili unahon ang pride kaysa love sa iyang partner.

Every laugh we share and every quiet moment we spend together love became my source of strength especially sa times na down kayko og stressed sa tanan-tanang butang mapa family problems or academic problems and naa dayon ako lablab to the rescue--kaya lablab kita masyado eh HAHAHAHHA. I always look forward to all our simple yet meaningful moments baby.

I promise jud sa imoha love nga maabot rajud times nga molambo nata together maong karon let's grind lang usa and enjoy these simple moments we have kay few years from now ma achieve nana nato ang dreams together and mas ma successful na tang duha sa life soon so manefisting love hehehehe.

I promise to keep loving you gently, honestly, and deeply through every beautiful chapter we write together. I'll always be your safe love and partner in life my future wife. I really really love you so so muchhh Shelly S. Quijano A.K.A My babygirl <333333.

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
            
            <div 
              className="letter-paper" 
              onClick={(e) => {
                if (isOpen) e.stopPropagation();
              }}
            >
               <div className="letter-header">
                 {/* <img src="/images/seal-stamp.png" alt="" className="watermark" /> */}
               </div>
               <div className="letter-content">
                 {letterContent}
               </div>
               <div className="letter-signature">Your  Future  Husband</div>
            </div>
            
            <div className="envelope-front"></div>
            
            <div className="envelope-flap-wrapper">
              <div className="envelope-flap"></div>
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
