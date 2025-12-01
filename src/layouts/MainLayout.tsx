import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AuthLayout from "./AuthLayout";
import { useLocation } from "react-router-dom";
import type { MainLayoutProps } from "../types/MainLayoutProps";

const MainLayout = ({ children }: MainLayoutProps) => {
  const { pathname } = useLocation();

  const isAuthRoute = ["/login", "/auth", "/register"].some((p) =>
    pathname.startsWith(p)
  );

  if (isAuthRoute) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
