import { useState, useEffect, useCallback, useMemo } from "react";
import { GetCountries, GetState } from "react-country-state-city";
import { Country, State } from "react-country-state-city/dist/esm/types";
import {  EMPLOYEE_TYPES, ROLE_TYPES } from "@/constants";
import { Employee, LeaveType, EmployeeType, RoleType } from "@/types/employee";

export interface EmployeeFormInitialValues {
  department: {
    id: number;
    name: string;
  };
  personalEmail: string;
  phone: string;
  agencyName: string;
  skills: string[];
  employeeType: EmployeeType;
  roleId: RoleType;
  leaveType: LeaveType | null;
  hireDate: Date | null;
  endDate: Date | null;
  leaveExplanation: string;
  notes: string;
  homeAddress: string;
  city: string;
  stateId: number | null;
  countryId: number | null;
  birthDate: Date | null;
}

export const useEmployeeForm = (employee: Employee) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);

  // Memoized country fetching
  const fetchCountries = useCallback(async () => {
    try {
      const fetchedCountries = await GetCountries();
      setCountries(fetchedCountries);
      return fetchedCountries;
    } catch (error) {
      console.error("Failed to fetch countries", error);
      return [];
    }
  }, []);

  const fetchStates = useCallback(async (countryId: number) => {
    try {
      const fetchedStates = await GetState(countryId);
      setStates(fetchedStates);
      return fetchedStates;
    } catch (error) {
      console.error("Failed to fetch states", error);
      setStates([]);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    const setupCountryAndState = async () => {
      if (employee?.contactDetails?.country) {
        const fetchedCountries = await fetchCountries();

        // Find country by name
        const matchedCountry = fetchedCountries.find(
          (country) =>
            country.name.toLowerCase() ===
            employee.contactDetails?.country?.toLowerCase()
        );

        if (matchedCountry) {
          // Set selected country and fetch its states
          setSelectedCountry(matchedCountry.id);
          const fetchedStates = await fetchStates(matchedCountry.id);

          if (employee?.contactDetails?.region && fetchedStates.length > 0) {
            const matchedState = fetchedStates.find(
              (state) =>
                state.name.toLowerCase() ===
                employee.contactDetails?.region?.toLowerCase()
            );
            if (matchedState) {
              setSelectedState(matchedState.id);
            }
          }
        }

      }
    };

    setupCountryAndState();
  }, [employee, fetchCountries, fetchStates]);

  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
    }
  }, [selectedCountry, fetchStates]);

  const initialValues = useMemo((): EmployeeFormInitialValues => {


    return {
      department: {
        id: employee?.department?.id || 0,
        name: employee?.department?.name || "",
      },
      personalEmail: employee?.contactDetails?.personalEmail || "",
      phone: employee?.phone || "",
      agencyName: employee?.agency?.name || "",
      skills: employee?.skills || [],
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
      stateId: selectedState,
      countryId: selectedCountry,
      birthDate: employee?.birthDate || null,
    };
  }, [employee, countries]);

  return {
    countries,
    states,
    initialValues,
    selectedState,
    selectedCountry,
    setSelectedCountry,
  };
};
