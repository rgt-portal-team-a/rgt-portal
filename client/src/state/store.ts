import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authState/authSlice"
import sharedDataReducer from "./sharedDataState/sharedDataSlice"


export const Store = configureStore({
    reducer: {
        authState: authReducer,
        sharedState: sharedDataReducer,
    }
})

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
