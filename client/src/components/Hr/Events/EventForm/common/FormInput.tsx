import React from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldInputProps } from "formik";


export const FormInput = React.memo(
  ({
    name,
    label,
    placeholder,
    error,
    ...props
  }: {
    name: string;
    label?: string;
    placeholder?: string;
    error?: string | boolean;
  } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<string> }) => (
        <div>
          {label && (
            <label
              htmlFor={name}
              className="text-sm font-semibold text-gray-700 mb-1 block"
            >
              {label}
            </label>
          )}
          <Input
            id={name}
            placeholder={placeholder}
            {...field}
            {...props}
            className={`w-full bg-gray-100 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3 py-6 px-4 ${
              error ? "border-red-500" : ""
            }`}
          />
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
      )}
    </Field>
  )
);
FormInput.displayName = "FormInput";
