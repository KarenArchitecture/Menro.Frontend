import SearchBar from "../common/SearchBar";
import MouseIcon from "../icons/MouseIcon";
import SmartImage from "../common/SmartImage";

export default function Hero() {
  return (
    <section className="hero">
      <SmartImage
        src="/images/landing-hero.png"
        fallback="/images/landing-hero.png"
        alt="منرو بهترین همیار رستوران تو"
        className="hero__bg"
        lazy={false}
        fetchPriority="high"
      />

      <div className="hero__overlay">
        <div className="hero__content">
          <h1 className="hero__title">
            <span>منرو</span> بهترین همیار رستوران تو
          </h1>

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
