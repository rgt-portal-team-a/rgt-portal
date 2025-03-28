import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldInputProps } from "formik";


export const FormTextarea = React.memo(
  ({
    name,
    label,
    placeholder,
    rows,
    error,
  }: {
    name: string;
    label: string;
    placeholder: string;
    rows: number;
    error?: string | boolean;
  }) => (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<string> }) => (
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            {label}
          </label>
          <Textarea
            {...field}
            placeholder={placeholder}
            rows={rows}
            className={`w-full h-[88px] bg-gray-100 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3 py-4 px-4 border rounded ${
              error ? "border-red-500" : ""
            }`}
          />
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
      )}
    </Field>
  )
);
FormTextarea.displayName = "FormTextarea";
