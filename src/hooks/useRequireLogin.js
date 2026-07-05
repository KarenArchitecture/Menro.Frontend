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

        title: "ورود لازم است",
        description: null,
        icon: null,

        loginText: "ورود به حساب",
        cancelText: "بعداً وارد می‌شوم",
    });

    const requireLogin = ({
        onAuthenticated,
        returnUrl,

        title = "ورود لازم است",
        description = null,
        icon = null,

        loginText = "ورود به حساب",
        cancelText = "بعداً وارد می‌شوم",
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

            title,
            description,
            icon,

            loginText,
            cancelText,
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

        modalProps: {
            title: pendingAction.title,
            description: pendingAction.description,
            icon: pendingAction.icon,
            loginText: pendingAction.loginText,
            cancelText: pendingAction.cancelText,
        },
    };
}

