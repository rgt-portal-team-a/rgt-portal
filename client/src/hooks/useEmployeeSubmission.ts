import {
    useUpdateEmployee,
    useEmployeeDetails,
} from "@/api/query-hooks/employee.hooks";
import { UpdateEmployeeInterface, Employee, EmployeeType, WorkType } from "@/types/employee";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { Country, State } from "react-country-state-city/dist/esm/types";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/api/errorHandler";
import { EMPLOYEE_TYPES, ROLE_TYPES, LEAVE_TYPES } from "@/constants";



enum LeaveType {
  QUIT = "quit",
  LAYOFF = "layoff",
  DISMISSED = "dismissed",
  OTHER = "other",
}


export const useEmployeeSubmission = (employeeId: number, employee: Employee, countries: Country[], states:State[]) => {
  const updateEmployeeMutation = useUpdateEmployee();
//   const { data: employeeData } = useEmployeeDetails(employeeId.toString());
    const { departments } = useSelector(
        (state: RootState) => state.sharedState
    );

  const handleSubmit = useCallback(
    async (values: any, { setSubmitting }: any) => {
      try {
        const selectedCountry = countries.find(c => c.id === values.countryId);
            
        const selectedState = states.find(s => s.id === values.stateId );
        
        // Transform form values to UpdateEmployeeInterface
        const updateEmployeeDto: UpdateEmployeeInterface = {
          user: { id: employee?.user?.id || 0 },
          firstName: values.firstName || employee?.firstName,
          lastName: values.lastName || employee?.lastName,
          phone: values.phone || employee?.phone,
          departmentId: values.department?.id || employee?.departmentId,
          department: values.department?.id
            ? departments.find(
                (department) => department.id === values.department?.id
              )
            : employee?.department,
          position: values.position || employee?.position,
          hireDate: values.hireDate || employee?.hireDate,
          endDate: values.endDate || employee?.endDate,
          employeeType: (() => {
            // Type guard to ensure correct type
            const type = values.employeeType || employee?.employeeType;
            return Object.values(EMPLOYEE_TYPES).includes(type as EmployeeType)
              ? (type as EmployeeType)
              : EMPLOYEE_TYPES.FULL_TIME;
          })(),
          roleId: employee?.user?.role?.id
            ? Number(employee.user.role.id)
            : Number(ROLE_TYPES.EMPLOYEE),
          leaveType: (() => {
            // Type guard to ensure correct type
            const type = values.leaveType || employee?.leaveType;
            return type &&
              Object.values(LEAVE_TYPES).includes(type as LeaveType)
              ? (type as LeaveType)
              : undefined;
          })(),
          leaveExplanation:
            values.leaveExplanation || employee?.leaveExplanation,
          notes: values.notes || employee?.notes,
          contactDetails:
            values.personalEmail ||
            values.homeAddress ||
            values.city ||
            values.stateId ||
            values.countryId
              ? {
                  personalEmail:
                    values.personalEmail ||
                    employee?.contactDetails?.personalEmail,
                  homeAddress:
                    values.homeAddress || employee?.contactDetails?.homeAddress,
                  country: selectedCountry?.name || "",
                  region: selectedState?.name || "",
                  city: values.city,
                }
              : employee?.contactDetails,
          birthDate: values.birthDate || employee?.birthDate,
          sickDaysBalance:
            employee?.sickDaysBalance || employee?.sickDaysBalance,
          vacationDaysBalance:
            employee?.vacationDaysBalance || employee?.vacationDaysBalance,
          annualDaysOff: employee?.annualDaysOff || employee?.annualDaysOff,
          skills: values?.skills || employee?.skills,
        };
    
        // Call the update mutation
        console.log("Update Employee DTO", updateEmployeeDto);
        await updateEmployeeMutation.mutateAsync({ id: employeeId, data: updateEmployeeDto });
        setSubmitting(false);

      } catch (error) {
        const errorMessage = getApiErrorMessage(error);
        toast({
          title: "Error Editing Employee",
          description: "Failed To Edit Employee" + errorMessage.message,
          variant: "destructive",
        });
        setSubmitting(false);
      }
      finally{
        setSubmitting(false);
      }
    },
    [employeeId, employee, updateEmployeeMutation]
  );
  

  return {
    handleSubmit,
    isSubmitting: updateEmployeeMutation.isPending,
  };
};
