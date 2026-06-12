import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

const savedUser = localStorage.getItem('auth_user');
const savedRole = localStorage.getItem('auth_role');
const savedIsAuthenticated = localStorage.getItem('auth_isAuthenticated') === 'true';

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  role: savedRole || null,
  isAuthenticated: savedIsAuthenticated || false,
  loading: false,
  error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data; // { success, token, user: { id, role, ... } }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Used by demo login flow (fake timeout, no real API call)
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // Used by demo login flow to set user/role after fake auth
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;

      // Store a placeholder token so axiosClient attaches Authorization header
      // Real API calls will 401 since this isn't a real JWT, but it prevents
      // the 'no token' 401 path and allows graceful error handling
      localStorage.setItem('auth_token', action.payload.token || 'demo_token');
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      localStorage.setItem('auth_role', action.payload.role);
      localStorage.setItem('auth_isAuthenticated', 'true');
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_role');
      localStorage.removeItem('auth_isAuthenticated');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        
        localStorage.setItem('auth_token', action.payload.token);
        localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
        localStorage.setItem('auth_role', action.payload.user.role);
        localStorage.setItem('auth_isAuthenticated', 'true');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { loginStart, loginSuccess, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
