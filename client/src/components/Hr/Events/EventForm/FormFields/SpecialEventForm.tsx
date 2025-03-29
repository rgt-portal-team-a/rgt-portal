import { Field } from "formik";
import { DatePicker } from "../common/DatePicker";
import { FormInput } from "../common/FormInput";
import { EmployeePopover } from "../common/EmployeePopover";
import { SpecialEventTypeSelector } from "../common/SpecialEventTypeSelector";
import { IEventForm } from "../types";
import { FieldInputProps } from "formik";

interface SpecialEventFormProps
  extends Pick<
    IEventForm,
    | "formik"
    | "users"
    | "selectedSpecialEventType"
    | "setSelectedSpecialEventType"
  > {
  employeePopoverStates: Record<number, boolean>;
  toggleEmployeePopover: (index: number, isOpen?: boolean) => void;
}

export const SpecialEventForm = ({
  formik,
  users,
  selectedSpecialEventType,
  setSelectedSpecialEventType,
  employeePopoverStates,
  toggleEmployeePopover,
}: SpecialEventFormProps) => {
  const birthdayPopoverIndex = 0;

  return (
    <>
      <SpecialEventTypeSelector
        selectedType={selectedSpecialEventType}
        onSelect={setSelectedSpecialEventType}
      />

      <div className="space-y-4">
        {selectedSpecialEventType === "1" ? (
          // Holiday Form
          <>
            <FormInput
              name="holidayName"
              label="Holiday Name"
              placeholder="Enter the holiday name"
            />
            <DatePicker name="date" label="Pick the Date" />
          </>
        ) : (
          // Birthday Form
          <>
            <Field name="employeeId">
              {({ field }: { field: FieldInputProps<string> }) => (
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Employee
                  </label>
                  <EmployeePopover
                    field={field}
                    form={formik}
                    users={users}
                    isOpen={
                      employeePopoverStates[birthdayPopoverIndex] || false
                    }
                    onOpenChange={(open) =>
                      toggleEmployeePopover(birthdayPopoverIndex, open)
                    }
                  />
                </div>
              )}
            </Field>
            <DatePicker name="date" label="Birthday Date" />
          </>
        )}
      </div>
    </>
  );
};
