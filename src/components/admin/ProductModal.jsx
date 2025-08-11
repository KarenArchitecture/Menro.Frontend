import React from "react";

export default function ProductModal({ isOpen, mode = "create", onClose }) {
  const title = mode === "edit" ? "ویرایش محصول" : "افزودن محصول جدید";

  return (
    <div
      id="product-modal"
      className="modal-overlay"
      style={{ display: isOpen ? "flex" : "none" }}
      onClick={(e) => e.target.id === "product-modal" && onClose?.()}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button className="btn btn-icon" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="modal-body">
          <form id="product-form" className="two-column-form">
            <div className="form-column">
              <div className="input-group">
                <label htmlFor="product-name">نام محصول</label>
                <input type="text" id="product-name" required />
              </div>

              <div className="input-group">
                <label htmlFor="product-description">توضیح مختصر محصول</label>
                <textarea id="product-description" rows={4} />
              </div>

              <div className="input-group">
                <label htmlFor="product-category">دسته‌بندی</label>
                <select id="product-category" required>
                  <option value="kabab">کباب‌ها</option>
                  <option value="fastfood">فست فود</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="product-combinations">ترکیب‌ها (اختیاری)</label>
                <select id="product-combinations" multiple>
                  <option value="combo1">ترکیب ویژه ۱</option>
                  <option value="combo2">ترکیب اقتصادی</option>
                </select>
                <small>
                  برای انتخاب چند مورد، کلید Ctrl یا Cmd را نگه دارید.
                </small>
              </div>
            </div>

            <div className="form-column">
              <div className="input-group">
                <label>عکس محصول</label>
                <input type="file" id="product-image" className="file-input" />
              </div>

              <div className="input-group">
                <label htmlFor="product-price">
                  قیمت پایه (برای محصول ساده)
                </label>
                <input
                  type="text"
                  id="product-price"
                  placeholder="مثال: ۱۵۰۰۰۰"
                />
              </div>

              <hr className="form-divider" />

              <div className="input-group">
                <label>انواع محصول (اختیاری)</label>
                <div id="product-types-container">
                  <div className="product-type-item">
                    <input type="text" placeholder="نام نوع (مثال: ویژه)" />
                    <input type="text" placeholder="قیمت نوع" />
                    <label className="radio-label">
                      <input type="radio" name="default_type" defaultChecked />{" "}
                      پیش‌فرض
                    </label>
                    <button type="button" className="btn btn-icon btn-danger">
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  id="add-type-btn"
                  className="btn btn-secondary full-width"
                >
                  + افزودن نوع جدید
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="submit" form="product-form" className="btn btn-primary">
            ذخیره محصول
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
