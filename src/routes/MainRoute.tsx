import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import UserRoute from "./UserRoute";
import AdminRoute from "./AdminRoute";
import { Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import EventsPage from "../pages/EventsPage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";
import VenuePage from "../pages/admin/venue/VenuePage";
import ListEventPage from "../pages/ListEventPage";
import AllListEventPage from "../pages/AllListEventPage";
import DetailEventPage from "../pages/DetailEventPage";


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
          <Route path="list-events" element ={<ListEventPage/>}/>
          <Route path="list-all-events" element ={<AllListEventPage/>}/>
          <Route path="detail-events" element ={<DetailEventPage/>}/>
        </Route>

        {/* Auth-specific nested routes use AuthRoute (renders AuthLayout) */}
        <Route element={<AuthRoute />}>
           <Route path="/login" element={<LoginPage />} />
           
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/venues" element={<VenuePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRoute;
