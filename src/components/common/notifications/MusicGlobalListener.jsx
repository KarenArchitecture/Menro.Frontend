// src/components/notifications/MusicGlobalListener.jsx
import { useEffect } from "react";
import { useMusicSignalR } from "../../../hooks/useMusicSignalR";
import { useModal } from "../GlobalModal";

export default function MusicGlobalListener({ restaurantId }) {
  const { showModal } = useModal();

  useMusicSignalR(restaurantId, {
    onApproved: (data) => {
      console.log("APPROVED GLOBAL:", data);

      showModal({
        title: "درخواست تأیید شد",
        message: "درخواست موسیقی شما توسط رستوران تأیید شد.",
        buttonText: "متوجه شدم",
      });
    },

    onRejected: (data) => {
      console.log("REJECTED GLOBAL:", data);

      showModal({
        title: "درخواست رد شد",
        message: "درخواست موسیقی شما توسط رستوران رد شد.",
        buttonText: "متوجه شدم",
      });
    },
  });

  return null;
}
