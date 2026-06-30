import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function useRequireLogin() {
    const { user } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    const requireLogin = (callback) => {
        if (user) {
        callback?.();
        return;
        }

        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
    };

    const goToLogin = () => {
        navigate(
        `/login?returnUrl=${encodeURIComponent(
            location.pathname + location.search
        )}`
        );
    };

    return {
        requireLogin,
        open,
        closeModal,
        goToLogin,
    };
}