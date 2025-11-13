import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../../api/user.js";
import { useAuth } from "../../Context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function ProfileSection() {
  // hooks
  const { refreshUser } = useAuth();

  // fields
  //const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await getUserProfile();
        setFullName(data.fullName);
        setPhoneNumber(data.phoneNumber);
        if (data.profileImageUrl) {
          setProfilePreview(data.profileImageUrl);
        }
      } catch (err) {
        console.error("خطا در دریافت پروفایل:", err);
      }
    };

    loadProfile();
  }, []);

  // update profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", fullName);

    if (newPassword) formData.append("newPassword", newPassword);
    if (profileImage) formData.append("profileImage", profileImage);

    try {
      await updateUserProfile(formData);
      alert("پروفایل با موفقیت ذخیره شد");
      await refreshUser();
    } catch (err) {
      alert("خطا در ذخیره تغییرات");
      console.error(err);
    }
  };

  return (
    <div className="panel">
      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="input-group">
          <label htmlFor="user-name">نام و نام خانوادگی</label>
          <input
            type="text"
            id="user-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <hr style={{ border: "1px solid #444", margin: "20px 0" }} />

        {/* Phone Number (read only) */}
        <div className="input-group">
          <label htmlFor="user-phone">شماره تلفن</label>{" "}
          <Link to={"/change-phone"} className="btn btn-primary">
            تغییر شماره همراه
          </Link>
          <input type="tel" id="user-phone" value={phoneNumber} readOnly />
        </div>
        <hr style={{ border: "1px solid #444", margin: "20px 0" }} />

        {/* New Password */}
        <div className="input-group">
          <label htmlFor="user-password">رمز عبور جدید</label>
          <br></br>
          {/* <input
            type="password"
            id="user-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="برای تغییر، رمز جدید را وارد کنید"
          /> */}
          <Link to={"/forgot-password"} className="btn btn-primary">
            تغییر رمز عبور
          </Link>
        </div>
        <hr style={{ border: "1px solid #444", margin: "20px 0" }} />

        {/* Profile Image */}

        <label htmlFor="user-avatar-upload">عکس پروفایل</label>
        <br />
        <div className="input-group">
          <div style={{ textAlign: "center" }}>
            {profilePreview && (
              <img
                src={profilePreview}
                alt="عکس پروفایل"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  margin: "15px auto",
                }}
              />
            )}
          </div>

          <input
            type="file"
            id="user-avatar-upload"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setProfileImage(file);

              if (file) {
                setProfilePreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>
        <hr style={{ border: "1px solid #444", margin: "20px 0" }} />

        <button type="submit" className="btn btn-primary">
          ذخیره تغییرات
        </button>
      </form>
    </div>
  );
}
