import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import type { MainLayoutProps } from "../types/MainLayoutProps";

const AdminLayout = ({ children }: MainLayoutProps) => {
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

export default AdminLayout;
