import { useUpdateEmployee } from "@/api/query-hooks/employee.hooks";
import {
  UpdateEmployeeInterface,
  EmployeeType,
} from "@/types/employee";
import { useCallback } from "react";
import { Country, State } from "react-country-state-city/dist/esm/types";
import { getApiErrorMessage } from "@/api/errorHandler";
import { EMPLOYEE_TYPES } from "@/constants";
import { EmployeeOnboardingFormInitialValues } from "./useEmployeeOnboardingForm";
import { FormikHelpers } from "formik";
import toastService from "@/api/services/toast.service";
import { User } from "@/types/authUser";
import { toast } from "./use-toast";
import {useOnboardUser} from "@/api/query-hooks/onboarding.hooks"


export const useEmployeeOnboardingSubmission = (
  userId: number|undefined,
  newUser: User|null,
  countries: Country[],
  states: State[]
) => {
  const updateEmployeeMutation = useUpdateEmployee();
  const onBoardingMutation = useOnboardUser();

  const handleSubmit = useCallback(
    async (
      values: EmployeeOnboardingFormInitialValues,
      { setSubmitting }: FormikHelpers<EmployeeOnboardingFormInitialValues>
    ) => {
      try {
        if (!userId || !newUser) {
          toast({
            title: "Error",
            description: "No User Selected",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }

        const selectedCountry = countries.find((c) => {
          const countryId = Number(values.countryId);
          return !isNaN(countryId) && c.id === countryId;
        });

        const selectedState = states.find((s) => s.id === values.stateId);

        // Transform form values to UpdateEmployeeInterface
        const onboardEmployeeDto: UpdateEmployeeInterface = {
          user: { id: userId },
          firstName: values.firstName ,
          lastName: values.lastName ,
          phone: values.phone,
          departmentId: values.department?.id,
          hireDate: values.hireDate,
          employeeType: (() => {
            const type = values.employeeType;
            return Object.values(EMPLOYEE_TYPES).includes(type as EmployeeType)
              ? (type as EmployeeType)
              : EMPLOYEE_TYPES.FULL_TIME;
          })(),
          contactDetails: {
            personalEmail: values.personalEmail,
            homeAddress: values.homeAddress,
            country: selectedCountry?.name || "",
            region: selectedState?.name || "",
            city: values.city,
          },
          birthDate: values.birthDate,
          // roleId: Number(values.roleId),
        };

        // Call the update mutation
        console.log(" Onboard DTO", {
          userId: userId,
          employee: onboardEmployeeDto,
          roleId: Number(values.roleId)
        });
        await onBoardingMutation.mutateAsync({
          userId: userId,
          employee: onboardEmployeeDto,
          roleId: Number(values.roleId),
        });
        setSubmitting(false);
      } catch (error) {
        const errorMessage = getApiErrorMessage(error);
        toastService.error("Failed To Onboard User" + errorMessage.message);
        setSubmitting(false);
      } finally {
        setSubmitting(false);
      }
    },
    [userId, newUser, updateEmployeeMutation]
  );

  return {
    handleSubmit,
    isSubmitting: updateEmployeeMutation.isPending,
  };
};
