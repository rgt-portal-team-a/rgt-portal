import * as Yup from "yup";
import {
  EMPLOYEE_TYPES,
  LEAVE_TYPES,
  ROLE_TYPES,
} from "@/constants";
import { useMemo } from "react";

export const useEmployeeValidation = () => {
const validationSchema = Yup.object().shape({
  department: Yup.object().shape({
    id: Yup.number().required("Department is required"),
  }).nullable(),
  personalEmail: Yup.string().email("Invalid email address").nullable(),
  phone: Yup.string().max(10, "Cannot Exceed 10 digits").nullable(),
  agencyName: Yup.string().min(3, "Minimum of 3 characters required").max(120, "Cannot Exceed 120 characters").nullable(),
  skills: Yup.array().of(Yup.string().trim()).nullable(),
  hireDate: Yup.date().nullable(),
  employeeType: Yup.string()
    .oneOf(Object.values(EMPLOYEE_TYPES), "Invalid employee type").nullable(),
  roleId: Yup.string()
    .oneOf(Object.values(ROLE_TYPES), "Invalid role type").nullable(),
    endDate: Yup.date()
    .nullable()
    .when("leaveType", {
      is: (val: string) => val && val !== "",
      then: (schema) =>
        schema.required("End date is required when leave type is selected"),
    }),
  leaveType: Yup.string()
    .oneOf(Object.values(LEAVE_TYPES), "Invalid leave type")
    .nullable(),
  leaveExplanation: Yup.string().when("leaveType", {
    is: (val: string) => val && val !== "",
    then: (schema) =>
      schema.required("Explanation is required when leave reason is provided"),
    otherwise: (schema) => schema.nullable(),
  }),
  notes: Yup.string().nullable(),
  homeAddress: Yup.string().nullable(),
  countryId: Yup.number().nullable(),
  stateId: Yup.number().nullable(),
  city: Yup.string().nullable(),
  birthDate: Yup.date().nullable(),
});



const onboardingValidationSchema = useMemo(() => 
    Yup.object().shape({
      department: Yup.object().shape({
        id: Yup.number().required('Department is required'),
        name: Yup.string()
      }),
      personalEmail: Yup.string()
        .email('Invalid email'),
      firstName: Yup.string()
        .required('First Name Is Required'),
      lastName: Yup.string()
        .required('Last Name Is Required '),
      phone: Yup.string()
        .matches(/^[0-9]+$/, 'Must be only digits'),
      employeeType: Yup.string()
        .oneOf(Object.values(EMPLOYEE_TYPES), 'Invalid employee type')
        .required('Employee type is required'),
      roleId: Yup.string()
        .oneOf(Object.values(ROLE_TYPES), 'Invalid role type')
        .required('Role is required'),
      hireDate: Yup.date().required('Start date is required'),
      homeAddress: Yup.string(),
      city: Yup.string(),
      stateId: Yup.number().nullable(),
      countryId: Yup.number().nullable(),
      birthDate: Yup.date().nullable()
    }), [])


  return { validationSchema, onboardingValidationSchema };
};
