import SideBar from "../components/layout/SideBar";
import type { MainLayoutProps } from "../types/MainLayoutProps";

const AdminLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <div className="flex flex-1">
        <SideBar userRole="admin" />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
