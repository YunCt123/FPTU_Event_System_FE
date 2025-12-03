import type { MainLayoutProps } from "../types/MainLayoutProps";

const AuthLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <main className="">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
