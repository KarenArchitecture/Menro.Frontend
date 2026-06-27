export default function ActionCard({ icon, label, onClick, gradient }) {
  return (
    <button className="action-card" onClick={onClick}>
      <div
        className="action-card__icon"
        style={{
          background: `linear-gradient(to bottom, ${gradient[0]}, ${gradient[1]})`,
        }}
      >
        <img src={icon} alt={label} />
      </div>
      <div className="action-card__label">{label}</div>
    </button>
  );
}
