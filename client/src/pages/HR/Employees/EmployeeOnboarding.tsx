/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useAllAwaitingUsers } from "@/api/query-hooks/onboarding.hooks";
import StepProgress from "@/components/common/StepProgress";
import { User } from "@/types/authUser";
import ConfirmCancelModal from "@/components/common/ConfirmCancelModal";
import DeleteRippleIcon from "@/components/common/DeleteRippleIcon";
import { cn } from "@/lib/utils";
import { SideModal } from "@/components/ui/side-dialog";
import {
  Field,
  FieldProps,
  FieldInputProps,
  Formik,
  Form as FormikForm,
} from "formik";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import "react-country-state-city/dist/react-country-state-city.css";
import { Country, State } from "react-country-state-city/dist/esm/types";
import { RoleType } from "@/types/employee";
import CustomCountrySelect from "@/components/Hr/Employees/CustomCountrySelect";
import CustomStateSelect from "@/components/Hr/Employees/CustomStateSelect";
import { Calendar } from "@/components/ui/calendar";
import { EMPLOYEE_TYPES, ROLE_TYPES} from "@/constants";
import { CalendarIcon, Home, MapPin, Loader } from "lucide-react";
import { useDepartments } from "@/api/query-hooks/department.hooks";
import { useEmployeeOnboardingForm } from "@/hooks/useEmployeeOnboardingForm";
import { useEmployeeValidation } from "@/hooks/useEmployeeValidation";
import { useEmployeeOnboardingSubmission } from "@/hooks/useEmployeeOnboardingSubmission";
import { changeStatus } from "@/api/query-hooks/onboarding.hooks";
import { toast } from "@/hooks/use-toast";
import { UserStatus } from "@/lib/enums";
import { Textarea } from "@/components/ui/textarea";
import Avtr from "@/components/Avtr";

