export default function PrivatePanelCard({ className = "", dataSpeed = 0 }) {
  return (
    <div className={`${className}`} data-speed={dataSpeed}>
      <div className="private-panel-card">
        <div className="private-panel-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect
              x="2"
              y="3"
              width="20"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="8"
              y1="21"
              x2="16"
              y2="21"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="12"
              y1="17"
              x2="12"
              y2="21"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="private-panel-text">پنل اختصاصی</div>
      </div>
    </div>
  );
}
