import { createContext, useContext, useState } from "react";
import { loginAPI } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access") 
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (email, password) => {
    try {
      const data = await loginAPI(email, password);
      // The custom endpoint returns user info at the top level
      const { access, refresh, is_superuser, is_first_login, is_active, first_name, last_name, email: userEmail, user_id } = data;
      const user = {
        is_superuser,
        is_first_login,
        is_active,
        first_name,
        last_name,
        email: userEmail,
        user_id, // Store user_id
      };
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(user));
      setIsAuthenticated(true);
      setUser(user);
      return user; 
    } catch (error) {
      throw error; // allow caller to handle errors
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
