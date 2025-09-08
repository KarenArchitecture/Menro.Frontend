import React from "react";

export default function WhyMenroSection() {
  return (
    <section id="why-menro" className="why-static">
      <div className="why-static__inner">
        <div className="why-static__titles">
          <h2 className="why-static__title">چرا منرو؟</h2>
          <p className="why-static__subtitle">لحظه همراه تو</p>
        </div>

        {/* Floating cards arranged to visually match the mock */}
        <div className="why-card why-card--tag pos-a">منرو</div>

        <article className="why-card pos-b">
          <header className="why-card__header">
            <span className="why-card__icon">🏛️</span>
            <h3 className="why-card__title">عنوان دلیل</h3>
          </header>
          <p className="why-card__text">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
            استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در
            ستون و سطرآنچنان که لازم است.
          </p>
        </article>

        <article className="why-card pos-c">
          <header className="why-card__header">
            <span className="why-card__icon">🔁</span>
            <h3 className="why-card__title">عنوان دلیل</h3>
          </header>
          <p className="why-card__text">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
            استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در
            ستون و سطرآنچنان که لازم است.
          </p>
        </article>

        <article className="why-card pos-d">
          <header className="why-card__header">
            <span className="why-card__icon">📦</span>
            <h3 className="why-card__title">عنوان دلیل</h3>
          </header>
          <p className="why-card__text">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
            استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در
            ستون و سطرآنچنان که لازم است.
          </p>
        </article>

        <article className="why-card why-card--small pos-e">
          <div className="why-card__small">
            <span className="why-card__small-icon">📈</span>
            <div className="why-card__small-meta">
              <strong>+200%</strong>
              <span>افزایش فروش</span>
            </div>
          </div>
        </article>

        <article className="why-card why-card--small pos-f">
          <div className="why-card__small">
            <span className="why-card__small-icon">💬</span>
            <div className="why-card__small-meta">
              <span>خدمات عالی</span>
            </div>
          </div>
        </article>

        <article className="why-card why-card--panel pos-g">
          <span className="why-card__icon">🖥️</span>
          <h3 className="why-card__title">پنل اختصاصی</h3>
        </article>

        <article className="why-card why-card--chart pos-h">
          <div className="why-card__chart">
            <div className="why-card__chart-dot" />
          </div>
          <footer className="why-card__badge">کاهش هزینه نرم افزاری</footer>
          <div className="why-card__kpi">+200%</div>
        </article>
      </div>
    </section>
  );
}
