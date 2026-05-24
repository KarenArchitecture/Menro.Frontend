import React from "react";

const blogCategories = [
  {
    id: 1,
    title: "رستوران و فضای سرویس",
    subtitle: "فضای فیزیکی، خدمات، جو",
    color: "#5A302F",
  },
  {
    id: 2,
    title: "منو و غذا",
    subtitle: "چیدمان، انتخاب، تجربه طعم",
    color: "#664A25",
  },
  {
    id: 3,
    title: "رفتار و تجربه مشتری",
    subtitle: "عادت‌ها، رضایت، وفاداری",
    color: "#2B314B",
  },
  {
    id: 4,
    title: "برند و بازاریابی",
    subtitle: "ساخت برند، جذب، دیده‌شدن",
    color: "#274435",
  },
  {
    id: 5,
    title: "مدیریت و عملیات",
    subtitle: "پشت‌صحنه، منابع، فرآیندها",
    color: "#454C21",
  },
  {
    id: 6,
    title: "تکنولوژی و ابزارها",
    subtitle: "راهکارهای دیجیتال و هوشمند",
    color: "#58273E",
  },
  {
    id: 7,
    title: "فرهنگ و جامعه",
    subtitle: "تأثیر اجتماعی، سبک زندگی",
    color: "#264648",
  },
  {
    id: 8,
    title: "نگاه و دیدگاه",
    subtitle: "تحلیل، ترند، زاویه‌ی متفاوت",
    color: "#41224D",
  },
];

const BlogCategories = () => {
  return (
    <section className="blog-categories-section">
      <div className="categories-wrapper">
        {blogCategories.map((category) => (
          <div key={category.id} className="category-card">
            <div
              className="category-icon-box"
              style={{ backgroundColor: category.color }}
            ></div>
            <div className="category-text">
              <h3>{category.title}</h3>
              <p>{category.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogCategories;
