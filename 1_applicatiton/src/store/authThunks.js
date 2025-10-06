import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  login as apiLogin, 
  register as apiRegister, 
  logout as apiLogout,
  getCurrentUser,
  getAllUsers as apiGetAllUsers,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser
} from '../lib/api';
import { 
  setLoading, 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction 
} from './authSlice';

// Login thunk
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await apiLogin(credentials);
      
      if (response.success) {
        dispatch(loginSuccess(response.data.user));
        return response.data.user;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      dispatch(loginFailure(message));
      return rejectWithValue(message);
    }
  }
);

// Register thunk
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await apiRegister(userData);
      
      if (response.success) {
        dispatch(loginSuccess(response.data.user));
        return response.data.user;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      dispatch(loginFailure(message));
      return rejectWithValue(message);
    }
  }
);

// Logout thunk
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      dispatch(logoutAction());
    }
  }
);

// Get current user thunk
export const getCurrentUserThunk = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        return response.data.user;
      }
      throw new Error('Failed to get current user');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Admin actions
export const getAllUsers = createAsyncThunk(
  'users/getAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiGetAllUsers(params);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch users');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await apiUpdateUser(userId, userData);
      if (response.success) {
        return response.data.user;
      }
      throw new Error('Failed to update user');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiDeleteUser(userId);
      if (response.success) {
        return userId;
      }
      throw new Error('Failed to delete user');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);