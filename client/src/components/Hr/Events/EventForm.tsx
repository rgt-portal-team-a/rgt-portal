import { useState, useEffect, useCallback } from "react";
import { Field, FieldArray, FieldInputProps } from "formik";
import { Calendar as CalendarIcon } from "lucide-react";
import { Plus, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Employee } from "@/types/employee";
import { Project } from "@/types/project";
import { FormikProps } from "formik";
import { FormValues, specialEventTypes } from "@/hooks/useEventForm";
import { format } from "date-fns";
import UserIcon from "@/assets/icons/UserIcon";

interface IEventForm {
  formik?: FormikProps<FormValues>;
  selectedFormType: string;
  selectedSpecialEventType: "1" | "2";
  setSelectedSpecialEventType: (eventType: "1" | "2") => void;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (employee: Employee | null) => void;
  users: Employee[];
  projects: Project[];
}

const EventForm = ({
  selectedFormType,
  selectedSpecialEventType,
  setSelectedSpecialEventType,
  selectedEmployee,
  setSelectedEmployee,
  users,
  projects,
}: IEventForm) => {
  const [employeePopoverStates, setEmployeePopoverStates] = useState<{
    [key: number]: boolean;
  }>({});

  // Reset popover states when special event type changes
  useEffect(() => {
    setEmployeePopoverStates({});
  }, [selectedSpecialEventType]);

  const toggleEmployeePopover = useCallback(
    (index: number, isOpen?: boolean) => {
      setEmployeePopoverStates((prev) => ({
        ...prev,
        [index]: isOpen ?? !prev[index],
      }));
    },
    []
  );

  const renderEmployeePopover = useCallback(
    (
      field: FieldInputProps<string>,
      form: any,
      index: number = 0,
      filterDuplicates: boolean = false
    ) => {
      const { values, touched, errors, setFieldValue } = form;

      // Determine which users to show
      const filteredUsers = filterDuplicates
        ? users.filter(
            (employee) =>
              !values.recognitionList.some(
                (item: any) => item.employeeId === employee.id
              )
          )
        : users;

      return (
        <Popover
          open={employeePopoverStates[index] || false}
          onOpenChange={(open) => {
            toggleEmployeePopover(index, open);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal py-6 px-4 bg-gray-100 ${
                touched[field.name] && errors[field.name]
                  ? "border-red-500"
                  : ""
              }`}
            >
              {values[field.name]
                ? `${
                    users.find((u) => u.id === values[field.name])?.firstName
                  } ${users.find((u) => u.id === values[field.name])?.lastName}`
                : "Select Employee"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[370px] p-0 z-[2020]" align="start">
            <Command>
              <CommandInput placeholder="Search employees..." />
              <CommandList>
                <CommandEmpty>No employees found.</CommandEmpty>
                <CommandGroup>
                  {filteredUsers.map((employee) => (
                    <CommandItem
                      key={employee.id}
                      value={`${employee.firstName} ${employee.lastName}`}
                      onSelect={() => {
                        setFieldValue(field.name, employee.id.toString());
                        toggleEmployeePopover(index, false);
                      }}
                    >
                      <div className="flex justify-between w-full py-[13px]">
                        <div className="flex gap-2 items-center">
                          <UserIcon />
                          <span>
                            {employee.firstName} {employee.lastName}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {employee.department?.name || "No Department"}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    },
    [users, employeePopoverStates, toggleEmployeePopover]
  );

  const renderEventTypeFields = useCallback(
    (selectedSpecialEventType: string) => {
      switch (selectedSpecialEventType) {
        case "1":
          return (
            <div className="space-y-4">
              <Field name="holidayName">
                {({
                  field,
                  form: { touched, errors },
                }: {
                  field: FieldInputProps<string>;
                  form: any;
                }) => (
                  <div className="">
                    <label
                      htmlFor="holidayName"
                      className="text-sm font-semibold text-gray-700 mb-1 block"
                    >
                      Holiday Name
                    </label>
                    <Input
                      id="holidayName"
                      type="text"
                      placeholder="Enter the holiday name"
                      {...field}
                      className={` w-full bg-gray-100 placeholder:text-gray-400  focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3  py-6 px-4 ${
                        touched.holidayName && errors.holidayName
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    {touched.holidayName && errors.holidayName && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.holidayName}
                      </div>
                    )}
                  </div>
                )}
              </Field>

              <Field name="date">
                {({
                  field,
                  form,
                }: {
                  field: FieldInputProps<string>;
                  form: any;
                }) => (
                  <div className="flex flex-col space-y-2">
                    <label
                      htmlFor="date"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Pick the Date
                    </label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left  font-normal py-6 px-4 bg-gray-100",
                            !form.values.date && "text-muted-foreground"
                          )}
                        >
                          {form.values.date ? (
                            format(form.values.date, "PPP")
                          ) : (
                            <span className="text-gray-500 font-semibold mx-1">
                              Select date
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 text-gray-500 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-auto p-0 z-[2000]"
                        align="start"
                      >
                        <Calendar
                          className="w-full"
                          mode="single"
                          selected={form.values.date}
                          onSelect={(date) => {
                            form.setFieldValue(field.name, date);
                          }}
                          disabled={(date: Date) =>
                            date < new Date() &&
                            date.setHours(0, 0, 0, 0) <
                              new Date().setHours(0, 0, 0, 0)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {form.touched.date && form.errors.date && (
                      <div className="text-red-500 text-sm mt-1">
                        {form.errors.date}
                      </div>
                    )}
                  </div>
                )}
              </Field>
            </div>
          );
        case "2":
          return (
            <div className="space-y-4">
              <Field name="employeeId">
                {({
                  field,
                  form,
                }: {
                  field: FieldInputProps<string>;
                  form: any;
                }) => (
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Employee
                    </label>
                    {renderEmployeePopover(field, form)}
                    {form.touched.employeeId && form.errors.employeeId && (
                      <div className="text-red-500 text-sm mt-1">
                        {form.errors.employeeId}
                      </div>
                    )}
                  </div>
                )}
              </Field>

              <Field name="date">
                {({
                  field,
                  form,
                }: {
                  field: FieldInputProps<string>;
                  form: any;
                }) => (
                  <div className="flex flex-col space-y-2">
                    <label
                      htmlFor="date"
                      className="text-sm font-semibold text-gray-700  block"
                    >
                      Pick the Date
                    </label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left  font-normal py-6 px-4 bg-gray-100 focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3",
                            !form.values.date && "text-muted-foreground"
                          )}
                        >
                          {form.values.date ? (
                            format(form.values.date, "PPP")
                          ) : (
                            <span className="text-gray-500 font-semibold mx-1">
                              Select date
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 text-gray-400" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-auto p-0 z-[2000]"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={form.values.date}
                          onSelect={(date) => {
                            form.setFieldValue(field.name, date);
                          }}
                          disabled={(date: Date) =>
                            date < new Date() &&
                            date.setHours(0, 0, 0, 0) <
                              new Date().setHours(0, 0, 0, 0)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {form.touched.date && form.errors.date && (
                      <div className="text-red-500 text-sm mt-1">
                        {form.errors.date}
                      </div>
                    )}
                  </div>
                )}
              </Field>
            </div>
          );
        default:
          return <div>No Special Event type Selected</div>;
      }
    },
    [users, employeePopoverStates, toggleEmployeePopover, renderEmployeePopover]
  );

  const renderFormFields = useCallback(
    (formType: string) => {
      switch (formType) {
        case "1":
          return (
            <>
              <div className="mb-2">
                <div className="flex space-x-2">
                  {specialEventTypes.map((eventType) => (
                    <Button
                      key={eventType.id}
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setSelectedSpecialEventType(eventType.id);
                      }}
                      className={`
                        ${
                          selectedSpecialEventType === eventType.id
                            ? "bg-[#E328AF] text-white hover:bg-[#E328AF]"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }
                        px-4 py-[10px] rounded-[8px] transition-colors 
                      `}
                    >
                      {eventType.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="">
                {renderEventTypeFields(selectedSpecialEventType)}
              </div>
            </>
          );
        case "2":
          return (
            <>
              <div className="space-y-4">
                <Field name="title">
                  {({
                    field,
                    form: { touched, errors },
                  }: {
                    field: FieldInputProps<string>;
                    form: any;
                  }) => (
                    <div>
                      <label
                        htmlFor="title"
                        className="text-sm font-semibold text-gray-700 mb-1 block"
                      >
                        Title
                      </label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="Enter announcement title"
                        {...field}
                        className={` w-full bg-gray-100 placeholder:text-gray-400  focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3  py-6 px-4 ${
                          touched.title && errors.title ? "border-red-500" : ""
                        }`}
                      />
                      {touched.title && errors.title && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.title}
                        </div>
                      )}
                    </div>
                  )}
                </Field>

                <Field name="description">
                  {({
                    field,
                    form: { touched, errors },
                  }: {
                    field: FieldInputProps<string>;
                    form: any;
                  }) => (
                    <div>
                      <label
                        htmlFor="description"
                        className="text-sm font-semibold text-gray-700 mb-1 block"
                      >
                        Description
                      </label>
                      <Textarea
                        id="description"
                        placeholder="Enter announcement description"
                        {...field}
                        className={` w-full h-[88px] bg-gray-100 placeholder:text-gray-400  focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3  py-4 px-4 border rounded ${
                          touched.description && errors.description
                            ? "border-red-500"
                            : ""
                        }`}
                        rows={4}
                      />
                      {touched.description && errors.description && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.description}
                        </div>
                      )}
                    </div>
                  )}
                </Field>

                <Field name="date">
                  {({
                    field,
                    form,
                  }: {
                    field: FieldInputProps<string>;
                    form: any;
                  }) => (
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor="date"
                        className="text-sm font-semibold text-gray-700 mb-1 block"
                      >
                        Announcement Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left  font-normal py-6 px-4 bg-gray-100 focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3",
                              !form.values.date && "text-muted-foreground"
                            )}
                          >
                            {form.values.date ? (
                              format(form.values.date, "PPP")
                            ) : (
                              <span className="text-gray-500 font-semibold mx-1">
                                Select date
                              </span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 z-[2000]"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={form.values.date}
                            onSelect={(date) => {
                              form.setFieldValue(field.name, date);
                            }}
                            disabled={(date: Date) =>
                              date < new Date() &&
                              date.setHours(0, 0, 0, 0) <
                                new Date().setHours(0, 0, 0, 0)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {form.touched.date && form.errors.date && (
                        <div className="text-red-500 text-sm mt-1">
                          {form.errors.date}
                        </div>
                      )}
                    </div>
                  )}
                </Field>
              </div>
            </>
          );
        case "3":
          return (
            <>
              <Field name="title">
                {({
                  field,
                  form: { touched, errors },
                }: {
                  field: FieldInputProps<string>;
                  form: any;
                }) => (
                  <div className="mb-4">
                    <label
                      htmlFor="title"
                      className="text-sm font-semibold text-gray-700 mb-1 block"
                    >
                      Recognition Title
                    </label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Dedicated...Let's Lock In"
                      {...field}
                      className={` w-full bg-gray-100 placeholder:text-gray-400  focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3  py-6 px-4 ${
                        touched.title && errors.title ? "border-red-500" : ""
                      }`}
                    />
                    {touched.title && errors.title && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.title}
                      </div>
                    )}
                  </div>
                )}
              </Field>
              <FieldArray name="recognitionList">
                {({ remove, push, form }: any) => (
                  <div className="space-y-4">
                    {(form.values.recognitionList || []).map(
                      (_: any, index: number) => (
                        <div key={index} className="space-y-4">
                          <div className="flex gap-1 items-center">
                            <Field name={`recognitionList.${index}.employeeId`}>
                              {({
                                field,
                                form: formProps,
                              }: {
                                field: FieldInputProps<string>;
                                form: any;
                              }) => (
                                <div className="w-full">
                                  {renderEmployeePopover(
                                    field,
                                    formProps,
                                    index + 1,
                                    true
                                  )}
                                </div>
                              )}
                            </Field>

                            <Field
                              name={`recognitionList.${index}.projectName`}
                            >
                              {({
                                field,
                                form: { values, touched, errors },
                              }: {
                                field: FieldInputProps<string>;
                                form: any;
                              }) => {
                                const projectError =
                                  touched.recognitionList?.[index]
                                    ?.projectName &&
                                  errors.recognitionList?.[index]?.projectName;

                                return (
                                  <div className="w-full">
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        placeholder="Name of project"
                                        className={`w-full bg-gray-100 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3 py-6 px-4 ${
                                          projectError ? "border-red-500" : ""
                                        }`}
                                      />
                                      {projectError && (
                                        <div className="text-red-500 text-sm mt-1">
                                          {projectError}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              }}
                            </Field>

                            {form.values.recognitionList.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:bg-white hover:text-red-700 py-6"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    )}

                    <div>
                      <Button
                        type="button"
                        variant="link"
                        onClick={() =>
                          push({ employeeId: "", projectName: "" })
                        }
                        className="text-purple-500 text-sm py-2 items-center justify-start hover:underline"
                      >
                        <Plus />
                        Add Another
                      </Button>
                    </div>
                  </div>
                )}
              </FieldArray>
            </>
          );
        default:
          return null;
      }
    },
    [
      selectedSpecialEventType,
      setSelectedEmployee,
      setSelectedSpecialEventType,
      renderEmployeePopover,
    ]
  );

  return (
    <div className="flex flex-col mb-8 gap-6">
      {renderFormFields(selectedFormType)}
    </div>
  );
};

export default EventForm;
