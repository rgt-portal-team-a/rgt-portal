import React from "react";
import {
  Field,
  FieldProps,
  FieldInputProps,
  Formik,
  Form as FormikForm,
  FormikProps,
} from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  Home,
  MapPin,
  FileText,
  Loader
} from "lucide-react";
import {
  useEmployeeDetails,
} from "@/api/query-hooks/employee.hooks";
import { SideModal } from "@/components/ui/side-dialog";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import {
  CountrySelect,
  StateSelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { Country, State } from "react-country-state-city/dist/esm/types";
import SkillsSelector from "./SkillsSelector";
import {useEmployeeForm} from "@/hooks/useEmployeeForm"
import { useEmployeeValidation } from "@/hooks/useEmployeeValidation";
import { useEmployeeSubmission } from "@/hooks/useEmployeeSubmission";
import { LEAVE_TYPES, EMPLOYEE_TYPES, ROLE_TYPES  } from "@/constants";
import { toast } from "@/hooks/use-toast";
import {Employee} from "@/types/employee"




interface EditEmployeeFormProps {
  employeeId: number;
  isOpen: boolean;
  onClose: () => void;
}

// Define a more specific employee form type
interface EmployeeFormValues {
  department: { id: number; name: string };
  personalEmail: string;
  phone: string;
  skills: string[];
  employeeType: string;
  roleId: string;
  hireDate: Date | string;
  endDate?: Date | string;
  leaveType: string;
  birthDate?: Date | string;
  leaveExplanation?: string;
  notes?: string;
  homeAddress: string;
  countryId: number | null;
  stateId: number | null;
  city: string;
  // Add other fields as needed
}

export const EditEmployeeForm: React.FC<EditEmployeeFormProps> = ({
  employeeId,
  isOpen,
  onClose,
}) => {
    const { departments } = useSelector(
        (state: RootState) => state.sharedState
    );
    const { data: employeeData, isError:isEmployeeError, error:getEmployeeError } = useEmployeeDetails(employeeId.toString());
    const employee = employeeData || {} as Employee;
    const { validationSchema } = useEmployeeValidation();

    const { 
        countries, 
        states, 
        initialValues, 
        setSelectedCountry 
    } = useEmployeeForm(employee);

    const { 
        handleSubmit, 
        isSubmitting 
    } = useEmployeeSubmission(employeeId, employee, countries, states);


    if(!employee || isEmployeeError ){
        console.log("Cannot Get Employee By Id");
        toast({
            title: "Error Editing Employee",
            description: "Failed To Get Employee By ID" + employeeId.toString() + ". Error" + getEmployeeError,
            variant: "destructive",
        });
        return;
    }

  return (
    <>
      <SideModal
        isOpen={isOpen}
        onOpenChange={() => {
          console.log("Before Closing The Modal. Befre isSubmitting");
          if (!isSubmitting) {
            console.log("About to Close The Modal");
            onClose();
          }
        }}
        title={`Edit ${employee.firstName} ${employee.lastName}`}
        position="right"
        size={"full"}
        contentClassName=" max-w-2xl px-6 "
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {(formikProps) => {

            return (
              <>
                <FormikForm className="space-x-6 space-y-12 max-w-2xl grid grid-cols-2 my-6 ">
                  {/* Department Field */}
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">
                      Department
                    </Label>
                    <Field name="department.id">
                      {({ field, form, meta }: FieldProps) => (
                        <div className="relative">
                          <Select
                            onValueChange={(value) =>
                              form.setFieldValue("department", {
                                id: parseInt(value),
                                name:
                                  departments?.find(
                                    (d) => d.id.toString() === value
                                  )?.name || "",
                              })
                            }
                            defaultValue={field.value?.toString() || ""}
                          >
                            <SelectTrigger
                              id="department"
                              className="w-full py-6 z-[2010]"
                            >
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent
                              position="popper"
                              className="z-[2010]"
                            >
                              <SelectGroup>
                                <SelectLabel>Departments</SelectLabel>
                                {departments?.length ? (
                                  departments.map((dept) => (
                                    <SelectItem
                                      key={dept.id}
                                      value={dept.id.toString()}
                                    >
                                      {dept.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-departments" disabled>
                                    No departments available
                                  </SelectItem>
                                )}
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

                  {/* Personal Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="personalEmail"
                      className="text-sm font-medium"
                    >
                      Personal Email
                    </Label>
                    <Field name="personalEmail">
                      {({
                        field,
                        form: { touched, errors },
                      }: {
                        field: FieldInputProps<string>;
                        form: FormikProps<EmployeeFormValues>;
                      }) => (
                        <div>
                          <div className="relative">
                            <Input
                              id="personalEmail"
                              type="email"
                              placeholder="Enter personal email"
                              {...field}
                              className={`w-full py-6 px-4 ${
                                touched.personalEmail && errors.personalEmail
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </div>
                          {touched.personalEmail && errors.personalEmail && (
                            <div className="text-red-500 text-sm mt-1">
                              {errors.personalEmail}
                            </div>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Field name="phone">
                      {({
                        field,
                        form: { touched, errors },
                      }: {
                        field: FieldInputProps<string>;
                        form: FormikProps<EmployeeFormValues>;
                      }) => (
                        <div>
                          <div className="relative">
                            <Input
                              id="phone"
                              type="text"
                              placeholder="Enter phone number"
                              {...field}
                              className={`w-full py-6 px-4 ${
                                touched.phone && errors.phone
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </div>
                          {touched.phone && errors.phone && (
                            <div className="text-red-500 text-sm mt-1">
                              {errors.phone}
                            </div>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* Employee Skills Field */}
                  <div className="space-y-2">
                    <Field name="skills">
                      {({ field, form }: FieldProps) => (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Skills</Label>
                          <SkillsSelector
                            value={field.value || []}
                            onChange={(skills) =>
                              form.setFieldValue("skills", skills)
                            }
                          />
                          {form.touched.skills &&
                            form.errors.skills &&
                            typeof form.errors.skills === "string" && (
                              <div className="text-red-500 text-sm mt-1">
                                {form.errors.skills}
                              </div>
                            )}
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* Employee Type Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="employeeType"
                      className="text-sm font-medium"
                    >
                      Fulltime/ Part time
                    </Label>
                    <Field name="employeeType">
                      {({ field, form, meta }: FieldProps) => (
                        <div className="relative">
                          <Select
                            onValueChange={(value) =>
                              form.setFieldValue(field.name, value)
                            }
                            onOpenChange={(open) => {
                              if (!open) {
                                window.event?.stopPropagation();
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <SelectTrigger
                              id="employeeType"
                              className="w-full py-6 "
                            >
                              <SelectValue placeholder="Select employee type" />
                            </SelectTrigger>
                            <SelectContent
                              position="popper"
                              className="z-[2010]"
                            >
                              <SelectGroup>
                                <SelectLabel>Employee Type</SelectLabel>
                                <SelectItem value={EMPLOYEE_TYPES.FULL_TIME}>
                                  Full Time
                                </SelectItem>
                                <SelectItem value={EMPLOYEE_TYPES.PART_TIME}>
                                  Part Time
                                </SelectItem>
                                <SelectItem value={EMPLOYEE_TYPES.CONTRACTOR}>
                                  Contractor
                                </SelectItem>
                                <SelectItem value={EMPLOYEE_TYPES.NSP}>
                                  NSP
                                </SelectItem>
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

                  {/* Role Field */}
                  <div className="space-y-2">
                    <Label htmlFor="roleId" className="text-sm font-medium">
                      User Type
                    </Label>
                    <Field name="roleId">
                      {({ field, form, meta }: FieldProps) => (
                        <div className="relative">
                          <Select
                            onValueChange={(value) =>
                              form.setFieldValue(field.name, value)
                            }
                            defaultValue={field.value}
                          >
                            <SelectTrigger id="roleId" className="w-full py-6">
                              <SelectValue placeholder="Change User Role" />
                            </SelectTrigger>
                            <SelectContent
                              position="popper"
                              className="z-[2010]"
                            >
                              <SelectGroup>
                                <SelectLabel>User Type</SelectLabel>
                                <SelectItem value={ROLE_TYPES.EMPLOYEE}>
                                  Employee
                                </SelectItem>
                                <SelectItem value={ROLE_TYPES.HR}>
                                  Hr
                                </SelectItem>
                                <SelectItem value={ROLE_TYPES.MANAGER}>
                                  Manager
                                </SelectItem>
                                <SelectItem value={ROLE_TYPES.MARKETER}>
                                  Marketer
                                </SelectItem>
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

                  {/* Start Date Field */}
                  <div className="space-y-2">
                    <Label htmlFor="hireDate" className="text-sm font-medium">
                      Start Date
                    </Label>
                    <Field name="hireDate">
                      {({ field, form, meta }: FieldProps) => (
                        <div className="relative">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="hireDate"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal py-6",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Select start date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 z-[2000]"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  form.setFieldValue(field.name, date)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {meta.touched && meta.error && (
                            <div className="text-red-500 text-sm mt-1">
                              {meta.error}
                            </div>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* End Date Field */}
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      End Date
                    </Label>
                    <Field name="endDate">
                      {({ field, form, meta }: FieldProps) => (
                        <div className="relative">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="endDate"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal py-6",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Select end date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 z-[2000]"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  form.setFieldValue(field.name, date)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {meta.touched && meta.error && (
                            <div className="text-red-500 text-sm mt-1">
                              {meta.error}
                            </div>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* Reason For Leave Field */}
                  <div className="space-y-2">
                    <Label htmlFor="leaveType" className="text-sm font-medium">
                      Reason For Leave
                    </Label>
                    <Field name="leaveType">
                      {({ field, form, meta }: FieldProps) => (
                        <div className="relative">
                          <Select
                            onValueChange={(value) =>
                              form.setFieldValue(field.name, value)
                            }
                            defaultValue={field.value}
                          >
                            <SelectTrigger
                              id="leaveType"
                              className="w-full py-6"
                            >
                              <SelectValue placeholder="Select reason for leave" />
                            </SelectTrigger>
                            <SelectContent
                              position="popper"
                              className="z-[2010]"
                            >
                              <SelectGroup>
                                <SelectLabel>Reason For Leave</SelectLabel>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value={LEAVE_TYPES.QUIT}>
                                  Quit
                                </SelectItem>
                                <SelectItem value={LEAVE_TYPES.LAYOFF}>
                                  Laid Off
                                </SelectItem>
                                <SelectItem value={LEAVE_TYPES.DISMISSED}>
                                  Dismissed
                                </SelectItem>
                                <SelectItem value={LEAVE_TYPES.OTHER}>
                                  Other
                                </SelectItem>
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

                  {/* Birthday Field */}
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-sm font-medium">
                      Birthday
                    </Label>
                    <Field name="birthDate">
                      {({ field, form, meta }: FieldProps) => (
                        <div className="relative">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="birthDate"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal py-6",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Select birthday</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 z-[2000]"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  form.setFieldValue(field.name, date)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {meta.touched && meta.error && (
                            <div className="text-red-500 text-sm mt-1">
                              {meta.error}
                            </div>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* Leave Explanation Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="leaveExplanation"
                      className="text-sm font-medium"
                    >
                      Leave Explanation
                    </Label>
                    <Field name="leaveExplanation">
                      {({
                        field,
                        form: { touched, errors },
                      }: {
                        field: FieldInputProps<string>;
                        form: FormikProps<EmployeeFormValues>;
                      }) => (
                        <div>
                          <div className="relative">
                            <Textarea
                              id="leaveExplanation"
                              placeholder="Write something..."
                              {...field}
                              className={`w-full min-h-[100px] px-6 py-2 ${
                                touched.leaveExplanation &&
                                errors.leaveExplanation
                                  ? "border-red-500"
                                  : ""
                              }`}
                              maxLength={500}
                            />
                            <div className="text-xs text-gray-500 text-right mt-1">
                              {field.value?.length || 0}/500 Characters
                            </div>
                          </div>
                          {touched.leaveExplanation &&
                            errors.leaveExplanation && (
                              <div className="text-red-500 text-sm mt-1">
                                {errors.leaveExplanation}
                              </div>
                            )}
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* Notes Field */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes
                    </Label>
                    <Field name="notes">
                      {({
                        field,
                        form: { touched, errors },
                      }: {
                        field: FieldInputProps<string>;
                        form: FormikProps<EmployeeFormValues>;
                      }) => (
                        <div>
                          <div className="relative">
                            <Textarea
                              id="notes"
                              placeholder="Write something..."
                              {...field}
                              className={`w-full min-h-[100px] px-6 py-2 ${
                                touched.notes && errors.notes
                                  ? "border-red-500"
                                  : ""
                              }`}
                              maxLength={500}
                            />
                            <FileText className="absolute right-3 top-2 h-5 w-5 text-gray-500" />
                            <div className="text-xs text-gray-500 text-right mt-1">
                              {field.value?.length || 0}/500 Characters
                            </div>
                          </div>
                          {touched.notes && errors.notes && (
                            <div className="text-red-500 text-sm mt-1">
                              {errors.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* Home Address Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="homeAddress"
                      className="text-sm font-medium"
                    >
                      Home Address
                    </Label>
                    <Field name="homeAddress">
                      {({
                        field,
                        form: { touched, errors },
                      }: {
                        field: FieldInputProps<string>;
                        form: FormikProps<EmployeeFormValues>;
                      }) => (
                        <div>
                          <div className="relative">
                            <Input
                              id="homeAddress"
                              type="text"
                              placeholder="Enter home address"
                              {...field}
                              className={`w-full py-6 px-4 ${
                                touched.homeAddress && errors.homeAddress
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                          </div>
                          {touched.homeAddress && errors.homeAddress && (
                            <div className="text-red-500 text-sm mt-1">
                              {errors.homeAddress}
                            </div>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* Country Field */}
                  <div className="space-y-2">
                    <Label htmlFor="countryId" className="text-sm font-medium">
                      Country
                    </Label>
                    <Field name="countryId">
                      {({ form, meta }: FieldProps) => (
                        <div className="space-y-2">
                          <div className="relative">
                            <CountrySelect
                              onChange={(event) => {
                                // Check if this is a Country object 
                                if (typeof event === 'object' && event !== null && 'id' in event) {
                                  const country = event as Country;
                                  setSelectedCountry(country.id || null);
                                  form.setFieldValue("countryId", country.id || null);
                                  form.setFieldValue("stateId", null);
                                  form.setFieldValue("city", "");
                                }
                              }}
                              value={
                                countries.find(
                                  (c) => c.id === formikProps.values.countryId
                                )?.id || undefined
                              }
                              placeHolder="Select Country"
                              containerClassName="w-full "
                              inputClassName="w-full py-6 border rounded-md px-3"
                            />
                            {meta.touched && meta.error && (
                              <div className="text-red-500 text-sm mt-1">
                                {meta.error}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* Region (State) Field */}
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-sm font-medium">
                      Region/State
                    </Label>
                    <Field name="stateId">
                      {({ form, meta }: FieldProps) => (
                        <div className="relative">
                          <StateSelect
                            countryid={formikProps.values.countryId ?? 0}
                            onChange={(event) => {
                              // Check if this is a State object
                              if (typeof event === 'object' && event !== null && 'id' in event) {
                                const state = event as State;
                                form.setFieldValue("stateId", state.id || null);
                                form.setFieldValue("city", "");
                              }
                            }}
                            value={formikProps.values.stateId}
                            placeHolder="Select State/Region"
                            containerClassName="w-full shadow-xs rounded-md "
                            inputClassName="w-full border-none rounded-md px-3"
                            disabled={!formikProps.values.countryId}
                          />
                          {meta.touched && meta.error && (
                            <div className="text-red-500 text-sm mt-1">
                              {meta.error}
                            </div>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* City Field */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <Field name="city">
                      {({ field, meta }: FieldProps) => (
                        <div className="relative">
                          <Input
                            id="city"
                            type="text"
                            placeholder="Enter City"
                            {...field}
                            className={`w-full py-6 px-4 ${
                              meta.touched && meta.error ? "border-red-500" : ""
                            }`}
                          />
                          {meta.touched && meta.error && (
                            <div className="text-red-500 text-sm mt-1">
                              {meta.error}
                            </div>
                          )}
                          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                        </div>
                      )}
                    </Field>
                  </div>
                </FormikForm>

                <div className="flex w-full gap-3 pb-2  h-14">
                  <button
                    type="button"
                    onClick={() => !isSubmitting && onClose()}
                    disabled={isSubmitting}
                    className={`w-1/2 h-full px-6 py-2 border border-[#E328AF] text-[#E328AF] rounded-md transition-colors cursor-pointer ${
                      isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-pink-100 duration-300 ease-in"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={formikProps.submitForm}
                    disabled={isSubmitting || !formikProps.isValid}
                    className={`w-1/2 h-full px-6 py-2 bg-[#E328AF] text-white rounded-md transition-colors cursor-pointer ${
                      isSubmitting || !formikProps.isValid
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-pink-400 duration-300 ease-in"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Processing...
                      </span>
                    ) : (
                      "Edit"
                    )}
                  </button>
                </div>
              </>
            );}}
        </Formik>
      </SideModal>
    </>
  );
};
