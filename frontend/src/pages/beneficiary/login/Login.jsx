import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";
import api from "src/api/axiosInstance";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.is_superuser || loggedInUser.is_rhu) {
        alert(
          "You need a beneficiary account to access the site for the beneficiary."
        );
        return;
      }

      if (loggedInUser.is_active) {
        try {
          const response = await api.get("/beneficiary/details/");
          if (response.data.status) {
            navigate("/Beneficiary");
          }
        } catch (error) {
          // If no beneficiary record, go to pre-enrollment
          navigate("/NoteBeneficiary");
        }
      } else {
        navigate("/ResetPassword");
      }

      /* if (loggedInUser.is_superuser) {
        navigate("/Admin");
      } else if (loggedInUser.is_first_login) {
        navigate("/ResetPassword");
      } else if (loggedInUser.is_active) {
        try {
          const response = await api.get("/beneficiary/details/");
          if (response.data.status) {
            navigate("/Beneficiary");
          }
        } catch (error) {
          // If no beneficiary record, go to pre-enrollment
          navigate("/NoteBeneficiary");
        }
      } else {
        // Not active, go to reset password
        navigate("/ResetPassword");
      } */
    } catch (err) {
      alert("Login failed. Please check your credentials.");
      console.error("Login error:", err);
    }
  };

  return (
    <div
      id="right-panel"
      className="bg-gray w-[100%]  md:w-[75%] h-[100%] flex flex-col items-center  md:justify-center gap-10"
    >
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
            <input
              type="password"
              className="border-[#E2E2E2] border-[1px] rounded-md p-2"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
        <div className="w-full flex items-center my-2">
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
        </button>
      </form>
    </div>
  );
};

export default Login;
