/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SideFormModal } from "@/components/common/Modal";
import { Field, FieldInputProps, FormikHelpers, FieldProps } from "formik";
import * as Yup from "yup";
import { Textarea } from "@/components/ui/textarea";
import { Mail, FileText, Search } from "lucide-react";
import { useAllEmployees } from "@/api/query-hooks/employee.hooks";
import { useCreateDepartment } from "@/api/query-hooks/department.hooks";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import DepartmentCard from "@/components/DepartmentCard";
import AllDepartmentsSkeleton from "@/components/Hr/Employees/AllDepartmentsSkeleton";
import {EmployeeSelector} from "@/components/Hr/common/EmployeeSelector";
import NoDepartmentsPage from "../../common/NoDepartmentsPage";
import { ALL_ROLE_NAMES } from "@/constants";

const NewDepSchema = Yup.object({
  name: Yup.string()
    .min(3, "A minimum of 3 characters are required for your department name")
    .max(100, "A max of 100 characters are required for your department name")
    .required("Required"),
  description: Yup.string()
    .min(
      10,
      "A minimum of 10 characters are required for your department description"
    )
    .max(200, "A max of 200 characters are allowed for department description")
    .required("Required"),
  managerId: Yup.string().required("Required"),
});

interface FormValues {
  name: string;
  description: string;
  managerId: string;
}

export const AllDepartments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);
  const createDepartmentMutation = useCreateDepartment();
  const { data: users } = useAllEmployees({});
  const { departments, isDepartmentsLoading } = useDepartmentsData();


    useEffect(() => {
      console.log("isModalOpen:", isModalOpen);
    }, [isModalOpen]);

  useEffect(() => {
    if (!departments || departments.length <= 0) {
      setFilteredDepartments([]);
      return;
    }

    const filtered = searchQuery.trim()
      ? departments.filter((department) =>
          department.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : departments;

    setFilteredDepartments(filtered);
  }, [departments, searchQuery]);

  // console.log("Filtered Departments: ", filteredDepartments);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFormSubmit = (
    values: FormValues,
    helpers: FormikHelpers<FormValues>
  ) => {
    createDepartmentMutation.mutate({
      data: {
        name: values.name,
        description: values.description,
        managerId: Number(values.managerId),
      },
    });
    helpers.resetForm();
    setIsModalOpen(false);
  };

  const initialFormValues: FormValues = {
    name: "",
    description: "",
    managerId: "",
  };

  if(!departments && isDepartmentsLoading){
    return <AllDepartmentsSkeleton/>
  }




  return (
    <>
      {/* Main Content */}
      {departments && departments.length > 0 ? (
        <div className="flex flex-col gap-[15px] pt-[10px] h-full">
          <section className="flex flex-col lg:flex-row justify-between w-full items-center py-1">
            <div className="flex flex-col h-full w-full pb-3">
              <h1 className="text-xl font-medium text-gray-600">
                All Departments
              </h1>
              <p className="text-sm text-gray-500">
                These are all current Departments
              </p>
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4 lg:items-center h-full w-full">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search for a department"
                  className="pl-5 py-4 rounded-xl bg-gray-50 border outline-none shadow-none h-full w-full "
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <Search className="absolute right-4 top-3 h-6 w-6 text-gray-400" />
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-rgtviolet hover:bg-violet-900 rounded-lg py-6 cursor-pointer"
              >
                Create a New Department
              </Button>
            </div>
          </section>

          {filteredDepartments.length > 0 ? (
            <div className="flex flex-wrap gap-4 overflow-auto pb-5 ">
              {filteredDepartments.map((department) => (
                <DepartmentCard
                  key={department.id}
                  path={`department/${department.id}`}
                  id={department.id}
                  name={department.name}
                  employees={department.employees ?? []}
                  manager={department.manager}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg mb-4">
                <img src="/FolderAdd.svg" alt="No departments" />
              </div>
              <h2 className="text-gray-600 text-lg font-medium mb-1">
                {searchQuery
                  ? "No matching departments found"
                  : "No Departments at the moment"}
              </h2>
              <p className="text-gray-400 text-sm">
                {searchQuery
                  ? "Try a different search term or create a new department"
                  : "Click create a new department"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 flex flex-col gap-[15px] pt-[10px] h-full">
          <section className="h-[62px] flex justify-between w-full items-center py-1">
            <div className="flex flex-col h-full">
              <h1 className="text-xl font-medium text-gray-600">
                All Departments
              </h1>
              <p className="text-sm text-gray-500">
                These are all current Departments
              </p>
            </div>
            <div className="md:flex md:flex-row h-full flex-col">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-rgtviolet hover:bg-violet-900 rounded-xl h-full cursor-pointer"
              >
                Create a New Department
              </Button>
            </div>
          </section>
          <NoDepartmentsPage />
        </div>
      )}

      {isModalOpen && (
        <SideFormModal
          initialFormValues={initialFormValues}
          validationSchema={NewDepSchema}
          onSubmit={handleFormSubmit}
          title="Add New Department"
          back={true}
          backFn={() => setIsModalOpen(false)}
          formClassName="flex flex-col my-8 gap-6"
          submitBtnText={
            createDepartmentMutation.isPending ? "Creating..." : "Create"
          }
          isSubmitting={createDepartmentMutation.isPending}
        >
          <Field name="name">
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
                    id="name"
                    type="text"
                    placeholder="Enter department name"
                    {...field}
                    className={`w-full py-6 px-4 ${
                      touched.name && errors.name ? "border-red-500" : ""
                    }`}
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
                {touched.name && errors.name && (
                  <div className="text-red-500 text-sm mt-1">{errors.name}</div>
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
                <div className="relative">
                  <Textarea
                    id="description"
                    placeholder="Enter department description"
                    {...field}
                    className={`w-full min-h-[100px] px-6 py-2 ${
                      touched.description && errors.description
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <FileText className="absolute right-3 top-2 h-5 w-5 text-gray-500" />
                </div>
                {touched.description && errors.description && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </div>
                )}
              </div>
            )}
          </Field>

          <Field name="managerId">
            {({ field, form, meta }: FieldProps) => (
              <EmployeeSelector
                field={field}
                form={form}
                meta={meta}
                users={users || []}
                placeholder="Select a manager for the department"
                showEmail={true}
                filterFn={(user) =>
                  user?.user?.role?.name !== ALL_ROLE_NAMES.MANAGER &&
                  user?.user?.role?.name !== ALL_ROLE_NAMES.ADMIN &&
                  user?.user?.role?.name !== ALL_ROLE_NAMES.HR
                }
              />
            )}
          </Field>
        </SideFormModal>
      )}
    </>
  );
};
