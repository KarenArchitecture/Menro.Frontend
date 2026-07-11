import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { authRequiredCopy } from "../constants/authRequiredCopy";

export default function useRequireLogin() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState({
        callback: null,
        returnUrl: null,
        type: "default",
        icon: null,
    });

    const requireLogin = ({ onAuthenticated, returnUrl, type = "default", icon } = {}) => {
        if (user) {
        onAuthenticated?.();
        return;
        }

        setPendingAction((prev) => ({
        ...prev,
        callback: onAuthenticated ?? null,
        returnUrl: returnUrl ?? `${location.pathname}${location.search}`,
        type: type ?? prev.type,
        icon: icon ?? prev.icon,
        }));

        setOpen(true);
    };

    const closeModal = () => setOpen(false);

    const goToLogin = () => {
        navigate(`/login?returnUrl=${encodeURIComponent(pendingAction.returnUrl)}`);
    };

    const modalData = authRequiredCopy[pendingAction.type] || authRequiredCopy.default;

    return {
        requireLogin,
        open,
        closeModal,
        goToLogin,
        modalProps: {
        icon: pendingAction.icon,
        title: modalData.title,
        description: modalData.description,
        },
    };
}