import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import UserRoute from "./UserRoute";
import OrganizerRoute from "./OrganizerRoute";
import { Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";
import NotificationsPage from "../pages/NotificationsPage";
import AdminVenuePage from "../pages/admin/venue/AdminVenuePage";
import DetailEventPage from "../pages/admin/event/DetailEventPage";
import ListEventPage from "../pages/admin/event/ListEventPage";
// import OrganizerList from "../pages/admin/organizer/OrganizerList";
import CampusPage from "../pages/admin/campus/CampusPage";
import OrganizerList from "../pages/admin/organizer/OrganizerList";
import AdminRoute from "./AdminRoute";
import AuthCallback from "../pages/AuthCallback";
import { OrganizerEventPage } from "../pages";
import OrganizerDashboardPage from "../pages/organizer/dashboard/OrganizerDashboardPage";
import EventManagementPage from "../pages/organizer/event/EventManagementPage";
import SeatAllocationPage from "../pages/organizer/seat/SeatAllocationPage";
import AttendeesManagementPage from "../pages/organizer/attendee/AttendeesManagementPage";
import StaffManagementPage from "../pages/organizer/staff/StaffManagementPage";
import EventReportsPage from "../pages/organizer/report/EventReportsPage";
import DashboardPage from "../pages/admin/event/DashboardPage";
import EditEventPage from "../pages/admin/event/EditEventPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import UserList from "../pages/admin/user/UserList";
import AccountPage from "../pages/AccountPage";
import SpeakerManagementPage from "../pages/organizer/speaker/SpeakerManagementPage";
import AdminIncidentsPage from "../pages/admin/incident/AdminIncidentsPage";
import OrganizerIncidentsPage from "../pages/organizer/incident/OrganizerIncidentsPage";
import DeleteResponsePage from "../pages/admin/event/DeleteResponsePage";

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
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/home" replace />
            );
          })()}
        />

        {/* User area - protected and wrapped by MainLayout */}
        <Route element={<UserRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<AccountPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Auth-specific nested routes use AuthRoute (renders AuthLayout) */}
        <Route element={<AuthRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/google/callback" element={<AuthCallback />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute role={["admin"]} />}>
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/venues" element={<AdminVenuePage />} />
            <Route path="/admin/venues/seat-config"element={<div>Seat Config</div>}/>
            <Route path="/admin/campuses" element={<CampusPage />} />
            <Route path="/admin/categories" element={<div>Categories Management</div>}/>
            <Route path="/admin/banners" element={<div>Banners Management</div>} />
            <Route path="/admin/settings" element={<div>System Settings</div>} />
            <Route path="/admin/detail-events/:id" element={<DetailEventPage />}/>
            <Route path="/admin/list-events" element={<ListEventPage />} />
            <Route path="/admin/list-delete-events" element={<DeleteResponsePage />} />
            <Route path="/admin/dashboard-events" element={<DashboardPage />} />
            <Route path="/admin/events" element={<EditEventPage />} />
            <Route path="/admin/organizers" element={<OrganizerList />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/users/pending" element={<div>User Detail Page</div>} />
            <Route path="/admin/incidents" element={<AdminIncidentsPage />} />
          </Route>
        </Route>

        {/* Organizer routes */}
        <Route element={<ProtectedRoute role={["event_organizer"]} />}>
          <Route element={<OrganizerRoute />}>
            <Route path="/organizer/dashboard" element={<OrganizerDashboardPage />}/>
            <Route path="/organizer/events" element={<EventManagementPage />} />
            <Route path="/organizer/events/create" element={<EventManagementPage />} />
            <Route path="/organizer/events/:id" element={<OrganizerEventPage />} />
            <Route path="/organizer/events/:eventId/seats/:venueId" element={<SeatAllocationPage />} />
            <Route path="/organizer/attendees" element={<AttendeesManagementPage />}/>
            <Route path="/organizer/staff" element={<StaffManagementPage />} />
            <Route path="/organizer/reports" element={<EventReportsPage />} />
            <Route path="/organizer/speakers" element={<SpeakerManagementPage />} />
            <Route path="/organizer/organizers" element={<OrganizerList />} />
            <Route path="/organizer/incidents" element={<OrganizerIncidentsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRoute;
