import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type RoleRouteProps = {
  allowedRoles: string[];
};

function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "restaurant_staff") {
      return <Navigate to="/staff" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
