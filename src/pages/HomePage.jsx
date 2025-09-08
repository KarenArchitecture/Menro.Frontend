import Header from "../components/common/Header";
import Carousel from "../components/home/Carousel";
import RestaurantList from "../components/home/RestaurantList";
import AdBanner from "../components/home/AdBanner";
import PreviousOrders from "../components/home/PreviousOrders";
import PopularFoodLazyList from "../components/home/PopularFoodLazyList";
import AuthActions from "../components/common/AuthActions";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="content">
        <AuthActions />
        <Carousel />
        <RestaurantList />
        <AdBanner
          imageSrc="/images/ad-banner-1.png"
          title="Restaurant Number 1"
          subtitle="ماکتیل‌هامون رو از دست ندید!"
          href="/restaurant/restaurant-1"
          overlay={0.5}
          height={260}
          objectPosition="center"
        />
        <PreviousOrders />
        <AdBanner
          imageSrc="/images/ad-banner-2.png"
          title="Restaurant Number 1"
          subtitle="ساندویچ‌هامون خوبه کار به عکس نداشته باشید!"
          href="/restaurant/restaurant-1"
          overlay={0.5}
          height={260}
          objectPosition="center"
        />
        <PopularFoodLazyList />
      </main>
    </>
  );
}
