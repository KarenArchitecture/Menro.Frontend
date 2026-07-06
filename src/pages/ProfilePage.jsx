import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileActions from "../components/profile/ProfileActions";
import AdBanner from "../components/common/AdBanner";
import "../assets/css/styles-profile.css";

export default function ProfilePage() {
  const user = {
    name: "کافه‌گرد ۵۹۶۸",
    stats: [
      { value: 213, label: "خرید موفق" },
      { value: 32, label: "بازدید از رستوران‌ها" },
      { value: 5, label: "بررسی محصول" },
    ],
  };

  return (
    <div className="profile-page">
      <ProfileHeader user={user} />
      <ProfileStats stats={user.stats} />
      <ProfileActions />

      {/* STATIC TEST */}
      {/* <AdBanner
        imageSrc="/images/ads/banner-placeholder.jpg"
        title="بنر تست"
        subtitle="برای بررسی نمایش"
      /> */}

      {/* REAL BANNERS */}
      <AdBanner slotKey="profile-1" />
      <AdBanner slotKey="profile-2" />
    </div>
  );
}
