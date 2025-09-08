import React, { useState } from "react";
import ProductModal from "./ProductModal";

const SAMPLE_ROWS = [
  {
    name: "کباب کوبیده",
    category: "کباب‌ها",
    price: "۱۵۰,۰۰۰ تومان",
    active: true,
  },
  {
    name: "پیتزا پپرونی",
    category: "فست فود",
    price: "۲۲۰,۰۰۰ تومان",
    active: true,
  },
];

export default function ProductsSection() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'

  const openCreate = () => {
    setMode("create");
    setModalOpen(true);
  };

  const openEdit = () => {
    setMode("edit");
    setModalOpen(true);
  };

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
              {SAMPLE_ROWS.map((row, i) => (
                <tr key={`${row.name}-${i}`}>
                  <td>{row.name}</td>
                  <td>{row.category}</td>
                  <td>{row.price}</td>
                  <td>
                    <span
                      className={`status-chip ${
                        row.active ? "active" : "danger"
                      }`}
                    >
                      {row.active ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-icon"
                      title="ویرایش"
                      onClick={openEdit}
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
          {SAMPLE_ROWS.map((row, i) => (
            <article
              className="data-card"
              key={`${row.name}-card-${i}`}
              aria-label="محصول"
            >
              <div className="row">
                <span className="label">نام محصول</span>
                <span className="value">{row.name}</span>
              </div>
              <div className="row">
                <span className="label">دسته‌بندی</span>
                <span className="value">{row.category}</span>
              </div>
              <div className="row">
                <span className="label">قیمت پایه</span>
                <span className="value">{row.price}</span>
              </div>
              <div className="row" style={{ alignItems: "center" }}>
                <span className="label">وضعیت</span>
                <span
                  className={`status-chip ${row.active ? "active" : "danger"}`}
                >
                  {row.active ? "فعال" : "غیرفعال"}
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
                    onClick={openEdit}
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
