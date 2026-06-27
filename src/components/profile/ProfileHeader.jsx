import MenuDrawer from "../common/MenuDrawer";
import ProfileAvatar from "./ProfileAvatar";

export default function ProfileHeader({ user }) {
  return (
    <div className="profile-header">
      <div className="profile-header__topbar">
        <MenuDrawer />
      </div>

      <ProfileAvatar user={user} />
    </div>
  );
}
