import StatItem from "./StatItem";

export default function ProfileStats({ stats = [] }) {
  return (
    <div className="profile-stats">
      {stats.map((stat, index) => (
        <StatItem key={index} value={stat.value} label={stat.label} />
      ))}
    </div>
  );
}
