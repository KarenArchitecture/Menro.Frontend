// src/components/admin/ProductsSection.jsx
import React, { useState, useEffect } from "react";
import ProductModal from "./ProductModal";
import adminFoodAxios from "../../api/adminFoodAxios";

function toIntDigits(v) {
  return Number(String(v || "0").replace(/[^\d]/g, ""));
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await adminFoodAxios.get("/read-all");
      setProducts(data);
    } catch (err) {
      console.error("خطا در گرفتن لیست محصولات:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreate = () => {
    setMode("create");
    setIsModalOpen(true);
  };

  const openEdit = (product) => {
    setMode("edit");
    setSelectedProductId(product.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این غذا را حذف کنید؟"))
      return;

    try {
      await adminFoodAxios.delete(`/${foodId}`);
      alert("محصول با موفقیت حذف شد");
      fetchProducts();
    } catch (err) {
      console.error("خطا در حذف محصول:", err);
    }
  };

  if (loading) return <p>در حال بارگذاری...</p>;

  return (
    <>
      <div className="view-header">
        <h2 className="content-title">مدیریت محصولات</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="fas fa-plus" /> افزودن محصول جدید
        </button>
      </div>

      <div className="panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>نام محصول</th>
                <th>دسته‌بندی</th>
                <th>قیمت (نهایی)</th>
                <th>تخفیف</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>

            <tbody>
              {products.map((row, i) => {
                const basePrice = toIntDigits(row.price);

                const pctRaw =
                  row.discountPercent ??
                  row.discountPercentage ??
                  row.discountPct ??
                  0;

                const pct = clamp(toIntDigits(pctRaw), 0, 99);
                const hasDiscount = pct > 0;

                const finalPrice =
                  basePrice > 0 && hasDiscount
                    ? Math.max(0, Math.round(basePrice * (1 - pct / 100)))
                    : basePrice;

                return (
                  <tr key={row.id || i}>
                    <td>
                      {row.name}
                      {hasDiscount && (
                        <span className="discount-chip">
                          {pct.toLocaleString("fa-IR")}٪ تخفیف
                        </span>
                      )}
                    </td>

                    <td>{row.foodCategoryName}</td>

                    <td>
                      {basePrice > 0 ? (
                        hasDiscount ? (
                          <div className="price-with-discount">
                            <div className="price-final">
                              {finalPrice.toLocaleString()} تومان
                            </div>
                            <div className="price-original">
                              {basePrice.toLocaleString()} تومان
                            </div>
                          </div>
                        ) : (
                          `${basePrice.toLocaleString()} تومان`
                        )
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      {hasDiscount ? `${pct.toLocaleString("fa-IR")}٪` : "-"}
                    </td>

                    <td>
                      <span
                        className={`status-chip ${
                          row.isAvailable ? "active" : "danger"
                        }`}
                      >
                        {row.isAvailable ? "فعال" : "غیرفعال"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn btn-icon"
                        title="ویرایش"
                        onClick={() => openEdit(row)}
                      >
                        <i className="fas fa-edit" />
                      </button>
                      <button
                        className="btn btn-icon btn-danger"
                        title="حذف"
                        onClick={() => handleDelete(row.id)}
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="cards-list products-cards">
          {products.map((row, i) => {
            const basePrice = toIntDigits(row.price);
            const pctRaw =
              row.discountPercent ??
              row.discountPercentage ??
              row.discountPct ??
              0;
            const pct = clamp(toIntDigits(pctRaw), 0, 99);
            const hasDiscount = pct > 0;

            const finalPrice =
              basePrice > 0 && hasDiscount
                ? Math.max(0, Math.round(basePrice * (1 - pct / 100)))
                : basePrice;

            return (
              <article className="data-card" key={`card-${row.id || i}`}>
                <div className="row">
                  <span className="label">نام محصول</span>
                  <span className="value">
                    {row.name}
                    {hasDiscount && (
                      <span className="discount-chip">
                        {pct.toLocaleString("fa-IR")}٪ تخفیف
                      </span>
                    )}
                  </span>
                </div>

                <div className="row">
                  <span className="label">دسته‌بندی</span>
                  <span className="value">{row.foodCategoryName}</span>
                </div>

                <div className="row">
                  <span className="label">قیمت (نهایی)</span>
                  <span className="value">
                    {basePrice > 0 ? (
                      hasDiscount ? (
                        <span className="price-with-discount">
                          <span className="price-final">
                            {finalPrice.toLocaleString()} تومان
                          </span>
                          <span className="price-original">
                            {basePrice.toLocaleString()} تومان
                          </span>
                        </span>
                      ) : (
                        `${basePrice.toLocaleString()} تومان`
                      )
                    ) : (
                      "-"
                    )}
                  </span>
                </div>

                <div className="row">
                  <span className="label">تخفیف</span>
                  <span className="value">{hasDiscount ? `${pct}٪` : "-"}</span>
                </div>

                <div className="row" style={{ alignItems: "center" }}>
                  <span className="label">وضعیت</span>
                  <span
                    className={`status-chip ${
                      row.isAvailable ? "active" : "danger"
                    }`}
                  >
                    {row.isAvailable ? "فعال" : "غیرفعال"}
                  </span>
                </div>

                <div
                  className="row"
                  style={{ justifyContent: "flex-start", gap: 8 }}
                >
                  <div className="label">عملیات</div>
                  <div className="card-actions">
                    <button
                      className="btn btn-icon"
                      title="ویرایش"
                      onClick={() => openEdit(row)}
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      className="btn btn-icon btn-danger"
                      title="حذف"
                      onClick={() => handleDelete(row.id)}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        mode={mode}
        productId={selectedProductId}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchProducts}
      />
    </>
  );
}
