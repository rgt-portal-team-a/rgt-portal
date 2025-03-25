import React, { useState } from "react";
import { Check } from "lucide-react";
import {
  useUpdateEmployee
} from "@/api/query-hooks/employee.hooks";
import { Employee, UpdateEmployeeInterface } from "@/types/employee";
import { toast } from "@/hooks/use-toast";

interface TeamLeadToggleProps {
  employee: Employee;
  isJuniorTeamLead: boolean;
}

export const TeamLeadToggle: React.FC<TeamLeadToggleProps> = ({
  employee,
  isJuniorTeamLead,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const updateEmployeeMutation = useUpdateEmployee();

  const handleToggleTeamLead = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

    const updateData: UpdateEmployeeInterface = {
    ...(isJuniorTeamLead
        ? { isJuniorTeamLead: !employee.isJuniorTeamLead }
        : { isSeniorTeamLead: !employee.isSeniorTeamLead }),
    user: { id: employee?.user?.id || 0 },
    firstName: employee?.firstName || undefined,
    lastName: employee?.lastName || undefined,
    phone: employee?.phone || undefined,
    departmentId: employee?.departmentId || undefined,
    department: employee?.department || undefined,
    position: employee?.position || undefined,
    hireDate: employee?.hireDate || undefined,
    endDate: employee?.endDate || undefined,
    employeeType: employee?.employeeType || undefined,
    leaveType: employee?.leaveType || undefined,
    leaveExplanation: employee?.leaveExplanation || undefined,
    notes: employee?.notes || undefined,
    contactDetails: employee?.contactDetails || undefined,
    birthDate: employee?.birthDate || undefined,
    sickDaysBalance: employee?.sickDaysBalance || undefined,
    vacationDaysBalance: employee?.vacationDaysBalance || undefined,
    annualDaysOff: employee?.annualDaysOff || undefined,
    skills: employee?.skills || undefined,
    };


      // Perform mutation
      await updateEmployeeMutation.mutateAsync({
        id: employee.id,
        data: updateData,
      });

      toast({
        title: "Team Lead Status Updated",
        description: `${employee.firstName} ${employee.lastName}'s team lead status has been modified.`,
      });
    } catch (error) {
      console.error("Team Lead Update Error:", error);
      toast({
        title: "Update Failed",
        description: "Unable to update team lead status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleToggleTeamLead}
        disabled={isLoading}
        className={`
          w-6 h-6 rounded-md 
          ${isLoading ? "cursor-wait opacity-50" : "cursor-pointer"}
          ${
            isJuniorTeamLead
              ? employee.isJuniorTeamLead
                ? "bg-green-500"
                : "bg-gray-300"
              : employee.isSeniorTeamLead
              ? "bg-green-500"
              : "bg-gray-300"
          }
          flex items-center justify-center
        `}
      >
        {(isJuniorTeamLead
          ? employee.isJuniorTeamLead
          : employee.isSeniorTeamLead) && (
          <Check className="text-white" size={16} />
        )}
      </button>
    </div>
  );
};
