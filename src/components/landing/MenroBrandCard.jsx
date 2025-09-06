export default function MenroBrandCard({ className = "", dataSpeed = 0 }) {
  return (
    <div className={`${className}`} data-speed={dataSpeed}>
      <div className="menro-brand-card">
        <div className="menro-text">منرو</div>
      </div>
    </div>
  );
}
