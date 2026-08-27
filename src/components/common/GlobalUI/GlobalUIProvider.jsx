// نحوه استفاده
// import { useGlobalUI } from "@/components/common/GlobalUI";

// const { notify, alertModal, confirmModal } = useGlobalUI();

// // توست گوشه صفحه، خودکار محو می‌شه
// notify({ type: "success", message: "دسته‌بندی با موفقیت ذخیره شد" });
// notify({ type: "error", title: "خطا", message: "حجم فایل بیش از حد مجاز است" });

// // مودال وسط صفحه، فقط با کلیک دکمه بسته می‌شه
// await alertModal({ title: "توجه", message: "این عملیات قابل بازگشت نیست" });

// // تایید/رد — Promise<boolean> برمی‌گردونه
// const ok = await confirmModal({
//   title: "حذف آیکون",
//   message: "از حذف این آیکون مطمئنی؟",
//   danger: true,
// });
// if (ok) {
//   // ادامه‌ی حذف
// }

// src/components/common/GlobalUI/GlobalUIProvider.jsx
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import ToastStack from "./Toast";
import ModalRoot from "./ConfirmModal";
import "../../../assets/css/global-ui.css";

const GlobalUIContext = createContext(null);

let toastSeq = 0;

export function GlobalUIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const resolverRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // notify({ type: 'success' | 'error' | 'warning' | 'info', message, title, duration })
  const notify = useCallback(
    ({ type = "info", title, message, duration = 4000 }) => {
      const id = ++toastSeq;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast],
  );

  // alertModal({ title, message, buttonText }) -> Promise<void>
  const alertModal = useCallback(({ title, message, buttonText } = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModal({ kind: "alert", title, message, buttonText });
    });
  }, []);

  // confirmModal({ title, message, confirmText, cancelText, danger }) -> Promise<boolean>
  const confirmModal = useCallback(
    ({ title, message, confirmText, cancelText, danger = false } = {}) => {
      return new Promise((resolve) => {
        resolverRef.current = resolve;
        setModal({
          kind: "confirm",
          title,
          message,
          confirmText,
          cancelText,
          danger,
        });
      });
    },
    [],
  );

  // confirmUnsavedChanges({ title, message, saveText, discardText, cancelText })
  // -> Promise<"save" | "discard" | "cancel">
  const confirmUnsavedChanges = useCallback(
    ({ title, message, saveText, discardText, cancelText } = {}) => {
      return new Promise((resolve) => {
        resolverRef.current = resolve;
        setModal({
          kind: "unsaved",
          title: title || "تغییرات ذخیره‌نشده",
          message:
            message ||
            "تغییراتی که اعمال کرده‌اید ذخیره نشده است. می‌خواهید قبل از خروج ذخیره شوند؟",
          saveText,
          discardText,
          cancelText,
        });
      });
    },
    [],
  );

  const closeModal = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setModal(null);
  }, []);

  return (
    <GlobalUIContext.Provider
      value={{ notify, alertModal, confirmModal, confirmUnsavedChanges }}
    >
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <ModalRoot modal={modal} onClose={closeModal} />
    </GlobalUIContext.Provider>
  );
}

export const useGlobalUI = () => {
  const ctx = useContext(GlobalUIContext);
  if (!ctx) {
    throw new Error("useGlobalUI must be used inside <GlobalUIProvider>");
  }
  return ctx;
};
