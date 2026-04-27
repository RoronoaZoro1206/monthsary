import { CSSProperties } from "react";

export type Page = "letter" | "gallery" | "bouquet";
export type HeartStyle = CSSProperties & Record<`--${string}`, string>;
export type RevealStyle = CSSProperties & { "--reveal-delay": string };
