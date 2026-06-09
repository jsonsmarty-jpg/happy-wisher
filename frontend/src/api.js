const BASE = import.meta.env.VITE_API_URL || "";

async function request(method, path, body, isFormData = false) {
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const api = {
  createWish: (formData) => request("POST",   "/api/wishes",        formData, true),
  getWish:    (code)     => request("GET",    `/api/wishes/${code}`),
  listWishes: (page = 1) => request("GET",    `/api/wishes?page=${page}&limit=12`),
  deleteWish: (code)     => request("DELETE", `/api/wishes/${code}`),
};
