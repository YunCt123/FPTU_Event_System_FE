import React from "react";
import { Outlet } from "react-router-dom";
import OrganizerLayout from "../layouts/OrganizerLayout";

// const isAuthenticated = () => {
//   const token = localStorage.getItem("token") || sessionStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   return !!(token && user.role === "ORGANIZER");
// };

const OrganizerRoute: React.FC = () => {
  // if (!isAuthenticated()) return <Navigate to="/login" replace />;

  return (
    <OrganizerLayout>
      <Outlet />
    </OrganizerLayout>
  );
};

export default OrganizerRoute;
