import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        type: action.payload.type || 'info', // success, error, warning, info
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        createdAt: Date.now(),
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearAllToasts } = toastSlice.actions;

// Helper action creators
export const showSuccessToast = (message, duration) => 
  addToast({ type: 'success', message, duration });

export const showErrorToast = (message, duration) => 
  addToast({ type: 'error', message, duration });

export const showWarningToast = (message, duration) => 
  addToast({ type: 'warning', message, duration });

export const showInfoToast = (message, duration) => 
  addToast({ type: 'info', message, duration });

export const selectToasts = (state) => state.toast.toasts;

export default toastSlice.reducer;