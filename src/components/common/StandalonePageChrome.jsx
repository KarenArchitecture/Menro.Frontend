// src/components/common/StandalonePageChrome.jsx
import { Link, useNavigate } from "react-router-dom";
import "../../assets/css/auth.css";

export default function StandalonePageChrome({ children, backTo }) {
  const navigate = useNavigate();

  return (
    <div className="standalone-chrome" dir="rtl">
      <Link
        to="/home"
        className="auth-home-btn"
        aria-label="بازگشت به صفحه اصلی"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.597917 6.70553C0 7.79788 0 9.11557 0 11.7509V13.5026C0 17.9949 0 20.2411 1.3492 21.6366C2.69839 23.0322 4.86989 23.0322 9.21289 23.0322H13.8193C18.1623 23.0322 20.3338 23.0322 21.683 21.6366C23.0322 20.2411 23.0322 17.9949 23.0322 13.5026V11.7509C23.0322 9.11557 23.0322 7.79788 22.4343 6.70553C21.8364 5.61319 20.744 4.93525 18.5593 3.57935L16.2561 2.14991C13.9467 0.716636 12.792 0 11.5161 0C10.2402 0 9.08551 0.716636 6.77612 2.14991L4.4729 3.57935C2.28819 4.93525 1.19583 5.61319 0.597917 6.70553ZM8.06128 17.5621C7.58427 17.5621 7.19757 17.9488 7.19757 18.4258C7.19757 18.9028 7.58427 19.2895 8.06128 19.2895H14.9709C15.448 19.2895 15.8347 18.9028 15.8347 18.4258C15.8347 17.9488 15.448 17.5621 14.9709 17.5621H8.06128Z"
            fill="#999FA8"
          />
        </svg>
      </Link>

      <button
        type="button"
        className="auth-back-btn"
        aria-label="بازگشت"
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
      >
        <svg
          width="7"
          height="14"
          viewBox="0 0 7 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.750006 12.5479L2.9425 10.5464C4.93607 8.72654 5.93286 7.8166 5.93286 6.64897C5.93286 5.48134 4.93607 4.57139 2.9425 2.7515L0.750007 0.750021"
            stroke="#999FA8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {children}
    </div>
  );
}
