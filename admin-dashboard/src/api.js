const BASE = import.meta.env.VITE_API_URL || "";

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const api = {
  getStatus:    ()                          => request("GET",  "/api/admin/status"),
  setup:        (password, confirmPassword) => request("POST", "/api/admin/setup", { password, confirmPassword }),
  login:        (password)                  => request("POST", "/api/admin/login", { spassword }),
  changePassword: (currentPassword, newPassword, confirmNewPassword, token) =>
    request("POST", "/api/admin/change-password", { currentPassword, newPassword, confirmNewPassword }, token),
  resetPassword: (masterKey, newPassword, confirmNewPassword) =>
    request("POST", "/api/admin/reset-password", { masterKey, newPassword, confirmNewPassword }),
  getStats:     (token)                     => request("GET",  "/api/admin/stats", null, token),
  getMedia:     (token)                     => request("GET",  "/api/admin/media", null, token),
  deleteMedia:  (giftId, token)             => request("DELETE", `/api/admin/media/${giftId}`, null, token),
  getFeedback:  (token)                     => request("GET",  "/api/admin/feedback", null, token),
};
