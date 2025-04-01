import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {User} from "@/types/authUser"

interface AuthState {
  currentUser: User | null | undefined;
}

const initialState: AuthState = {
  currentUser: undefined,
};

const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    SETCURRENTUSER: (state, action: PayloadAction<AuthState>) => {
      state.currentUser = action.payload.currentUser;
    },
    LOGIN: (state, action: PayloadAction<AuthState>) => {
      state.currentUser = action.payload.currentUser;
    },
    LOGOUT: (state) => {
      state.currentUser = null;
    },
  },
});

export const { LOGIN, LOGOUT, SETCURRENTUSER } = userSlice.actions;

export default userSlice.reducer;
