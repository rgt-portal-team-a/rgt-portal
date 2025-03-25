import { useState, useEffect } from "react";
import { GetCountries, GetState } from "react-country-state-city";
import { Country, State } from "react-country-state-city/dist/esm/types";
import { LEAVE_TYPES, EMPLOYEE_TYPES, ROLE_TYPES } from "@/constants";
import { Employee, LeaveType, EmployeeType, RoleType } from "@/types/employee";


interface EmployeeFormInitialValues {
  department: {
    id: number;
    name: string;
  };
  personalEmail: string;
  phone: string;
  employeeType: EmployeeType;
  roleId: RoleType;
  leaveType: LeaveType | null;
  hireDate: Date | null;
  endDate: Date | null;
  leaveExplanation: string;
  notes: string;
  homeAddress: string;
  city: string;
  stateId: string;
  countryId: number | null;
  birthDate: Date | null;
}



export const useEmployeeForm = (employee: Employee) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);


  // Fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const fetchedCountries = await GetCountries();
        setCountries(fetchedCountries);
      } catch (error) {
        console.error("Failed to fetch countries", error);
      }
    };
    fetchCountries();
  }, []);

  // Fetch States when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (selectedCountry) {
        try {
          const fetchedStates = await GetState(selectedCountry);
          setStates(fetchedStates);
        } catch (error) {
          console.error("Failed to fetch states", error);
          setStates([]);
        }
      }
    };
    fetchStates();
  }, [selectedCountry]);

    // Initial form values
    const initialValues: EmployeeFormInitialValues = {
      department: {
        id: employee?.department?.id || 0,
        name: employee?.department?.name || "",
      },
      personalEmail: employee?.contactDetails?.personalEmail || "",
      phone: employee?.phone || "",
      employeeType: (employee?.employeeType ||
        EMPLOYEE_TYPES.FULL_TIME) as EmployeeType,
      roleId: (employee?.user?.role?.id?.toString() ||
        ROLE_TYPES.EMPLOYEE) as RoleType,
      leaveType: (employee?.leaveType || null) as LeaveType | null,
      hireDate: employee?.hireDate || null,
      endDate: employee?.endDate || null,
      leaveExplanation: employee?.leaveExplanation || "",
      notes: employee?.notes || "",
      homeAddress: employee?.contactDetails?.homeAddress || "",
      city: employee?.contactDetails?.city || "",
      stateId: employee?.contactDetails?.region || "",
      countryId: employee?.contactDetails?.country
        ? Number(employee.contactDetails.country)
        : null,
      birthDate: employee?.birthDate || null,
    };

  return {
    countries,
    states,
    initialValues,
    setSelectedCountry,
  };
};
