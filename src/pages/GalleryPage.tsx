import { RevealSection } from "../components/RevealSection";
import { galleryImages } from "../types";

export function GalleryPage() {
  return (
    <RevealSection className="gallery-card">
      <header className="section-header">
        <h2>Our Memories</h2>
        <p className="section-sub">Every photo, a love story frozen in time.</p>
      </header>
      <div className="memory-grid" role="list" aria-label="Photo gallery">
        {galleryImages.map((img) => (
          <figure className="memory-tile" role="listitem" key={img.id}>
            <img src={img.src} alt={img.alt} loading={img.id <= 4 ? "eager" : "lazy"} />
          </figure>
        ))}
      </div>
    </RevealSection>
  );
}
