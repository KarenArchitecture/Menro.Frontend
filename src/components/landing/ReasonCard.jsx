export default function ReasonCard({
  className = "",
  dataSpeed = 0,
  title = "عنوان دلیل",
  text = "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه لورم ایپسوم متن ساختگی",
  icon,
}) {
  return (
    <div className={`${className}`} data-speed={dataSpeed}>
      <div className="reason-card">
        <div className="reason-icon">{icon}</div>
        <h4 className="reason-title">{title}</h4>
        <p className="reason-text">{text}</p>
      </div>
    </div>
  );
}
