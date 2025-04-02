import React, { useState } from "react";
import { Check } from "lucide-react";
import { useUpdateEmployeeAgency } from "@/api/query-hooks/employee.hooks";
import { Employee, Agency } from "@/types/employee";
import { toast } from "@/hooks/use-toast";

interface CheckboxToggleProps {
  employee: Employee;
  checked: boolean;
  type: "invoiceReceived" | "paid";
}

export const AgencyCheckboxToggle: React.FC<CheckboxToggleProps> = ({
  employee,
  checked,
  type,
}) => {
  const [isChecked, setIsChecked] = useState(checked);
  const updateAgencyMutation = useUpdateEmployeeAgency();

  const handleToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (updateAgencyMutation.isPending || !employee.agency) return;

    const newCheckedState = !isChecked;
    try {
      // Optimistic update
      setIsChecked(newCheckedState);

      const agencyUpdatePayload: Partial<Agency> = {
        ...(employee.agency || {}),
        [type]: newCheckedState,
      };

      await updateAgencyMutation.mutateAsync({
        id: employee.id,
        data: agencyUpdatePayload,
      });
    } catch (error) {
      // Rollback on error
      setIsChecked(!newCheckedState);
      toast({
        title: "Update Failed",
        description: `Could not update ${employee.agency.name || "Agency"} ${type} status`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center">
      <button
        type="button"
        id={`${type}-${employee.id}`}
        onClick={handleToggle}
        disabled={updateAgencyMutation.isPending || !employee.agency}
        className={`
          w-6 h-6 rounded-md 
          ${
            updateAgencyMutation.isPending
              ? "cursor-wait opacity-50"
              : "cursor-pointer"
          }
          ${isChecked ? "bg-green-500" : "bg-gray-300"}
          flex items-center justify-center
        `}
      >
        {isChecked && <Check className="text-white" size={16} />}
      </button>
    </div>
  );
};
