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
  const [accessToken, setAccessToken] = useState(null); // memory only
  const [loading, setLoading] = useState(true); // initially true, we are checking auth
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Run on mount to restore login
  useEffect(() => {
    const restoreSession = async () => {
      try {
        setIsRefreshing(true);
        const refreshed = await refreshToken(); // uses refresh token cookie
        if (refreshed.accessToken) setAccessToken(refreshed.accessToken);
        const profile = await getProfile(refreshed.accessToken);
        setUser(profile.user);
      } catch (err) {
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsRefreshing(false);
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profile = await getProfile(accessToken);
      setUser(profile.user);
      if (profile.accessToken) setAccessToken(profile.accessToken);
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await refreshToken(); // cookie sent automatically
      if (refreshed.accessToken) setAccessToken(refreshed.accessToken);

      const profile = await getProfile(refreshed.accessToken); // ensure user updated
      setUser(profile.user);
    } catch {
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
