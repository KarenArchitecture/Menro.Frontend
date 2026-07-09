import { Link } from "react-router-dom";

import UserProfileForm from "../common/UserProfileForm";

export default function ProfileAvatar({ user }) {
  return (
    <div className="profile-avatar">
      {/* Glow */}
      <div className="profile-avatar__glow" />

      {/* Ring */}
      <div className="profile-avatar__ring">
        <div className="profile-avatar__inner">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" />
          ) : (
            <div className="profile-avatar__placeholder">
              <img
                src="/images/profile/profile-avatar-icon.svg"
                alt="default avatar"
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Button */}
      <Link
        to="/profile/edit"
        className="profile-avatar__edit"
        aria-label="ویرایش پروفایل"
      >
        ✎
      </Link>

      {/* Username */}
      <div className="profile-avatar__name">{user?.name}</div>
    </div>
  );
}
