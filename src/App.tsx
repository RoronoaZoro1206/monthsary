import { useState } from "react";
import { Page } from "./types";
import { Navigation } from "./components/Navigation";
import { FloatingHearts } from "./components/FloatingHearts";
import { LetterTab } from "./tabs/LetterTab";
import { GalleryTab } from "./tabs/GalleryTab";
import { BouquetTab } from "./tabs/BouquetTab";

function App() {
  const [activePage, setActivePage] = useState<Page>("letter");

  return (
    <>
      <div className="background-layer" aria-hidden="true">
        <div className="mesh-glow mesh-1" />
        <div className="mesh-glow mesh-2" />
        <div className="mesh-glow mesh-3" />
      </div>

      <FloatingHearts />

      <Navigation active={activePage} onChange={setActivePage} />

      <main className="page-shell" key={activePage}>
        {activePage === "letter" && <LetterTab />}
        {activePage === "gallery" && <GalleryTab />}
        {activePage === "bouquet" && <BouquetTab />}
      </main>

      <footer className="page-footer">
        Built with love for Shelly S. Quijano — Happy 1st Monthsary, Love. 💕
      </footer>
    </>
  );
}

export default App;
