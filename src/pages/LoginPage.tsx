import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button
        onClick={() => navigate("/home")}
        className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
      >
        Sign in
      </button>
    </div>
  );
};

export default LoginPage;
