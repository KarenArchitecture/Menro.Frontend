import UserProfileForm from "../common/UserProfileForm";
import "../../assets/css/admin/profileSection.css";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function ProfileSection() {
  useDocumentTitle("پروفایل کاربری");
  return <UserProfileForm />;
}
