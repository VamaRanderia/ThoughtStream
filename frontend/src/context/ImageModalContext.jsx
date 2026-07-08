import { createContext, useContext, useState, useEffect } from "react";

const ImageModalContext = createContext();

export function ImageModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");

  const openImageModal = (src) => {
    if (!src) return;
    setImgSrc(src);
    setIsOpen(true);
  };

  const closeImageModal = () => {
    setIsOpen(false);
    setImgSrc("");
  };

  // Close modal on escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeImageModal();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <ImageModalContext.Provider value={{ openImageModal, closeImageModal, isOpen, imgSrc }}>
      {children}
      {isOpen && (
        <>
          <div
            className="image-lightbox-modal"
            role="dialog"
            aria-modal="true"
            onClick={closeImageModal}
          >
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="lightbox-close-btn"
                aria-label="Close"
                onClick={closeImageModal}
              >
                &times;
              </button>
              <img src={imgSrc} alt="Preview" className="lightbox-img" />
            </div>
          </div>
          <div className="lightbox-backdrop" onClick={closeImageModal}></div>
        </>
      )}
    </ImageModalContext.Provider>
  );
}

export function useImageModal() {
  return useContext(ImageModalContext);
}
