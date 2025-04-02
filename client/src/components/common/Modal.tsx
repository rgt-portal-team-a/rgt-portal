/* eslint-disable @typescript-eslint/no-explicit-any */

import { ClassNameValue } from "tailwind-merge";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import {
  Form as FormikForm,
  Formik,
  FormikHelpers,
  FormikValues,
  FormikProps,
} from "formik";
import { Loader } from "lucide-react";

interface ISideFormModal<T extends FormikValues> {
  title: string;
  validationSchema?: Yup.ObjectSchema<any, Yup.AnyObject, any, "">;
  initialFormValues: T;
  buttonClassName?: ClassNameValue;
  formClassName?: string;
  children:
    | React.ReactNode
    | ((formikProps: FormikProps<T>) => React.ReactNode);
  onSubmit?: (values: T, formikHelpers: FormikHelpers<T>) => void;
  submitBtnText?: string;
  isSubmitting?: boolean;
  back?: boolean;
  backFn?: () => void;
}

export const SideFormModal = <T extends FormikValues>({
  title,
  children,
  initialFormValues,
  validationSchema,
  // buttonClassName,
  formClassName,
  onSubmit,
  submitBtnText = "Create",
  isSubmitting,
  back,
  backFn,
}: ISideFormModal<T>) => {
  return (
    <div
      className="fixed inset-0  backdrop-blur-xs  flex items-start justify-end"
      style={{
        zIndex: 1010,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      {back && (
        <div className="relative h-screen flex flex-col justify-center p-5">
          <img
            src="/Down 2.svg"
            className="-rotate-90 bg-white p-2 rounded-full shadow-neutral-400 shadow-lg top-10 border hover:bg-slate-100 transition-all duration-300 ease-in cursor-pointer"
            onClick={backFn}
          />
        </div>
      )}
      <div className="bg-white shadow-lg  max-w-md w-full p-6 h-screen flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-[#706D8A]">{title}</h2>

        <Formik
          initialValues={initialFormValues ?? {}}
          validationSchema={validationSchema}
          onSubmit={(values, helpers) => {
            if (onSubmit) onSubmit(values as T, helpers as FormikHelpers<T>);
          }}
        >
          {(formikProps) => (
            <FormikForm className="flex flex-col justify-start h-full">
              {/* Form fields container */}
              <div className={`flex-grow ${formClassName}`}>
                {typeof children === "function"
                  ? children(formikProps)
                  : children}
              </div>
              {submitBtnText && (
                <div className=" flex w-full mt-4 h-14 gap-[20px]">
                  <Button
                    type="button"
                    onClick={backFn}
                    key={"Cancel"}
                    variant="outline"
                    className="w-1/2 h-full rounded-[12px] border-red-500 text-red-500 hover:bg-red-100 cursor-pointer"
                  >
                    Cancel
                  </Button>

                  {/* Create Button */}
                  <Button
                    type={"submit"}
                    key={"Create"}
                    disabled={
                      formikProps.isSubmitting || isSubmitting || !formikProps.isValid
                    }
                    className={`w-1/2 h-full rounded-[12px] bg-rgtpink  text-white cursor-pointer
                    ${isSubmitting ? "opacity-45" : "hover:bg-pink-500"}`}
                  >
                    {isSubmitting ? (
                      <Loader className="animate-spin" size={20} />
                    ) : (
                      submitBtnText
                    )}
                  </Button>
                </div>
              )}
            </FormikForm>
          )}
        </Formik>
      </div>
    </div>
  );
};
