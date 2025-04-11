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
        validator = Yup.mixed().nullable();
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

export async function checkThirdPartyCookies(): Promise<boolean> {
  const apiUrl =
    import.meta.env.VITE_NODE_ENV === "development"
      ? import.meta.env.VITE_DEV_BASE_URL
      : import.meta.env.VITE_BASE_URL;
  
  try {
    const response = await fetch(`${apiUrl}/test-cookie`, {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ test: "cookie" }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    return result.hasCookie || false;
  } catch (error) {
    console.error("Third-party cookies might be blocked:", error);
    return false;
  }
}

export function setBannerDismissed(dismissed: boolean): void {
  localStorage.setItem("cookieBannerDismissed", String(dismissed));
}

export function getBannerDismissed(): boolean {
  return localStorage.getItem("cookieBannerDismissed") === "true";
}