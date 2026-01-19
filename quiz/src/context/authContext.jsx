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
    const checkAuth = async () => {
      try {
        // Try getting profile (web: cookies automatically)
        const profile = await getProfile();
        setUser(profile.user);
        setAccessToken(profile.accessToken || null); // memory token for header clients
      } catch {
        try {
          setIsRefreshing(true);
          const refreshed = await refreshToken(); // refresh via cookie
          const profile = await getProfile();
          setUser(profile.user);
          setAccessToken(refreshed.accessToken || null);
        } catch {
          setUser(null);
          setAccessToken(null);
        } finally {
          setIsRefreshing(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

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
