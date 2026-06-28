// src/components/common/GlobalModal.jsx

import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const showModal = (config) => {
    setModal(config);
  };

  const hideModal = () => {
    setModal(null);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}

      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#222",
              padding: "24px",
              borderRadius: "8px",
              width: "320px",
              border: "1px solid #444",
              textAlign: "center",
            }}
          >
            <h4
              style={{
                margin: "0 0 16px 0",
                color: "#fff",
              }}
            >
              {modal.title}
            </h4>

            <p
              style={{
                color: "#ccc",
                marginBottom: "24px",
                fontSize: "14px",
              }}
            >
              {modal.message}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  modal.onClose?.();
                  hideModal();
                }}
                style={{
                  background: "#4caf50",
                  color: "#fff",
                  border: "none",
                }}
              >
                {modal.buttonText || "متوجه شدم"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
