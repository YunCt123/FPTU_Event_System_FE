import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import UserRoute from "./UserRoute";
import { Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import EventsPage from "../pages/EventsPage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";

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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRoute;
