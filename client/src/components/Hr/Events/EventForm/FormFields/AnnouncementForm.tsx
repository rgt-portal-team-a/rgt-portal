import { Field } from "formik";
import { DatePicker } from "../common/DatePicker";
import { FormInput } from "../common/FormInput";
import { FormTextarea } from "../common/FormTextArea";
import { IEventForm } from "../types";
import { FieldInputProps } from "formik";


export const AnnouncementForm = ({ formik }: Pick<IEventForm, "formik">) => (
  <div className="space-y-4">
    <FormInput
      name="title"
      label="Title"
      placeholder="Enter announcement title"
    />

    <FormTextarea
      name="description"
      label="Description"
      placeholder="Enter announcement description"
      rows={4}
    />

    <Field name="date">
      {({ field, form }: { field: FieldInputProps<string>; form: any }) => (
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            Announcement Date
          </label>
          <DatePicker name="date" />
          {form.touched.date && form.errors.date && (
            <div className="text-red-500 text-sm mt-1">{form.errors.date}</div>
          )}
        </div>
      )}
    </Field>
  </div>
);
