import {createSlice, type PayloadAction, createSelector} from '@reduxjs/toolkit';
import { UserDto } from '@/shared/types/domain';
import type { RootState } from '../store/store';

interface AuthState {
  user: UserDto | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean // Add this to track initialization
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading during initialization
  isInitialized: false, // Track if we've attempted to restore auth
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<UserDto>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.isInitialized = true
    },
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.isInitialized = true // We've completed the auth check
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload
      if (action.payload) {
        state.isLoading = false
      }
    },
  },
})

// Selectors
export const selectAuth = (state: RootState) => state.auth
export const selectUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectIsLoading = (state: RootState) => state.auth.isLoading
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized

// Memoized selectors
export const selectUserInfo = createSelector(
  [selectUser, selectIsAuthenticated, selectIsLoading, selectIsInitialized],
  (user, isAuthenticated, isLoading, isInitialized) => ({
    user,
    isAuthenticated,
    isLoading,
    isInitialized
  })
)

export const { setAuth, clearAuth, setLoading, setInitialized } = authSlice.actions
export default authSlice.reducer 