export default function CostChartCard({ className = "", dataSpeed = 0 }) {
  return (
    <div className={`${className}`} data-speed={dataSpeed}>
      <div className="cost-chart-card">
        <div className="cost-chart-header">
          <div className="cost-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M1 4v6h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 20v-6h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="cost-chart">
            <svg width="60" height="30" viewBox="0 0 60 30">
              <polyline
                points="5,25 15,20 25,15 35,10 45,5 55,8"
                stroke="#FF683C"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="15" cy="20" r="2" fill="#FF683C" />
              <circle cx="35" cy="10" r="2" fill="#FF683C" />
            </svg>
          </div>
        </div>
        <div className="cost-percentage">+۳۰۰٪</div>
        <div className="cost-label">کاهش هزینه نرم‌افزاری</div>
      </div>
    </div>
  );
}
