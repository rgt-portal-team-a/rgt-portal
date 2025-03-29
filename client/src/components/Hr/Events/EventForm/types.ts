import { Employee } from "@/types/employee";
import { FormikProps, FieldInputProps } from "formik";
import { FormValues } from "@/hooks/useEventForm";


export interface IEventForm {
  formik: FormikProps<FormValues>;
  selectedFormType: string;
  selectedSpecialEventType: "1" | "2";
  setSelectedSpecialEventType: (eventType: "1" | "2") => void;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (employee: Employee | null) => void;
  users: Employee[];
}

export type EmployeePopoverProps = {
  field: FieldInputProps<string>;
  form: any;
  users: Employee[];
  index?: number;
  filterDuplicates?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};
