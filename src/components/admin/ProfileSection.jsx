import React from "react";

export default function ProfileSection() {
  const handleSubmit = (e) => {
    e.preventDefault();
    //  API later
    console.log("Profile form submitted");
  };

  return (
    <div className="panel">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="user-name">نام و نام خانوادگی</label>
          <input type="text" id="user-name" defaultValue="کاربر ادمین" />
        </div>

        <div className="input-group">
          <label htmlFor="user-phone">شماره تلفن</label>
          <input type="tel" id="user-phone" defaultValue="09123456789" />
        </div>

        <div className="input-group">
          <label htmlFor="user-password">رمز عبور جدید</label>
          <input
            type="password"
            id="user-password"
            placeholder="برای تغییر، رمز جدید را وارد کنید"
          />
        </div>

        <div className="input-group">
          <label htmlFor="user-avatar-upload">عکس پروفایل</label>
          <input type="file" id="user-avatar-upload" accept="image/*" />
        </div>

        <button type="submit" className="btn btn-primary">
          ذخیره تغییرات
        </button>
      </form>
    </div>
  );
}
