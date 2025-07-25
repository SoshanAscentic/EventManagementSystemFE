import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

interface User {
  createdAt: string | number | Date;
  roles: any;
  id: number
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  roles: string[]
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  roles: [],
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; roles: string[] }>) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.roles = action.payload.roles
    },
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.roles = []
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
