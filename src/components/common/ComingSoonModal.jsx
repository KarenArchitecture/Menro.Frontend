import React, { useEffect, useState } from "react";

const ComingSoonModal = ({ isOpen, onClose, title = "به زودی" }) => {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = "hidden";
    } else {
      // wait for animation to finish
      setTimeout(() => setShow(false), 180);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`coming-backdrop ${isOpen ? "open" : "close"}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`coming-modal ${isOpen ? "open" : "close"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="close-container">
            <button className="coming-close" onClick={onClose}>×</button>
        </div>

        {/* Meaningful nice icon */}
        <div className="coming-icon">
          <svg width="68" height="68" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 29C23.6274 29 29 26.6539 29 23.7599C29 22.2849 27.6045 20.9523 25.3585 20C23.988 22.4405 21.8981 24.5442 19.2434 25.645C17.8165 26.2368 16.1835 26.2368 14.7566 25.645C12.1019 24.5442 10.012 22.4405 8.6415 20C6.39554 20.9523 5 22.2849 5 23.7599C5 26.6539 10.3726 29 17 29Z" fill="#999FA8"/>
                                <path fillRule="evenodd" clipRule="evenodd" d="M9 12.7361C9 8.46358 12.5817 5 17 5C21.4183 5 25 8.46358 25 12.7361C25 16.9752 22.4467 21.9218 18.4629 23.6907C17.5343 24.1031 16.4657 24.1031 15.5371 23.6907C11.5533 21.9218 9 16.9752 9 12.7361ZM17 15.6875C18.2624 15.6875 19.2857 14.6242 19.2857 13.3125C19.2857 12.0008 18.2624 10.9375 17 10.9375C15.7376 10.9375 14.7143 12.0008 14.7143 13.3125C14.7143 14.6242 15.7376 15.6875 17 15.6875Z" fill="#999FA8"/>
                            </svg>
        </div>

        <h3>{title}</h3>

        <p>این بخش به‌زودی در دسترس قرار می‌گیرد.</p>

        <button className="coming-btn" onClick={onClose}>
          بستن
        </button>
      </div>
    </div>
  );
};

export default ComingSoonModal;
