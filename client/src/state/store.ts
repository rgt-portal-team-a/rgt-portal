import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authState/authSlice"


export const Store = configureStore({
    reducer: {
        authState: authReducer,
    }
})

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
