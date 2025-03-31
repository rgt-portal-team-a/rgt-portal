import { Department } from "@/types/department";
import { Employee } from "@/types/employee"
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SharedDataState {
  departments: Department[];
  employees: Employee[];
}

const initialState: SharedDataState = {
  departments: [],
  employees: [],
};

const sharedDataSlice = createSlice({
  name: "sharedData",
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload;
    },
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
  },
});

export const { setDepartments, setEmployees } = sharedDataSlice.actions;
export default sharedDataSlice.reducer;
