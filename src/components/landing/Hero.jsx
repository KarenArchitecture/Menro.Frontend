export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__overlay">
        <div className="hero__content">
          <h1 className="hero__title">
            <span>منرو</span> بهترین همیار رستورانِ تو
          </h1>

          <div className="hero__search">
            {/* آیکن سمت راست + اینپوت سرچ (فعلاً بدون لاجیک) */}
            <input
              type="text"
              placeholder="جستجوی رستوران، نوشیدنی، غذا ..."
              aria-label="جستجو"
            />
          </div>

          <p className="hero__hint">اسکرول کنید ↓</p>
        </div>
      </div>
    </section>
  );
}
