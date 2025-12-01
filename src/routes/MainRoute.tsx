import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthRoute from "./AuthRoute";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import EventsPage from "../pages/EventsPage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";

const MainRoute: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route element={<AuthRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default MainRoute;
