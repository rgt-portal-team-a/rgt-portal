import { Field, FieldArray } from "formik";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecognitionListItem } from "./RecognitionListItem";
import { IEventForm } from "../types";
import { FormInput } from "../common/FormInput";
import {  FieldInputProps } from "formik";



interface RecognitionFormProps extends IEventForm {
  employeePopoverStates: Record<number, boolean>;
  toggleEmployeePopover: (index: number, isOpen?: boolean) => void;
}

export const RecognitionForm = ({
  formik,
  users,
  employeePopoverStates,
  toggleEmployeePopover,
}: RecognitionFormProps) => (
  <>
    <Field name="title">
      {({ field, form: { touched, errors } }:
        {
            field: FieldInputProps<string>;
            form: any;
        }) => (
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            Recognition Title
          </label>
          <FormInput
            {...field}
            placeholder="Dedicated...Let's Lock In"
            error={touched.title && errors.title}
          />
        </div>
      )}
    </Field>

    <FieldArray name="recognitionList">
      {({ remove, push, form }) => (
        <div className="space-y-4">
          {(form.values.recognitionList || []).map((_: any, index: number) => (
            <RecognitionListItem
              key={index}
              index={index}
              remove={() => remove(index)}
              form={form}
              users={users}
              employeePopoverStates={employeePopoverStates}
              toggleEmployeePopover={toggleEmployeePopover}
            />
          ))}

          <Button
            type="button"
            variant="link"
            onClick={() => push({ employeeId: "", projectName: "" })}
            className="text-purple-500 text-sm py-2 items-center justify-start hover:underline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another
          </Button>
        </div>
      )}
    </FieldArray>
  </>
);
