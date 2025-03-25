import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as Yup from "yup";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const buildValidationSchema = (fields: FormField[]) => {
  const schemaFields: { [key: string]: any } = {};

  fields.forEach((field) => {
    let validator = Yup.string();

    if (field.required) {
      validator = validator.required(`${field.label} is required`);
    }

    if (field.type === "email") {
      validator = validator.email("Invalid email format");
    }

    schemaFields[field.name] = validator;
  });

  return Yup.object(schemaFields);
};

export const buildInitialValues = (fields: FormField[]) => {
  const initialValues: RecruitmentFormValues = {};

  fields.forEach((field) => {
    if (field.type === "select" && field.options && field.options.length > 0) {
      initialValues[field.name] = field.options[0];
    } else {
      initialValues[field.name] = "";
    }
  });

  return initialValues;
};