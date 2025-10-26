import SearchBar from "../common/SearchBar";
import MouseIcon from "../icons/MouseIcon";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__overlay">
        <div className="hero__content">
          <h1 className="hero__title">
            <span>منرو</span> بهترین همیار رستورانِ تو
          </h1>

          {/* سرچ‌بار آمادهٔ خودمون */}
          <div className="hero__search">
            <SearchBar placeholder="جستجوی رستوران، نوشیدنی، غذا ..." />
          </div>
          <div className="hero__hint">
            <MouseIcon />
            <p>اسکرول کنید</p>
          </div>
        </div>
      </div>
    </section>
  );
}
