export default function FinancialManagementCard({
  className = "",
  dataSpeed = 0,
}) {
  return (
    <div className={`${className}`} data-speed={dataSpeed}>
      <div className="financial-card">
        <div className="financial-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 1v22" stroke="currentColor" strokeWidth="2" />
            <path
              d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="financial-text">مدیریت مالی</div>
      </div>
    </div>
  );
}
