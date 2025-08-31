import { useNavigate } from "react-router-dom";

const AccountNotSupported = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold mb-3">Account Not Supported</h1>
        <p className="text-gray-700 mb-6">
          The account you are using does not have access to this section.
          Please log in with the appropriate account type.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-md border border-gray-300"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/beneficiary-login")}
            className="px-4 py-2 rounded-md bg-primary text-white"
          >
            Beneficiary Login
          </button>
          <button
            onClick={() => navigate("/rhu-login")}
            className="px-4 py-2 rounded-md bg-primary text-white"
          >
            RHU Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountNotSupported;
