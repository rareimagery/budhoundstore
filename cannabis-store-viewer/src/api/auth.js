import client from "./commerceClient";

const CLIENT_ID = process.env.REACT_APP_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.REACT_APP_OAUTH_CLIENT_SECRET || "";

export async function login(username, password) {
  const response = await client.post(
    "/oauth/token",
    new URLSearchParams({
      grant_type: "password",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username,
      password,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  localStorage.setItem("oauth_token", response.data.access_token);
  localStorage.setItem("oauth_refresh", response.data.refresh_token);
  return response.data;
}

export async function refreshToken() {
  const refresh = localStorage.getItem("oauth_refresh");
  if (!refresh) throw new Error("No refresh token stored.");

  const response = await client.post(
    "/oauth/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refresh,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  localStorage.setItem("oauth_token", response.data.access_token);
  localStorage.setItem("oauth_refresh", response.data.refresh_token);
  return response.data;
}

export function logout() {
  localStorage.removeItem("oauth_token");
  localStorage.removeItem("oauth_refresh");
  localStorage.removeItem("commerce_cart_token");
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("oauth_token"));
}