export const EmployeeOnboarding: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { onboardingValidationSchema } = useEmployeeValidation();
  const changeStatusMutation = changeStatus();

  const {
    data: departments,
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    error: departmentsError,
    refetch: refetchDepartments,
  } = useDepartments({ includeEmployees: true });

  const {
    countries,
    states,
    initialValues,
    selectedCountry,
    setSelectedCountry,
  } = useEmployeeOnboardingForm();

  const { handleSubmit, isSubmitting } = useEmployeeOnboardingSubmission(
    selectedUser?.id,
    selectedUser,
    countries,
    states
  );

  const onClose = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  const { data: usersData, isLoading, isError, error } = useAllAwaitingUsers();

  // Filter and paginate users
  const filteredUsers = useMemo(
    () =>
      usersData?.users.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [],
    [usersData?.users, searchQuery]
  );

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (user: User) => {
    setDeleteId(user.id);
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleOnboardReject = async () => {
    try {
      if (selectedUser) {
        console.log("Deleting Event with Id", selectedUser.id);
        await changeStatusMutation.mutateAsync({
          userId: selectedUser?.id,
          status: UserStatus.INACTIVE,
          reason: reason,
        });
        setShowDeleteModal(false);
      } else {
        toast({
          title: "No Onboarding User Selected",
          description: "Failed To Select Onboarding User",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.log("Error Deleting Onboarding User", err);
      toast({
        title: "Error Deleting Onboarding User",
        description: "Failed To Delete Onboarding User" + err,
        variant: "destructive",
      });
    }
  };

  // Render user card
  const renderUserCard = (user: User) => {
    return (
      <div
        key={user.id}
        className="bg-white p-4 flex justify-between items-center"
      >
        <div className="flex items-center space-x-4">
          <Avtr
            url={user.profileImage || "/default-avatar.png"}
            name={user.firstName as string}
            avtBg="bg-purple-200 text-purple-500"
          />
          <div>
            <div className="font-medium text-gray-500 text-sm">
              {user.firstName} {user.lastName}
            </div>
            <div className=" text-gray-500 text-xs">{user.email}</div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              setSelectedUser(user);
              setIsEditModalOpen(true);
            }}
            variant="outline"
            className="text-confirmgreen bg-greenaccent3 border-0 hover:bg-green-300 hover:text-gray-100 transition-colors ease-in-out duration-300"
          >
            Setup
          </Button>
          <Button
            variant="outline"
            className="text-cancelred bg-redaccent3  border-0 shadow-none hover:bg-red-300 hover:text-red-500 transition-colors ease-in-out duration-300"
            onClick={() => handleDelete(user)}
          >
            Reject
          </Button>
        </div>
      </div>
    );
  };

  if (isDepartmentsLoading) {
    return (
      <SideModal
        isOpen={isEditModalOpen}
        onOpenChange={onClose}
        title="Loading User Details"
        position="right"
        size="full"
        contentClassName=" min-w-2xl px-6 "
      >
        <div className="flex justify-center items-center h-full min-w-2xl  my-auto">
          <Loader className="animate-spin h-8 w-8" />
        </div>
      </SideModal>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-[15px] pt-[10px] h-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-gray-600">
              Onboarding Room
            </h1>
            <p className="text-sm text-gray-500">
              This is everyone trying to onboard
            </p>
          </div>
        </div>
        <div className="flex flex-col animate-pulse">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-xl h-24 p-4" />
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="bg-red-50 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-500">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!filteredUsers.length) {
    return (
      <div className="flex flex-col gap-[15px] pt-[10px] h-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-gray-600">
              Onboarding Room
            </h1>
            <p className="text-sm text-gray-500">
              This is everyone trying to onboard
            </p>
          </div>
          <div className="relative w-84">
            <Input
              type="text"
              placeholder="Search"
              className="pl-5 py-4 rounded-xl bg-gray-50 border outline-none shadow-none h-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-4 top-3 h-6 w-6 text-gray-400" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-gray-600 text-lg font-medium mb-2">
            {searchQuery ? "Oops" : "No Users to Onboard"}
          </h2>
          <p className="text-gray-400 text-sm">
            {searchQuery
              ? "No matching users found"
              : "Currently, there are no users waiting for onboarding"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-[15px] pt-[10px] h-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-gray-600">
              Onboarding Room
            </h1>
            <p className="text-sm text-gray-500">
              This is everyone trying to onboard
            </p>
          </div>
          <div className="relative w-84">
            <Input
              type="text"
              placeholder="Search"
              className="pl-5 py-4 rounded-xl bg-gray-50 border outline-none shadow-none h-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <X
                className="absolute right-4 top-3 h-6 w-6 text-gray-400 cursor-pointer"
                onClick={() => setSearchQuery("")}
              />
            )}
            <Search className="absolute right-4 top-3 h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div className="flex flex-col p-4 bg-white rounded-lg">
          {paginatedUsers.map(renderUserCard)}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <StepProgress
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>

      <SideModal
        isOpen={isEditModalOpen}
        onOpenChange={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
        title={`Edit ${selectedUser?.firstName || selectedUser?.email} ${
          selectedUser?.lastName ? selectedUser?.lastName : ""
        }`}
        position="right"
        size={"full"}
        contentClassName=" max-w-2xl px-6 "
      >
        <Formik
          initialValues={initialValues}
          validationSchema={onboardingValidationSchema}
          onSubmit={handleSubmit}
        >
          {(formikProps) => {
            console.log("Form Errors:", formikProps.errors);
            return (
              <>
                <FormikForm className=" max-w-2xl  my-6  space-y-8">
                  <div className="grid grid-cols-2 space-x-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium"
                      >
                        FirstName
                      </Label>
                      <Field name="firstName">
                        {({
                          field,
                          form: { touched, errors },
                        }: {
                          field: FieldInputProps<string>;
                          form: any;
                        }) => (
                          <div>
                            <Input
                              id="firstName"
                              type="text"
                              placeholder="Enter user's first name"
                              {...field}
                              className={`w-full py-6 px-4 ${
                                touched.firstName && errors.firstName
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {touched.firstName && errors.firstName && (
                              <div className="text-red-500 text-sm mt-1">
                                {errors.firstName}
                              </div>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <Field name="lastName">
                        {({
                          field,
                          form: { touched, errors },
                        }: {
                          field: FieldInputProps<string>;
                          form: any;
                        }) => (
                          <div>
                            <div className="relative">
                              <Input
                                id="lastName"
                                type="text"
                                placeholder="Enter user's last name"
                                {...field}
                                className={`w-full py-6 px-4 ${
                                  touched.lastName && errors.lastName
                                    ? "border-red-500"
                                    : ""
                                }`}
                              />
                              <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                            </div>
                            {touched.lastName && errors.lastName && (
                              <div className="text-red-500 text-sm mt-1">
                                {errors.lastName}
                              </div>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 space-x-6">
                    {/* Department Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="department"
                        className="text-sm font-medium"
                      >
                        Department
                      </Label>
                      <Field name="department.id">
                        {({ field, form, meta }: FieldProps) => {
                          return (
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
                                      <SelectItem
                                        value="no-departments"
                                        disabled
                                      >
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
                          );
                        }}
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
                          form: any;
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
                          form: any;
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
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-2 space-x-6 ">
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
                                    <SelectItem
                                      value={EMPLOYEE_TYPES.FULL_TIME}
                                    >
                                      Full Time
                                    </SelectItem>
                                    <SelectItem
                                      value={EMPLOYEE_TYPES.PART_TIME}
                                    >
                                      Part Time
                                    </SelectItem>
                                    <SelectItem
                                      value={EMPLOYEE_TYPES.CONTRACTOR}
                                    >
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
                                defaultValue={field.value as RoleType}
                              >
                                <SelectTrigger
                                  id="roleId"
                                  className="w-full py-6"
                                >
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
                                    <SelectItem value={ROLE_TYPES.ADMIN}>
                                      Admin
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

                    {/* Birthday Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="birthDate"
                        className="text-sm font-medium"
                      >
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

                    <div className="grid grid-cols-2 space-x-6 space-y-12">
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
                            form: any;
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
                        <Label
                          htmlFor="countryId"
                          className="text-sm font-medium"
                        >
                          Country
                        </Label>
                        <Field name="countryId">
                          {({ form, meta }: FieldProps) => {
                            return (
                              <div className="space-y-2">
                                <div className="relative">
                                  <CustomCountrySelect
                                    onChange={(country: Country | null) => {
                                      setSelectedCountry(country?.id || null);
                                      form.setFieldValue(
                                        "countryId",
                                        country?.id || null
                                      );
                                      form.setFieldValue("stateId", null);
                                      form.setFieldValue("city", "");
                                    }}
                                    selectedCountry={selectedCountry}
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
                            );
                          }}
                        </Field>
                      </div>

                      {/* Region (State) Field */}
                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-sm font-medium">
                          Region/State
                        </Label>
                        <Field name="stateId">
                          {({ form, meta }: FieldProps) => {
                            return (
                              <div className="relative">
                                <CustomStateSelect
                                  countryid={formikProps.values.countryId}
                                  onChange={(state: State | null) => {
                                    form.setFieldValue(
                                      "stateId",
                                      state?.id || null
                                    );
                                    form.setFieldValue("city", "");
                                  }}
                                  defaultValue={undefined}
                                  placeHolder="Select State/Region"
                                  containerClassName="w-full shadow-xs rounded-md"
                                  inputClassName="w-full border-none rounded-md px-3"
                                  disabled={!formikProps.values.countryId}
                                />
                                {meta.touched && meta.error && (
                                  <div className="text-red-500 text-sm mt-1">
                                    {meta.error}
                                  </div>
                                )}
                              </div>
                            );
                          }}
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
                                  meta.touched && meta.error
                                    ? "border-red-500"
                                    : ""
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
                    </div>
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
                      "Finish Onboarding"
                    )}
                  </button>
                </div>
              </>
            );
          }}
        </Formik>
      </SideModal>

      <ConfirmCancelModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onSubmit={handleOnboardReject}
        isSubmitting={changeStatusMutation.isPending}
        submitText="Confirm"
        onOpenChange={() => setShowDeleteModal(false)}
      >
        <div className="flex flex-col justify-center items-center space-y-2">
          <DeleteRippleIcon />
          <p className="text-lg font-semibold">Reject ?</p>
          <p className="font-light text-[#535862] text-sm text-center text-wrap w-[300px]">
            Are you sure you want to reject this user? This action cannot be
            undone.
          </p>
          <p className="text-sm text-gray-500">Provide a Reason </p>
          <span className="text-xs text-gray-500">(optional)</span>
          <Textarea
            className="w-full"
            rows={2}
            value={reason}
            onChange={(e: any) => setReason(e.target.value)}
            placeholder="Enter reason here..."
          />
        </div>
      </ConfirmCancelModal>
    </>
  );
};
