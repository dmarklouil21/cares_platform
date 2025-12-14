import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

import SystemLoader from "src/components/SystemLoader";
import NotificationModal from "src/components/Modal/NotificationModal";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Loading State
  const [loading, setLoading] = useState(false);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);

      // Private/Partner Specific Check
      if (!loggedInUser.is_private) {
        setModalInfo({
          type: "info",
          title: "Access Denied",
          message: "You need a Private Partner account to access this portal.",
        });
        setShowModal(true);
        return;
      }

      // First Login Check
      if (loggedInUser.is_first_login) {
        navigate("/ResetPassword");
      } else {
        navigate("/Private");
      }
    } catch (err) {
      setModalInfo({
        type: "error",
        title: "Login Failed",
        message: "Invalid credentials. Please check your email and password.",
      });
      setShowModal(true);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <SystemLoader />}

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      {/* Main Container - Centered Content */}
      <div className="w-full h-full min-h-screen bg-gray flex items-center justify-center p-6">
        
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-lg shadow-xl border border-gray-100">
            
            {/* Header Section */}
            <div className="flex flex-col items-center mb-8 text-center gap-2">
                <img 
                  src="/images/logo_black_text.png" 
                  alt="RAFI Logo" 
                  className="h-14 object-contain mb-2" 
                />
                <h2 className="text-3xl font-bold text-primary">
                   Login as Partner
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                   Welcome back — continue delivering quality <br className="hidden md:block"/>
                   care to your community.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-4">
                      {/* Email Input */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Password
                            </label>
                        </div>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 shadow-md hover:shadow-lg transition-all transform active:scale-95"
                >
                    Login <ArrowRight className="w-4 h-4" />
                </button>
            </form>

            <div className="pt-6 border-t border-gray-100 text-center mt-6">
                <p className="text-sm text-gray-600">
                    Don't have an account yet?{" "}
                    <Link to="/private-registration/note" className="font-bold text-primary hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>

        </div>
      </div>
    </>
  );
};

export default Login;