import { Department } from "@/types/department";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SharedDataState {
  departments: Department[];
}

const initialState: SharedDataState = {
  departments: [],
};

const sharedDataSlice = createSlice({
  name: "sharedData",
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload;
    },
  },
});

export const { setDepartments } = sharedDataSlice.actions;
export default sharedDataSlice.reducer;
