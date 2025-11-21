import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

import SystemLoader from "src/components/SystemLoader";
import NotificationModal from "src/components/Modal/NotificationModal";

import api from "src/api/axiosInstance";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Loading Modal
  const [loading, setLoading] = useState(false);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.is_superuser || loggedInUser.is_rhu) {
        setModalInfo({
          type: "info",
          title: "Login Failed",
          message:
            "You need a beneficiary account to access the beneficiary portal.",
        });
        setShowModal(true);
        return;
      }

      if (loggedInUser.is_first_login) {
        navigate("/ResetPassword");
      } else {
        try {
          const response = await api.get("/beneficiary/patient/details/");
          if (response.data.status) {
            navigate("/beneficiary");
          }
        } catch (error) {
          // If no beneficiary record, go to pre-enrollment
          navigate("/beneficiary/pre-enrollment/note");
        }
      }
    } catch (err) {
      setModalInfo({
        type: "error",
        title: "Login Failed",
        message: "Login failed. Please check your credentials.",
      });
      setShowModal(true);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      {/* <LoadingModal open={loading} text="Loading..." /> */}
      {loading && <SystemLoader />}
      <div
        id="right-panel"
        className="bg-gray w-[100%]  lg:w-[75%] h-[100%] flex flex-col items-center  md:justify-center gap-10 shadow-xl"
      >
        <div className="bg-primary w-full h-18 absolute flex px-5 py-10 gap-4 items-center md:hidden shadow-xl">
          <img src="/images/logo_white_text.png" className="size-15" />
          <div>
            {" "}
            <p className="font-bold text-white  text-[20px] tracking-wider">
              CARES Platform
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-center justify-center mt-36 md:mt-0">
          <h2 className="text-3xl md:text-5xl font-bold text-primary text-center">
            Login as Beneficiary
          </h2>
          <p className="text-center text-base text-black">
            Welcome back — access your health updates and <br />
            stay on track with your care.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-2 bg-white w-[400px]  md:w-[450px] rounded-xl shadow px-8 py-6 "
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
                  className=" pr-10 focus:outline-none flex w-full"
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
                    // Eye-off icon
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
                        d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 001.42-.38M9.88 4.24A9.98 9.98 0 0112 4c5.52 0 10 4.48 10 8 0 1.32-.45 2.56-1.25 3.63M6.35 6.35C4.31 7.68 3 9.69 3 12c0 3.52 4.48 8 9 8 1.04 0 2.04-.17 2.97-.49"
                      />
                    </svg>
                  ) : (
                    // Eye icon
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
                        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
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
            className="w-full font-bold bg-primary text-white py-2 w-[45%] border-[1px] border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
          >
            Login
          </button>
          <p className="text-sm text-black">
            Don't have an account?{" "}
            <Link
              to="/beneficiary-registration"
              className="text-primary font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
          {/* <div className="w-full flex items-center my-2">
            <hr className="flex-grow border-gray-200" />
            <span className="mx-4 text-gray-400">Or</span>
            <hr className="flex-grow border-gray-200" />
          </div> */}
          {/* <button
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
