import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    return response.data;
  } catch (error) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    throw error.response?.data || error.message;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getUserProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/users', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id === userId && response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllDiaries = async () => {
  try {
    const response = await api.get('/diaries');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createDiary = async (diaryData) => {
  try {
    const response = await api.post('/diaries', diaryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateDiary = async (diaryId, diaryData) => {
  try {
    const response = await api.put(`/diaries/${diaryId}`, diaryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteDiary = async (diaryId) => {
  try {
    const response = await api.delete(`/diaries/${diaryId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPublicDiaries = async () => {
  try {
    const response = await api.get('/diaries/public');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserDiaries = async (userId) => {
  try {
    const response = await api.get(`/diaries/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const toggleLike = async (diaryId) => {
  try {
    const response = await api.post(`/diaries/${diaryId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addComment = async (diaryId, comment) => {
  try {
    const response = await api.post(`/diaries/${diaryId}/comment`, { comment });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

export const isAdmin = () => {
  const user = getStoredUser();
  return user?.role === 'admin';
};

export const isClient = () => {
  const user = getStoredUser();
  return user?.role === 'client';
};

export const getUserRole = () => {
  const user = getStoredUser();
  return user?.role || null;
};
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/user/profile', profileData);
    if (response.data.success && response.data.data) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/user/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deactivateAccount = async () => {
  try {
    const response = await api.post('/user/deactivate');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete('/user/delete');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getActivityHistory = async () => {
  try {
    const response = await api.get('/user/activity-history');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Search and Explore API functions
export const searchUsers = async (query) => {
  try {
    const response = await api.get('/explore/search', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserPublicDiaries = async (userId) => {
  try {
    const response = await api.get(`/explore/user/${userId}/public-diaries`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export default api;