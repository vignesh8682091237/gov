import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({ baseURL: API_BASE_URL });

// Attach the admin JWT (if present) to every request. Token lives in
// memory + sessionStorage only — never in a long-lived cookie, and never
// used for the public tracking/consent endpoints.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      sessionStorage.removeItem("admin_token");
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (username, password) =>
    api.post("/api/auth/login", { username, password }),
  logout: () => api.post("/api/admin/logout"),
  me: () => api.get("/api/admin/me"),
};

export const linksApi = {
  create: (payload) => api.post("/api/links", payload),
  list: () => api.get("/api/links"),
  get: (id) => api.get(`/api/links/${id}`),
  update: (id, payload) => api.patch(`/api/links/${id}`, payload),
  remove: (id) => api.delete(`/api/links/${id}`),
  statistics: (id) => api.get(`/api/links/${id}/statistics`),
};

export const trackingApi = {
  resolve: (code) => api.get(`/api/tracking/${code}`),
  consent: (code, payload) => api.post(`/api/tracking/${code}/consent`, payload),
  submitDetails: (code, payload) => api.post(`/api/tracking/${code}/details`, payload),
};

export const dashboardApi = {
  statistics: () => api.get("/api/dashboard/statistics"),
};

export const visitorsApi = {
  list: (params) => api.get("/api/visitors", { params }),
  details: (sessionId) => api.get(`/api/visitors/${sessionId}/details`),
};

export const auditApi = {
  list: (params) => api.get("/api/audit", { params }),
};

export const registrationsApi = {
  create: (payload) => api.post("/api/registrations", payload),
  list: (params) => api.get("/api/registrations", { params }),
  exportCsv: () => api.get("/api/registrations/export", { responseType: "blob" }),
  remove: (id) => api.delete(`/api/registrations/${id}`),
};

export default api;

