import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function useRequireLogin() {
    const { user } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    // اطلاعات آخرین درخواست محافظت‌شده
    const [pendingAction, setPendingAction] = useState({
        callback: null,
        returnUrl: null,
    });

    const requireLogin = ({
        onAuthenticated,
        returnUrl,
    } = {}) => {
        if (user) {
        onAuthenticated?.();
        return;
        }

        setPendingAction({
        callback: onAuthenticated ?? null,
        returnUrl:
            returnUrl ??
            `${location.pathname}${location.search}`,
        });

        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
    };

    const goToLogin = () => {
        navigate(
        `/login?returnUrl=${encodeURIComponent(
            pendingAction.returnUrl
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