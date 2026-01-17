// src/utils/apiRequest.js
export const apiRequest = async (endpoint, options = {}, accessToken = null, setAccessToken = null) => {
  const API_BASE = import.meta.env.VITE_API_URL;

  const makeRequest = async () => {
    return fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        ...options.headers,
      },
      credentials: "include", // refresh token cookie
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  };

  let res = await makeRequest();

  // 🔁 If access token expired, try silent refresh
  if (res.status === 401 && !endpoint.includes("/auth/refresh")) {
    if (!setAccessToken) throw new Error("Unauthorized and no token setter provided");

    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include", // refresh token in httpOnly cookie
      });

      if (!refreshRes.ok) throw new Error("Refresh failed");

      const data = await refreshRes.json();
      if (data.accessToken && setAccessToken) setAccessToken(data.accessToken);

      res = await makeRequest(); // retry original request
    } catch {
      throw new Error("Unauthorized");
    }
  }

  const contentType = res.headers.get("content-type");
  let data = null;
  if (contentType?.includes("application/json")) data = await res.json();

  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
};
