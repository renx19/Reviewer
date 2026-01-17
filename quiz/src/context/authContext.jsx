import { useState, useEffect, createContext, useContext } from "react";
import { getProfile, refreshToken } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getProfile(accessToken, setAccessToken);
        setUser(profile.user);
      } catch {
        try {
          await refreshToken(); // refresh cookie-based token
          const profile = await getProfile(accessToken, setAccessToken);
          setUser(profile.user);
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
