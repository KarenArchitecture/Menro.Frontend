import SearchBar from "../common/SearchBar";
import MouseIcon from "../icons/MouseIcon";
import SmartImage from "../common/SmartImage";

// props are sourced from LandingController.GetGeneral (getLandingGeneral()).
// `isLoading` should be true only while that request is in flight — once it
// settles (success OR failure), heroImageUrl is either the real API url or
// left undefined, and this component picks the final /images/landing-hero.png
// fallback exactly once. This avoids ever painting the fallback image and
// then swapping it out for the real one after the fetch resolves.
export default function Hero({
  heroImageUrl,
  titleHighlight = "منرو",
  titleText = "بهترین همیار رستوران تو",
  isLoading = false,
}) {
  const resolvedImageUrl = heroImageUrl || "/images/landing-hero.png";

  return (
    <section className="hero">
      {isLoading ? (
        <div className="hero__bg hero__bg--skeleton" aria-hidden="true" />
      ) : (
        <SmartImage
          src={resolvedImageUrl}
          fallback="/images/landing-hero.png"
          alt="منرو بهترین همیار رستوران تو"
          className="hero__bg"
          lazy={false}
          fetchPriority="high"
        />
      )}

      <div className="hero__overlay">
        <div className="hero__content">
          <h1 className="hero__title">
            <span>{titleHighlight}</span> {titleText}
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
