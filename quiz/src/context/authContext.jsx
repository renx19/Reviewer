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

import { createContext, useContext, useState, useEffect } from "react";
import { getProfile, refreshToken, logoutService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // <-- store in memory
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user === null) {
      // Only fetch profile for protected pages
      const fetchProfile = async () => {
        try {
          const profile = await getProfile(accessToken); // accessToken may be null
          setUser(profile.user);
          setAccessToken(profile.accessToken || null);
        } catch {
          setUser(null);
          setAccessToken(null);
        }
      };

      fetchProfile();
    }
  }, [user, accessToken]);

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
    <AuthContext.Provider value={{ user, accessToken, setUser, setAccessToken, logout, loading, isRefreshing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
