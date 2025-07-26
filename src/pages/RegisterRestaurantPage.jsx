import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import usePageStyles from "../hooks/usePageStyles";

//  HH:MM  ➔  HH:MM:SS
const normalizeTime = (t) => (t.length === 5 ? `${t}:00` : t);

const isTimeValid = (start, end) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em > sh * 60 + sm;
};

export default function RegisterRestaurantPage() {
  /* load CSS (/public) */
  usePageStyles("/register-rastaurant.css");

  const navigate = useNavigate();

  /* local state for form */
  const [form, setForm] = useState({
    restaurantName: "",
    restaurantDescription: "",
    restaurantAddress: "",
    restaurantCategoryId: "",
    restaurantOpenTime: "",
    restaurantCloseTime: "",
    ownerNationalId: "",
    restaurantAccountNumber: "",
  });

  const [msg, setMsg] = useState({ text: "", type: "" }); // success | error

  /* fetch restaurant categories */
  const categoriesQuery = useQuery({
    queryKey: ["restaurantCategories"],
    queryFn: async () => {
      const res = await fetch("/api/restaurants/categories");
      if (!res.ok) throw new Error("خطا در دریافت دسته‌بندی‌ها");
      return res.json();
    },
    staleTime: 5 * 60 * 1_000,
  });

  /* submit mutation */
  const registerMutation = useMutation({
    mutationFn: async () => {
      // time validation
      if (!isTimeValid(form.restaurantOpenTime, form.restaurantCloseTime)) {
        throw new Error("ساعت پایان باید بعد از ساعت شروع باشد");
      }

      const payload = {
        ...form,
        restaurantOpenTime: normalizeTime(form.restaurantOpenTime),
        restaurantCloseTime: normalizeTime(form.restaurantCloseTime),
        restaurantCategoryId: Number(form.restaurantCategoryId),
      };

      const token = localStorage.getItem("token");
      const res = await fetch("/api/restaurants/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.text();
      if (!res.ok) throw new Error("ثبت رستوران با مشکل مواجه شد");
      return data;
    },
    onSuccess: () => {
      setMsg({ text: "رستوران با موفقیت ثبت شد", type: "success" });
      navigate("/", { replace: true });
    },
    onError: (err) => setMsg({ text: err.message, type: "error" }),
  });

  /* helpers */
  const updateField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  /* UI */
  return (
    <div className="form-container">
      <form
        id="owner-form"
        className="profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          setMsg({ text: "", type: "" });
          registerMutation.mutate();
        }}
      >
        <h2>تکمیل اطلاعات صاحب رستوران</h2>
        <p>این اطلاعات برای راه‌اندازی پنل مدیریت شما استفاده خواهد شد.</p>

        {/* Restaurant section */}
        <div className="input-group">
          <label htmlFor="name">نام رستوران</label>
          <input
            id="name"
            value={form.restaurantName}
            onChange={updateField("restaurantName")}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="desc">توضیحات رستوران</label>
          <textarea
            id="desc"
            rows="4"
            value={form.restaurantDescription}
            onChange={updateField("restaurantDescription")}
          />
        </div>

        <div className="input-group">
          <label htmlFor="addr">آدرس</label>
          <input
            id="addr"
            value={form.restaurantAddress}
            onChange={updateField("restaurantAddress")}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="cat">نوع رستوران</label>
          {categoriesQuery.isLoading ? (
            <p style={{ fontSize: "0.9rem" }}>در حال بارگذاری…</p>
          ) : categoriesQuery.isError ? (
            <p style={{ fontSize: "0.9rem", color: "#ef4444" }}>
              {categoriesQuery.error.message}
            </p>
          ) : (
            <select
              id="cat"
              value={form.restaurantCategoryId}
              onChange={updateField("restaurantCategoryId")}
              required
            >
              <option value="">-- انتخاب کنید --</option>
              {categoriesQuery.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="open">ساعت شروع فعالیت</label>
          <input
            id="open"
            type="time"
            value={form.restaurantOpenTime}
            onChange={updateField("restaurantOpenTime")}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="close">ساعت پایان فعالیت</label>
          <input
            id="close"
            type="time"
            value={form.restaurantCloseTime}
            onChange={updateField("restaurantCloseTime")}
            required
          />
        </div>

        {/* Owner section */}
        <p>اطلاعات تکمیلی صاحب رستوران</p>

        <div className="input-group">
          <label htmlFor="nid">کد ملی</label>
          <input
            id="nid"
            value={form.ownerNationalId}
            onChange={updateField("ownerNationalId")}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="acc">شماره حساب</label>
          <input
            id="acc"
            value={form.restaurantAccountNumber}
            onChange={updateField("restaurantAccountNumber")}
            required
          />
        </div>

        <button type="submit" disabled={registerMutation.isLoading}>
          {registerMutation.isLoading ? "در حال ارسال…" : "ثبت و ایجاد پنل"}
        </button>

        {/* message */}
        {msg.text && <p className={`message ${msg.type}`}>{msg.text}</p>}
      </form>
    </div>
  );
}
