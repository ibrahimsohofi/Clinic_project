import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { demoCredentials } from '../services/mockData';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER: 'LOAD_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// API base URL
const API_URL = 'http://localhost:4000/api';

// Set up axios defaults
axios.defaults.baseURL = API_URL;

// Add token to requests if available
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Load user from token
  const loadUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER,
        payload: res.data.data
      });
    } catch (error) {
      console.log('API unavailable, checking for demo session');

      // Check for demo token
      const token = localStorage.getItem('token');
      if (token && token.startsWith('demo-token-')) {
        const role = token.replace('demo-token-', '');
        const demo = Object.values(demoCredentials).find(cred => cred.user.role === role);

        if (demo) {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: demo.user
          });
          return;
        }
      }

      localStorage.removeItem('token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Login
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const res = await axios.post('/auth/login', { email, password });

      // Store token
      localStorage.setItem('token', res.data.token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: res.data
      });

      return { success: true, data: res.data };
    } catch (error) {
      console.log('API unavailable, using demo authentication');

      // Fallback to mock authentication for demo purposes
      const demo = Object.values(demoCredentials).find(
        cred => cred.email === email && cred.password === password
      );

      if (demo) {
        // Store mock token
        localStorage.setItem('token', 'demo-token-' + demo.user.role);

        const mockResponse = {
          success: true,
          token: 'demo-token-' + demo.user.role,
          data: demo.user
        };

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: mockResponse
        });

        return { success: true, data: mockResponse };
      } else {
        const errorMessage = 'Invalid credentials. Try demo credentials from the login page.';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: errorMessage
        });
        return { success: false, error: errorMessage };
      }
    }
  };

  // Register
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const res = await axios.post('/auth/register', userData);

      // Store token
      localStorage.setItem('token', res.data.token);

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: res.data
      });

      return { success: true, data: res.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await axios.put('/auth/updatedetails', userData);
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER,
        payload: res.data.data
      });
      return { success: true, data: res.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await axios.put('/auth/updatepassword', {
        currentPassword,
        newPassword
      });
      return { success: true, data: res.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user is staff or admin
  const isStaffOrAdmin = () => {
    return state.user?.role === 'staff' || state.user?.role === 'admin';
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    loadUser,
    updateProfile,
    changePassword,
    clearError,
    hasRole,
    isStaffOrAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
