import { useQuery } from "@tanstack/react-query";
import { getAdBanner } from "../../api/restaurant";

export default function AdBanner() {
  const {
    data: ad,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adBanner"],
    queryFn: getAdBanner,
  });

  console.log("Ad banner query result:", { ad, isLoading, isError, error });

  if (isLoading) {
    return <p className="text-gray-500 text-center">در حال بارگذاری بنر...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-500 text-center">
        خطا در دریافت بنر: {error.message}
      </p>
    );
  }

  // Ensure required data is available
  if (!ad || !ad.imageUrl || !ad.slug || !ad.restaurantName) {
    return (
      <p className="text-yellow-500 text-center">
        اطلاعات بنر ناقص است یا یافت نشد
      </p>
    );
  }

  return (
    <section className="single-banner">
      <a href={`/restaurant/${ad.slug}`} className="banner-link">
        <img
          src={`http://localhost:5096${ad.imageUrl}`}
          alt={ad.restaurantName}
          className="single-banner-img"
        />
      </a>
    </section>
  );
}
