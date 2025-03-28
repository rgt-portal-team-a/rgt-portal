import { Field } from "formik";
import { EmployeePopover } from "../common/EmployeePopover";
import { Employee } from "@/types/employee";
import { FieldInputProps } from "formik";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { FormInput } from "../common/FormInput";




export const RecognitionListItem = ({
  index,
  remove,
  form,
  users,
  employeePopoverStates,
  toggleEmployeePopover,
}: {
  index: number;
  remove: (index: number) => void;
  form: any;
  users: Employee[];
  employeePopoverStates: Record<number, boolean>;
  toggleEmployeePopover: (index: number, open?: boolean) => void;
}) => (
  <div className="space-y-4">
    <div className="flex gap-1 items-center">
      <Field name={`recognitionList.${index}.employeeId`}>
        {({ field }: { field: FieldInputProps<string> }) => (
          <EmployeePopover
            field={field}
            form={form}
            users={users}
            index={index}
            filterDuplicates
            isOpen={employeePopoverStates[index] || false}
            onOpenChange={(open) => toggleEmployeePopover(index, open)}
          />
        )}
      </Field>
      <FormInput
        name={`recognitionList.${index}.projectName`}
        placeholder="Name of project"
      />
      {form.values.recognitionList.length > 1 && (
        <Button
          type="button"
          variant="outline"
          onClick={() => remove(index)}
          className="text-red-500 hover:bg-white hover:text-red-700 py-6"
        >
          <Trash className="w-4 h-4" />
        </Button>
      )}
    </div>
  </div>
);
