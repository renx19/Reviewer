// import { createContext, useContext, useState, useEffect } from "react";
// import { getProfile, refreshToken, loginService } from "../services/authService";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true); // true while checking auth

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const profile = await getProfile();
//         setUser(profile.user);
//       } catch {
//         try {
//           await refreshToken(); // refresh cookie-based token
//           const profile = await getProfile();
//           setUser(profile.user);
//         } catch {
//           setUser(null);
//         }
//       } finally {
//         setLoading(false); // done checking
//       }
//     };

//     checkAuth();
//   }, []);

//   const logout = async () => {
//     try {
//       await logoutService(); // clears server-side session/cookie
//     } catch (err) {
//       console.error("Logout failed:", err.message);
//     } finally {
//       setUser(null);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState } from "react";
import { getProfile, refreshToken, logoutService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // memory only
  const [loading, setLoading] = useState(false); // initially false
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Only fetch profile when needed (e.g., protected page)
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profile = await getProfile(accessToken); // will try cookie or header
      setUser(profile.user);
      if (profile.accessToken) setAccessToken(profile.accessToken);
    } catch (err) {
      console.warn("Not authenticated", err.message);
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await refreshToken();
      if (refreshed.accessToken) setAccessToken(refreshed.accessToken);
      await fetchProfile(); // re-fetch profile after refresh
    } catch (err) {
      console.error("Refresh failed", err.message);
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error("Logout failed:", err.message);
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        setUser,
        setAccessToken,
        fetchProfile,
        refreshAccessToken,
        logout,
        loading,
        isRefreshing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
