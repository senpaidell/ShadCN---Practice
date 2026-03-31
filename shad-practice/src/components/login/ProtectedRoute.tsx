import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface MyTokenPayload {
    exp: number;
}

const ProtectedRoute = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />
    }

    try {
        const decodedToken = jwtDecode<MyTokenPayload>(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
            localStorage.removeItem("token");
            return <Navigate to="/login" replace />
        }
    } catch (error) {
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute