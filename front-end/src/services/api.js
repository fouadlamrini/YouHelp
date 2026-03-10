import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (e) => Promise.reject(e)
);

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(e);
  }
);

// —— Auth ——
export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  changePassword: (data) => api.post("/auth/change-password", data),
  getCompleteProfileOptions: () => api.get("/auth/complete-profile-options"),
  completeProfile: (data) => api.put("/auth/complete-profile", data),
};

// —— Profile & Users ——
export const usersApi = {
  getMe: () => api.get("/users/me"),
  updateProfile: (data) => api.put("/users/me", data),
  deleteMe: () => api.delete("/users/me"),
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  acceptUser: (id) => api.put(`/users/${id}/accept`),
  rejectUser: (id) => api.put(`/users/${id}/reject`),
};

// —— Avatars (built-in + upload) ——
export const avatarsApi = {
  getAll: () => api.get("/avatars"),
  upload: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/avatars/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// —— Roles (for super_admin / admin / formateur dropdowns) ——
export const rolesApi = {
  getAll: () => api.get("/roles"),
};

// —— Stats (super_admin / admin / formateur) ——
export const statsApi = {
  get: () => api.get("/stats"),
};

// —— Public stats (landing page, no auth required) ——
export const publicStatsApi = {
  get: () => api.get("/public-stats"),
};

// —— Notifications ——
export const notificationsApi = {
  getMine: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
};

// —— Campus (super_admin) ——
export const campusApi = {
  getAll: () => api.get("/campus"),
  getById: (id) => api.get(`/campus/${id}`),
  create: (data) => api.post("/campus", data),
  update: (id, data) => api.put(`/campus/${id}`, data),
  delete: (id) => api.delete(`/campus/${id}`),
};

// —— Class (super_admin) ——
export const classApi = {
  getAll: () => api.get("/class"),
  getById: (id) => api.get(`/class/${id}`),
  create: (data) => api.post("/class", data),
  update: (id, data) => api.put(`/class/${id}`, data),
  delete: (id) => api.delete(`/class/${id}`),
};

// —— Level (super_admin) ——
export const levelApi = {
  getAll: () => api.get("/level"),
  getById: (id) => api.get(`/level/${id}`),
  create: (data) => api.post("/level", data),
  update: (id, data) => api.put(`/level/${id}`, data),
  delete: (id) => api.delete(`/level/${id}`),
};

// —— Category ——
export const categoryApi = {
  getAll: () => api.get("/category"),
  create: (data) => api.post("/category", data),
  update: (id, data) => api.put(`/category/${id}`, data),
  delete: (id) => api.delete(`/category/${id}`),
};

// —— Subcategory ——
export const subcategoryApi = {
  getAll: () => api.get("/subcategory"),
  getByCategory: (categoryId) => api.get(`/subcategory/category/${categoryId}`),
  create: (data) => api.post("/subcategory", data),
  update: (id, data) => api.put(`/subcategory/${id}`, data),
  delete: (id) => api.delete(`/subcategory/${id}`),
};

// Alias with different casing for backward compatibility
export const subCategoryApi = subcategoryApi;

// —— Post ——
export const postApi = {
  getAll: (params) => api.get("/post", { params }),
  getById: (id, params) => api.get(`/post/${id}`, { params }),
  getMyShares: () => api.get("/post/shares/mine"),
  deleteShare: (shareId) => api.delete(`/post/share/${shareId}`),
  toggleSolved: (id, data) => api.patch(`/post/${id}/solved`, data),
  create: (formData) => api.post("/post", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, data) =>
    data instanceof FormData
      ? api.put(`/post/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } })
      : api.put(`/post/${id}`, data),
  delete: (id) => api.delete(`/post/${id}`),
  reaction: (id) => api.post(`/post/${id}/reaction`),
  share: (id) => api.post(`/post/${id}/share`),
};

// —— Comment (post) ——
export const commentApi = {
  getByPost: (postId) => api.get(`/comment/post/${postId}`),
  createOnPost: (postId, data, formData) =>
    formData
      ? api.post(`/comment/post/${postId}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      : api.post(`/comment/post/${postId}`, data),
  like: (id) => api.post(`/comment/${id}/like`),
  update: (id, data, formData) =>
    formData
      ? api.put(`/comment/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      : api.put(`/comment/${id}`, data),
  delete: (id) => api.delete(`/comment/${id}`),
};

// —— Comment (knowledge) ——
export const knowledgeCommentApi = {
  getByKnowledge: (knowledgeId) => api.get(`/knowledge/${knowledgeId}/comments`),
  create: (knowledgeId, data, formData) =>
    formData
      ? api.post(`/knowledge/${knowledgeId}/comments`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      : api.post(`/knowledge/${knowledgeId}/comments`, data),
};

// —— Solution ——
export const solutionApi = {
  getAll: () => api.get("/solution"),
  getByPost: (postId) => api.get(`/solution/${postId}`),
  markSolved: (postId, data) => api.post(`/solution/${postId}/mark-solved`, data),
  updateDescription: (postId, data) => api.put(`/solution/${postId}/update-description`, data),
  unmarkSolved: (postId) => api.delete(`/solution/${postId}/unmark-solved`),
};

// —— Knowledge ——
export const knowledgeApi = {
  getAll: (params) => api.get("/knowledge", { params }),
  getById: (id) => api.get(`/knowledge/${id}`),
  create: (formData) => api.post("/knowledge", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) => api.put(`/knowledge/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id) => api.delete(`/knowledge/${id}`),
  reaction: (id) => api.post(`/knowledge/${id}/reaction`),
  share: (id) => api.post(`/knowledge/${id}/share`),
};

// —— Favorites ——
export const favoritesApi = {
  getMine: (params) => api.get("/favorites", { params }),
  add: (data) => api.post("/favorites", data),
  remove: (data) => api.delete("/favorites", { data }),
  check: (contentType, contentId) => api.get(`/favorites/check/${contentType}/${contentId}`),
};

// —— Messages ——
export const messagesApi = {
  send: (data) => {
    if (data instanceof FormData) {
      return api.post("/messages", data);
    }
    return api.post("/messages", data);
  },
  getConversations: () => api.get("/messages/conversations"),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  delete: (id, scope) =>
    api.delete(`/messages/${id}`, scope ? { params: { scope } } : undefined),
  reaction: (id, emoji) => api.post(`/messages/${id}/reaction`, { emoji }),
};

export const API_BASE = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, "") : "http://localhost:3000";

// —— Workshops ——
export const workshopsApi = {
  getAll: () => api.get("/workshops"),
  create: (data) => api.post("/workshops", data),
  request: (workshopId) => api.post(`/workshops/${workshopId}/request`),
  myRequests: () => api.get("/workshops/my-requests"),
  requestFromPost: (postId) => api.post("/workshops/request-from-post", { postId }),
  pendingForFormateur: () => api.get("/workshops/requests/pending"),
  acceptRequest: (id, data) => api.patch(`/workshops/requests/${id}/accept`, data),
  rejectRequest: (id) => api.patch(`/workshops/requests/${id}/reject`),
  myWorkshops: () => api.get("/workshops/my-workshops"),
};

// —— Friends ——
export const friendsApi = {
  list: () => api.get("/friends"),
  add: (userId) => api.post("/friends", { userId }),
  remove: (userId) => api.delete(`/friends/${userId}`),
};

// —— Friend requests (invitations) ——
export const friendRequestsApi = {
  getReceived: () => api.get("/friend-requests/received"),
  getSent: () => api.get("/friend-requests/sent"),
  getAvailableUsers: () => api.get("/friend-requests/available-users"),
  send: (toUserId) => api.post("/friend-requests", { toUserId }),
  accept: (id) => api.put(`/friend-requests/${id}/accept`),
  reject: (id) => api.put(`/friend-requests/${id}/reject`),
  cancel: (id) => api.delete(`/friend-requests/${id}/cancel`),
};

export default api;
