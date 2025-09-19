import React, { useState, useEffect } from "react";
import ProductModal from "./ProductModal";
import adminfoodAxios from "../../api/adminFoodAxios";

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'

  // گرفتن لیست غذاها
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("calling read-all");
        const { data } = await adminfoodAxios.get("/read-all");
        setProducts(data);
      } catch (err) {
        console.error("خطا در گرفتن لیست محصولات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const openCreate = () => {
    setMode("create");
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setMode("edit");
    setModalOpen(true);
    // اینجا می‌تونی product رو به ProductModal پاس بدی
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
        {/* TABLE (desktop/tablet) */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>نام محصول</th>
                <th>دسته‌بندی</th>
                <th>قیمت پایه</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((row, i) => (
                <tr key={row.id || i}>
                  <td>{row.name}</td>
                  <td>{row.foodCategoryName}</td>
                  <td>
                    {row.price > 0
                      ? `${row.price.toLocaleString()} تومان`
                      : "-"}
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
                    <button className="btn btn-icon btn-danger" title="حذف">
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARDS (phones) */}
        <div className="cards-list products-cards">
          {products.map((row, i) => (
            <article
              className="data-card"
              key={`card-${row.id || i}`}
              aria-label="محصول"
            >
              <div className="row">
                <span className="label">نام محصول</span>
                <span className="value">{row.name}</span>
              </div>
              <div className="row">
                <span className="label">دسته‌بندی</span>
                <span className="value">{row.foodCategoryName}</span>
              </div>
              <div className="row">
                <span className="label">قیمت پایه</span>
                <span className="value">
                  {row.price > 0 ? `${row.price.toLocaleString()} تومان` : "-"}
                </span>
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
                  <button className="btn btn-icon btn-danger" title="حذف">
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        mode={mode}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
