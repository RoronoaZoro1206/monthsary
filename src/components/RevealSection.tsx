import { ReactNode } from "react";
import { RevealStyle } from "../types";

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

export function RevealSection({ children, className = "", id, delay = 0 }: RevealSectionProps) {
  const style: RevealStyle = { "--reveal-delay": `${delay}ms` };
  return (
    <section id={id} className={`glass-card reveal ${className}`.trim()} style={style}>
      {children}
    </section>
  );
}
