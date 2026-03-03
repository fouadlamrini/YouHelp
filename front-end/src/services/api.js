import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
};

// —— Profile & Users ——
export const usersApi = {
  getMe: () => api.get("/users/me"),
  updateProfile: (data) => api.put("/users/me", data),
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// —— Request Role ——
export const requestRoleApi = {
  send: () => api.post("/requestRole/request-role"),
  getAll: () => api.get("/requestRole/role-requests"),
  reject: (requestId) => api.put(`/requestRole/role-requests/${requestId}/reject`),
  acceptFormateur: (requestId) => api.put(`/requestRole/role-requests/${requestId}/accept/formateur`),
  acceptEtudiant: (requestId) => api.put(`/requestRole/role-requests/${requestId}/accept/etudiant`),
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

// —— Post ——
export const postApi = {
  getAll: () => api.get("/post"),
  getById: (id) => api.get(`/post/${id}`),
  create: (formData) => api.post("/post", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) => api.put(`/post/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
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
  getAll: () => api.get("/knowledge"),
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
  send: (data) => api.post("/messages", data),
  getConversations: () => api.get("/messages/conversations"),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  delete: (id) => api.delete(`/messages/${id}`),
};

// —— Workshops ——
export const workshopsApi = {
  getAll: () => api.get("/workshops"),
  create: (data) => api.post("/workshops", data),
  request: (workshopId) => api.post(`/workshops/${workshopId}/request`),
  myRequests: () => api.get("/workshops/my-requests"),
};

// —— Class Join Request ——
export const classJoinRequestApi = {
  create: (data) => api.post("/class-join-request", data),
  getMyClassRequests: () => api.get("/class-join-request/my-class"),
  accept: (id) => api.put(`/class-join-request/${id}/accept`),
  reject: (id) => api.put(`/class-join-request/${id}/reject`),
};

export default api;
