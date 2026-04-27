import { useMemo } from "react";
import { HeartStyle } from "../types";

export function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
        const style: HeartStyle = {
          left: `${Math.random() * 100}%`,
          animationDuration: `${14 + Math.random() * 18}s`,
          animationDelay: `${-Math.random() * 22}s`,
          opacity: `${0.15 + Math.random() * 0.5}`,
          "--size": `${8 + Math.random() * 18}px`,
          "--drift": `${-80 + Math.random() * 160}px`,
          "--hue": `${338 + Math.random() * 22}`,
        };
        return { id: i, style };
      }),
    []
  );

  return (
    <div className="heart-field" aria-hidden="true">
      {hearts.map((h) => (
        <span key={h.id} className="floating-heart" style={h.style} />
      ))}
    </div>
  );
}
