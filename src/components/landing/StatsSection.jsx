export default function StatsSection() {
  const stats = [
    {
      id: 1,
      icon: "/images/landing-stats-1.png",
      number: "+1,700",
      text: "رستوران ثبت شده",
    },
    {
      id: 2,
      icon: "/images/landing-stats-2.png",
      number: "+69,000",
      text: "مخاطب فعال",
    },
    {
      id: 3,
      icon: "/images/landing-stats-3.png",
      number: "+1,000,000",
      text: "سفارش های انجام شده",
    },
    {
      id: 4,
      icon: "/images/landing-stats-4.png",
      number: "+12,000",
      text: "اسکن منو",
    },
  ];

  return (
    <section className="stats-section">
      <div className="stats-container">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-item">
            <div className="stat-icon">
              <img src={stat.icon} alt={`Stat ${stat.id}`} />
            </div>
            <div className="stat-number">{stat.number}</div>
            <div className="stat-text">{stat.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
