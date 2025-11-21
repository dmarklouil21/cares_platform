import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import SystemLoader from "src/components/SystemLoader";

import api from "src/api/axiosInstance";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });
  // Loading Modal
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (!loggedInUser.is_active) {
        navigate("/ResetPassword");
      } else if (!loggedInUser.is_superuser) {
        alert("This account doesn't have priviliges to access the admin site.");
        return;
      } else {
        navigate("/admin");
      }
    } catch (err) {
      alert("Login failed. Please check your credentials.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <LoadingModal open={loading} text="Loading..." /> */}
      {loading && <SystemLoader />}
      <div
        id="right-panel"
        className="relative bg-gray w-full lg:w-[75%] h-full flex flex-col items-center justify-center md:justify-center gap-10"
      >
        <div className="bg-primary w-full h-[65px] fixed top-0 left-0 flex items-center gap-4 px-5 py-10 md:hidden shadow-lg z-10 ">
          <img
            src="/images/logo_white_text.png"
            alt="CARES Logo"
            className="size-15"
          />
          <p className="font-bold text-white text-[20px] tracking-wider">
            CARES Platform
          </p>
        </div>

        <div className="flex flex-col gap-2 items-center justify-center">
          <h2 className="text-5xl font-bold text-primary text-center">
            Log in to your Account
          </h2>
          <p className="text-center text-base text-black">
            Access administrative tools to monitor and <br />
            maintain healthcare services care to your community.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-2 bg-white w-full max-w-md rounded-xl shadow px-8 py-6"
        >
          <div className="w-full space-y-3 mb-3">
            <div className="flex gap-2 flex-col">
              <label>Email</label>
              <input
                type="text"
                className="border-[#E2E2E2] border-[1px] rounded-md p-2"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label>Password</label>
              <div className="relative border-[#E2E2E2] border-[1px] rounded-md p-2">
                <input
                  type={showPassword ? "text" : "password"}
                  className=" pr-10 w-full focus:outline-none "
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {!showPassword ? (
                    /* Eye-off icon */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18"
                      />
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.477 10.477A3 3 0 0012 15a3 3 0 001.523-.423M7.5 7.85C5.148 9.116 3.6 11.16 3 12c1.8 2.571 5.4 6 9 6 1.12 0 2.2-.22 3.21-.62M14.121 5.2C13.44 5.068 12.736 5 12 5 7.5 5 3.9 8.429 3 11c.363.78 1.03 1.77 1.93 2.77"
                      />
                    </svg>
                  ) : (
                    /* Eye icon */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19s-8.268-2.943-9.542-7z"
                      />
                      <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <button
            id="login-button"
            type="submit"
            className="w-full font-bold bg-primary text-white py-2 border-[1px] border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
          >
            Login
          </button>
          {/* <p className="text-sm text-black">
            Don't have an account?{" "}
            <Link
              to="/admin-registration"
              className="text-primary font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p> */}
          {/* <div className="w-full flex items-center my-2">
            <hr className="flex-grow border-gray-200" />
            <span className="mx-4 text-gray-400">Or</span>
            <hr className="flex-grow border-gray-200" />
          </div>
          <button
            type="button"
            className="flex items-center text-sm w-full bg-[#f3f7fa] border py-2 rounded-full justify-center hover:bg-gray-100"
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
              <rect fill="#f35325" x="2" y="2" width="9" height="9" />
              <rect fill="#81bc06" x="13" y="2" width="9" height="9" />
              <rect fill="#05a6f0" x="2" y="13" width="9" height="9" />
              <rect fill="#ffba08" x="13" y="13" width="9" height="9" />
            </svg>
            Sign up with Microsoft
          </button> */}
        </form>
      </div>
    </>
  );
};

export default Login;
