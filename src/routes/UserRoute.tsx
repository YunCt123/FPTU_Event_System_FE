import React from "react";
import { Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

// const isAuthenticated = () => {
//   return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
// };

const UserRoute: React.FC = () => {
  // if (!isAuthenticated()) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default UserRoute;
