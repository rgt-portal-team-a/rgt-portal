import { SideFormModal } from "@/components/common/Modal";
// import EventForm from "./EventForm";
import {EventForm} from "./EventForm/EventForm";
import { useEventForm, formTypes } from "@/hooks/useEventForm";
import { Field, FieldProps } from "formik";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useEffect} from "react"

interface IEventModal {
  isOpen?: boolean;
  onClose: () => void;
  selectedAction?: string;
  title?: string;
}

export const EventModal = ({ onClose, selectedAction, title }: IEventModal) => {
  const initialFormType =
    selectedAction === "Recognition"
      ? "3"
      : selectedAction === "Special Events"
      ? "1"
      : selectedAction === "Announcements"
      ? "2"
      : "1";

  const {
    formik,
    isSubmitting,
    validationSchema,
    getInitialValues,
    selectedFormType,
    setSelectedFormType,
    selectedSpecialEventType,
    setSelectedSpecialEventType,
    selectedEmployee,
    setSelectedEmployee,
    users,
  } = useEventForm(initialFormType);



  return (
    <SideFormModal
      initialFormValues={formik.initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, helpers) => {
        formik.onSubmit(values, helpers).then(() => {
          onClose();
        });
      }}
      isSubmitting={isSubmitting}
      title={title || "New Event"}
      back={true}
      backFn={onClose}
      formClassName="flex flex-col my-8 gap-6"
    >
      {(formikProps) => (
      <>
        {!selectedAction && (
          <div className="">
            <label
              htmlFor="formType"
              className="block mb-2 font-medium text-gray-700"
            >
              Event Type
            </label>
            <Field name="formType">
              {({ field, form, meta }: FieldProps) => (
                <div className="relative">
                  <Select
                    onValueChange={(value) => {
                      // Reset form with new initial values for the selected type
                      const newInitialValues = getInitialValues(value);
                      form.resetForm({ values: newInitialValues });

                      setSelectedFormType(value);
                      setSelectedEmployee(null);
                      form.setFieldValue(field.name, value);
                    }}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full bg-gray-100 py-6 rounded-b-none focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3 ">
                      <SelectValue placeholder="Select Event Type" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[2000]">
                      <SelectGroup className="">
                        <SelectLabel>Select an event type</SelectLabel>
                        {formTypes.map((item) => (
                          <SelectItem
                            className="py-[12px] px-[24px] focus:bg-rgtpurpleaccent3"
                            value={item.id}
                            key={item.id}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {meta.touched && meta.error && (
                    <div className="text-red-500 text-sm mt-1">
                      {meta.error}
                    </div>
                  )}
                </div>
              )}
            </Field>
          </div>
        )}
        <EventForm
          formik={formikProps}
          selectedFormType={selectedFormType}
          selectedSpecialEventType={selectedSpecialEventType}
          setSelectedSpecialEventType={setSelectedSpecialEventType}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          users={users}
        />
      </>
      )} 
    </SideFormModal>
  );
};
