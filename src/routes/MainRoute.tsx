import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import UserRoute from "./UserRoute";
import AdminRoute from "./AdminRoute";
import OrganizerRoute from "./OrganizerRoute";
import { Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import EventsPage from "../pages/EventsPage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";
import AdminVenuePage from "../pages/admin/venue/AdminVenuePage";
import OrganizerVenuePage from "../pages/organizer/venue/OrganizerVenuePage";
// import OrganizerList from "../pages/admin/organizer/OrganizerList";
import CampusPage from "../pages/admin/campus/CampusPage";

const MainRoute: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={(() => {
            const token =
              localStorage.getItem("token") || sessionStorage.getItem("token");
            return !token ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            );
          })()}
        />

        {/* User area - protected and wrapped by MainLayout */}
        <Route element={<UserRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Auth-specific nested routes use AuthRoute (renders AuthLayout) */}
        <Route element={<AuthRoute />}>
           <Route path="/login" element={<LoginPage />} />
           
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
          <Route path="/admin/venues" element={<AdminVenuePage />} />
          <Route path="/admin/venues/seat-config" element={<div>Seat Config</div>} />
          <Route path="/admin/events/pending" element={<div>Pending Events</div>} />
          <Route path="/admin/events/approved" element={<div>Approved Events</div>} />
          <Route path="/admin/events/rejected" element={<div>Rejected Events</div>} />
          {/* <Route path="/admin/organizers" element={<OrganizerList />} /> */}
          <Route path="/admin/campuses" element={<CampusPage />} />
          <Route path="/admin/categories" element={<div>Categories Management</div>} />
          <Route path="/admin/banners" element={<div>Banners Management</div>} />
          <Route path="/admin/settings" element={<div>System Settings</div>} />
        </Route>

        {/* Organizer routes */}
        <Route element={<OrganizerRoute />}>
          <Route path="/organizer/dashboard" element={<div>Organizer Dashboard</div>} />
          <Route path="/organizer/events" element={<div>My Events</div>} />
          <Route path="/organizer/venues" element={<OrganizerVenuePage />} />
          <Route path="/organizer/profile" element={<div>Organization Profile</div>} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRoute;
