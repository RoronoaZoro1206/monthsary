import { useState } from "react";
import Modal from "react-modal";
import { RevealSection } from "../components/RevealSection";

// Important for accessibility
Modal.setAppElement("#root");

type GalleryImage = {
  id: number;
  src: string;
  alt: string;
  spotifyId: string;
};

const galleryImages: GalleryImage[] = [
  { id: 1, src: `/images/1.png`, alt: "Memory 1", spotifyId: "5y2ijHECwFYWqcAHKTZgzD" },
  { id: 2, src: `/images/2.png`, alt: "Memory 2", spotifyId: "6FIEuf1JIzmCtach0gXpeG" },
  { id: 3, src: `/images/3.png`, alt: "Memory 3", spotifyId: "4u8RkgV6P4TLi89SmlUtv8" },
  { id: 4, src: `/images/4.png`, alt: "Memory 4", spotifyId: "0tgVpDi06FyKpA1z0VMD4v" },
  { id: 5, src: `/images/5.png`, alt: "Memory 5", spotifyId: "0T5iIrXA4p5GsubkhuBIKV" },
  { id: 6, src: `/images/6.png`, alt: "Memory 6", spotifyId: "16iRlyUMJVPqz62DlomMre" },
  { id: 7, src: `/images/7.png`, alt: "Memory 7", spotifyId: "7b89Ffklm3xh4GI37vlZDZ" },
  { id: 8, src: `/images/8.png`, alt: "Memory 8", spotifyId: "3KkXRkHbMCARz0aVfEt68P" },
  { id: 9, src: `/images/9.png`, alt: "Memory 9", spotifyId: "7BqBn9nzAq8spo5e7cZ0dJ" },
  { id: 10, src: `/images/10.png`, alt: "Memory 10", spotifyId: "38zsOOcu31XbbYj9BIPUF1" },
  { id: 11, src: `/images/11.png`, alt: "Memory 11", spotifyId: "1dGr1c8CrMLDpV6mPbImSI" },
  { id: 12, src: `/images/12.png`, alt: "Memory 12", spotifyId: "22PMfvdz35fFKYnJyMn077" },
  { id: 13, src: `/images/13.png`, alt: "Memory 13", spotifyId: "63xdwScd1Ai1GigAwQxE8y" },
  { id: 14, src: `/images/14.png`, alt: "Memory 14", spotifyId: "4Hhv2vrOTy89HFRcjU3QOx" },
  { id: 15, src: `/images/15.png`, alt: "Memory 15", spotifyId: "3U4isOIWM3VvDubwSI3y7a" },
  { id: 16, src: `/images/16.png`, alt: "Memory 16", spotifyId: "6lanRgr6wXibZr8KgzXxBl" },
  { id: 17, src: `/images/17.png`, alt: "Memory 17", spotifyId: "44AyOl4qVkzS48vBsbNXaC" },
  { id: 18, src: `/images/18.png`, alt: "Memory 18", spotifyId: "1wb4P4F0sxAQ2KXrRvsx6n" },
  { id: 19, src: `/images/19.png`, alt: "Memory 19", spotifyId: "2eAvDnpXP5W0cVtiI0PUxV" },
  { id: 20, src: `/images/20.png`, alt: "Memory 20", spotifyId: "2DpJ9T2RVRanZcYFHKOAfA" },
  { id: 21, src: `/images/21.png`, alt: "Memory 21", spotifyId: "4QxDOjgpYtQDxxbWPuEJOy" },
  { id: 22, src: `/images/22.png`, alt: "Memory 22", spotifyId: "5uCax9HTNlzGybIStD3vDh" },
  { id: 23, src: `/images/23.png`, alt: "Memory 23", spotifyId: "0Cvjlph1WGbwZY1PlMEtJY" },
  { id: 24, src: `/images/24.png`, alt: "Memory 24", spotifyId: "3rWBerJZHd5IvS6o3dQEk7" },
];

export function GalleryTab() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <RevealSection className="gallery-card">
        <header className="section-header">
          <h2>Our Memories</h2>
          <p className="section-sub">Every photo, a love story frozen in time.</p>
        </header>
        <div className="memory-grid" role="list" aria-label="Photo gallery">
          {galleryImages.map((img) => (
            <figure className="memory-tile" role="listitem" key={img.id} onClick={() => setSelectedImage(img)}>
              <img src={img.src} alt={img.alt} loading={img.id <= 4 ? "eager" : "lazy"} />
            </figure>
          ))}
        </div>
      </RevealSection>

      <Modal
        isOpen={!!selectedImage}
        onRequestClose={closeModal}
        className="react-modal-content"
        overlayClassName="react-modal-overlay"
        contentLabel="Memory Details"
      >
        {selectedImage && (
          <div className="gallery-modal-content">
            <button className="gallery-modal-close" onClick={closeModal} aria-label="Close modal">
              &times;
            </button>
            <div className="gallery-modal-image-container">
              <img src={selectedImage.src} alt={selectedImage.alt} />
            </div>
            <div className="gallery-modal-spotify">
              <iframe 
                style={{ borderRadius: "12px", background: "transparent" }}
                src={`https://open.spotify.com/embed/track/${selectedImage.spotifyId}?utm_source=generator`} 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowFullScreen={false}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
              ></iframe>
              <div className="copyright-notice" style={{ marginTop: '1rem' }}>
                <small>
                  *Music provided by Spotify. We do not own the rights to these songs. This is for personal/demonstration use only.
                </small>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
