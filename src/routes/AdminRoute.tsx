import React from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

// const isAuthenticated = () => {
//   const token = localStorage.getItem("token") || sessionStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   return !!(token && user.role === "ORGANIZER");
// };

const AdminRoute: React.FC = () => {
  // if (!isAuthenticated()) return <Navigate to="/login" replace />;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminRoute;
