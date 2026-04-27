import { Page } from "../types";

const NAV_ITEMS: { id: Page; label: string; emoji: string }[] = [
  { id: "letter", label: "Love Letter", emoji: "💌" },
  { id: "gallery", label: "Our Memories", emoji: "📸" },
  { id: "bouquet", label: "Digital Bouquet", emoji: "💐" },
];

export function Navigation({ active, onChange }: { active: Page; onChange: (p: Page) => void }) {
  return (
    <nav className="nav-bar" aria-label="Page navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-tab${active === item.id ? " active" : ""}`}
          onClick={() => onChange(item.id)}
          aria-current={active === item.id ? "page" : undefined}
        >
          <span className="nav-emoji">{item.emoji}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
