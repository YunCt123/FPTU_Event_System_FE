import { Navigate, Outlet } from 'react-router-dom';

export interface RouteProps {
  role: string[];
}

const ProtectedRoute = ({role}: RouteProps) => {

    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    
    const roleName = user.roleName;
    const token = localStorage.getItem("token");

    if (!token){
        return <Navigate to="/login" replace />;
    }
    
    if (!role.includes(roleName)) {
        return <Navigate to="/403" replace />;
  }
    return <Outlet />;
}



export default ProtectedRoute