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
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.3333 8.74984V9.99984C18.3333 13.9282 18.3333 15.8924 17.1129 17.1128C15.8925 18.3332 13.9283 18.3332 9.99996 18.3332C6.07159 18.3332 4.1074 18.3332 2.88701 17.1128C1.66663 15.8924 1.66663 13.9282 1.66663 9.99984C1.66663 6.07147 1.66663 4.10728 2.88701 2.88689C4.1074 1.6665 6.07159 1.6665 9.99996 1.6665H11.25" stroke="#FAFAF4" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M13.8767 2.87905L14.4173 2.33837C15.3132 1.44255 16.7656 1.44255 17.6614 2.33837C18.5573 3.2342 18.5573 4.68663 17.6614 5.58245L17.1207 6.12313M13.8767 2.87905C13.8767 2.87905 13.9443 4.028 14.958 5.04177C15.9718 6.05555 17.1207 6.12313 17.1207 6.12313M13.8767 2.87905L8.90594 7.84978C8.56926 8.18646 8.40092 8.3548 8.25615 8.54041C8.08537 8.75936 7.93896 8.99627 7.81949 9.24693C7.71822 9.45943 7.64294 9.68528 7.49237 10.137L7.01031 11.5832M7.01031 11.5832L6.69839 12.5189C6.62429 12.7412 6.68215 12.9863 6.84783 13.152C7.01351 13.3177 7.25858 13.3755 7.48087 13.3014L8.41663 12.9895L9.86281 12.5074C10.3145 12.3569 10.5404 12.2816 10.7529 12.1803C11.0035 12.0608 11.2404 11.9144 11.4594 11.7436C11.645 11.5989 11.8133 11.4305 12.15 11.0939L17.1207 6.12313M8.41663 12.9895L7.01031 11.5832" stroke="#FAFAF4" strokeWidth="1.5"/>
        </svg>

      </Link>

      {/* Username */}
      <div className="profile-avatar__name">{user?.name}</div>
    </div>
  );
}
