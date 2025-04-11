import {
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
        const onboardEmployeeDto = {
          user: { id: userId },
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          departmentId: values.department?.id,
          hireDate: values.hireDate ? new Date(values.hireDate) : undefined,
          birthDate: values.birthDate ? new Date(values.birthDate) : undefined,
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
          }
        };

        // Prepare the request payload
        const requestPayload = {
          userId: Number(userId),
          employee: onboardEmployeeDto,
          roleId: values.roleId ? Number(values.roleId) : undefined
        };

        // Call the update mutation
        await onBoardingMutation.mutateAsync(requestPayload);
        setSubmitting(false);
      } catch (error) {
        const errorMessage = getApiErrorMessage(error);
        toastService.error("Failed To Onboard User: " + errorMessage.message);
        setSubmitting(false);
      }
    },
    [userId, newUser, onBoardingMutation, countries, states]
  );

  return {
    handleSubmit,
    isSubmitting: onBoardingMutation.isPending,
  };
};
