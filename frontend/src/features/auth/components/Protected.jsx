import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectLoggedInUser } from "../AuthSlice";

export const Protected = ({ children, adminOnly = false }) => {
    const loggedInUser = useSelector(selectLoggedInUser);
    const location = useLocation();

    if (!loggedInUser?.isVerified) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (adminOnly && !loggedInUser?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};
