/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo } from "react";
import { GetCountries, GetState } from "react-country-state-city";
import { Country, State } from "react-country-state-city/dist/esm/types";
import { EMPLOYEE_TYPES, ROLE_TYPES } from "@/constants";
import { EmployeeType, RoleType } from "@/types/employee";
import { User } from "@/types/authUser";

export interface EmployeeOnboardingFormInitialValues {
  department: {
    id: number | null;
    name: string;
  };
  personalEmail: string;
  firstName: string;
  lastName: string;
  phone: string;
  employeeType: EmployeeType | null;
  roleId: RoleType | null;
  hireDate: Date | null;
  homeAddress: string;
  city: string;
  stateId: number | null;
  countryId: number | null;
  birthDate: Date | null;
}

export const useEmployeeOnboardingForm = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
//   const [selectedState, setSelectedState] = useState<number | null>(null);

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
    if (selectedCountry) {
      fetchStates(selectedCountry);
    }
  }, [selectedCountry, fetchStates]);

  const initialValues = useMemo((): EmployeeOnboardingFormInitialValues => {
    return {
      department: {
        id: null,
        name: "",
      },
      firstName: "",
      lastName:"",
      personalEmail: "",
      phone: "",
      employeeType: null,
      roleId: null,
      hireDate: null,
      homeAddress:  "",
      city: "",
      stateId: null,
      countryId: null,
      birthDate: null,
    };
  }, []);

  return {
    countries,
    selectedCountry,
    setSelectedCountry,
    states,
    initialValues
  };
};
