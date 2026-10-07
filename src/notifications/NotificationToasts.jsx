// src/notifications/NotificationToasts.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { NOTIFICATION_TYPES } from "./notificationConfig";
import "./notificationToasts.css";

export default function NotificationToasts({ toasts, onDismiss }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  if (!toasts.length) return null;

  return (
    <div className="admin-toasts" dir="rtl">
      {toasts.map((t) => {
        const target = NOTIFICATION_TYPES[t.type].path;
        const alreadyThere = pathname + search === target;

        return (
          <div key={t.id} className="admin-toast">
            <strong>{t.title}</strong>
            <p>{t.message}</p>
            <div className="admin-toast__actions">
              {!alreadyThere && (
                <button
                  className="admin-toast__primary"
                  onClick={() => {
                    navigate(target);
                    onDismiss(t.id);
                  }}
                >
                  بررسی
                </button>
              )}
              <button onClick={() => onDismiss(t.id)}>
                {alreadyThere ? "متوجه شدم" : "بستن"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
