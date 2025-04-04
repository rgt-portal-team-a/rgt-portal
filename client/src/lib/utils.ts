import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Yup from "yup";
import { FormField } from "@/types/recruitment";

type ValidationSchema = Record<string, Yup.AnySchema>;
type FormValues = Record<string, string | number | File | string[] | null>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buildValidationSchema = (fields: FormField[]) => {
  const schemaFields: ValidationSchema = {};

  fields.forEach((field) => {
    let validator: Yup.AnySchema;

    switch (field.type) {
      case "email":
        validator = Yup.string().email("Invalid email address");
        break;
      case "tel":
        validator = Yup.string().matches(/^\+?[\d\s-]+$/, "Invalid phone number");
        break;
      case "number":
        validator = Yup.number().nullable();
        break;
      case "multiSelect":
        validator = Yup.array().of(Yup.string()).nullable();
        break;
      case "file":
        validator = Yup.mixed();
        break;
      default:
        validator = Yup.string().nullable();
    }

    if (field.required) {
      validator = validator.required(`${field.label} is required`);
    }

    schemaFields[field.name] = validator;
  });

  return Yup.object().shape(schemaFields);
};

export const buildInitialValues = (fields: FormField[]) => {
  const initialValues: FormValues = {};

  fields.forEach((field) => {
    switch (field.type) {
      case "multiSelect":
        initialValues[field.name] = [];
        break;
      case "number":
        initialValues[field.name] = null;
        break;
      case "file":
        initialValues[field.name] = null;
        break;
      default:
        initialValues[field.name] = "";
    }
  });

  return initialValues;
};