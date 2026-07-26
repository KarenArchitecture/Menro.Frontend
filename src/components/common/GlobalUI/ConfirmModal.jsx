// src/components/common/GlobalUI/ConfirmModal.jsx

export default function ModalRoot({ modal, onClose }) {
  if (!modal) return null;

  const isConfirm = modal.kind === "confirm";

  return (
    <div className="gui-modal-backdrop" onClick={() => onClose(false)}>
      <div
        className={`gui-modal ${modal.danger ? "gui-modal--danger" : ""}`}
        role={isConfirm ? "alertdialog" : "dialog"}
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {modal.title && <h4 className="gui-modal__title">{modal.title}</h4>}
        {modal.message && <p className="gui-modal__message">{modal.message}</p>}

        <div className="gui-modal__actions">
          {isConfirm ? (
            <>
              <button
                type="button"
                className="gui-btn gui-btn--ghost"
                onClick={() => onClose(false)}
              >
                {modal.cancelText || "انصراف"}
              </button>
              <button
                type="button"
                className={`gui-btn ${modal.danger ? "gui-btn--danger" : "gui-btn--primary"}`}
                onClick={() => onClose(true)}
              >
                {modal.confirmText || "تایید"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="gui-btn gui-btn--primary"
              onClick={() => onClose(true)}
            >
              {modal.buttonText || "متوجه شدم"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
