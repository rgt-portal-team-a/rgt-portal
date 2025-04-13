import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetDepartmentById } from "@/api/query-hooks/department.hooks";
import ErrorMessage from "@/components/common/ErrorMessage";
import ProfileAdd from "@/assets/icons/ProfileAdd";
import LinearRightArrow from "@/assets/icons/LinearRightArrow";
import DepartmentEmployeeTable from "@/components/Hr/Employees/DepartmentEmployeeTable";
import { EmployeeSelector } from "@/components/Hr/common/EmployeeSelector";
import { SideFormModal } from "@/components/common/Modal";
import { Field, FieldArray, FormikHelpers, FieldProps } from "formik";
import * as Yup from "yup";
import { toast } from "@/hooks/use-toast";
import { useAllEmployees } from "@/api/query-hooks/employee.hooks";
import {
  useAddEmployeeToDepartment,
  useAddEmployeesToDepartment,
} from "@/api/query-hooks/department.hooks";
import DepartmentPageSkeleton from "@/components/Hr/Employees/DepartmentPageSkeleton";

const EmailSchema = Yup.object().shape({
  emails: Yup.array()
    .of(Yup.string().required("Employee is required"))
    .min(1, "At least one employee is required"),
});

const DepartmentPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const { id } = useParams<{ id: string }>();

  const initialValues = {
    emails: [""],
  };

  const { data: users } = useAllEmployees(
    {},
    {
      enabled: isModalOpen && !!id,
    }
  );

  const {
    data: departmentResponse,
    isError: isDepartmentError,
    error: departmentError,
    refetch: refetchDepartment,
    isLoading: isDepartmentLoading,
  } = useGetDepartmentById(id!, { includeEmployees: true });

  const addEmployeeToDepartment = useAddEmployeeToDepartment();
  const addEmployeesToDepartment = useAddEmployeesToDepartment();

  if (!id) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">No department ID provided</p>
      </div>
    );
  }

  if (isDepartmentLoading) {
    return <DepartmentPageSkeleton />;
  }

  if (!departmentResponse?.success || isDepartmentError) {
    return (
      <ErrorMessage
        title="Error Loading Department Data"
        error={departmentError}
        refetchFn={refetchDepartment}
      />
    );
  }

  const department = departmentResponse.data;

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm, setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    const loadingToast = toast({
      title: "Adding Employee",
      description: `Adding employee(s) to ${department.name} department...`,
      variant: "default",
      duration: 1000000,
    });

    console.log("Form values:", values);
    try {
      if (values.emails.length > 1) {
        await addEmployeesToDepartment.mutateAsync({
          id,
          data: { employeeIds: values.emails },
        });
      } else {
        await addEmployeeToDepartment.mutateAsync({
          id,
          data: { employeeId: values.emails[0] },
        });
      }

      loadingToast.update({
        id: loadingToast.id,
        title: "Success",
        description: `Employee(s) added to ${department.name} department successfully!`,
        variant: "default",
      });

      resetForm();
      handleCloseModal();
    } catch (error) {
      loadingToast.update({
        id: loadingToast.id,
        title: "Error",
        description: "Failed to add employee(s). Please try again.",
        variant: "destructive",
      });
      console.error("Error adding employees:", error);
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        loadingToast.dismiss();
      }, 3000); // Adjust the delay as needed
    }
  };

  return (
    <>
      <div className="flex flex-col bg-white rounded-md h-full">
        <section className="flex lg:flex-row flex-col justify-between w-full gap-2 lg:gap-0 lg:items-center pt-2 px-3">
          <div className="flex flex-col h-full">
            <h1 className="text-xl font-medium text-gray-600">
              {department?.name} Department
            </h1>
            <div className="text-sm text-gray-400 flex items-center ">
              <Link
                to={"/admin/alldepartments"}
                className={"hover:text-gray-500"}
              >
                {" "}
                All Departments{" "}
              </Link>
              <LinearRightArrow />
              <p className="text-gray-500">{department?.name} Department</p>
            </div>
          </div>

          <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-4 sm:items-center h-full">
            <div className="relative justify-between items-center w-full">
              <Input
                type="text"
                placeholder="Search by name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-5 py-3 rounded-xl bg-gray-50 border-1 border-rgtpurple outline-none shadow-none w-full h-full"
              />
              <Search className="absolute right-4 top-3 h-6 w-6 text-gray-400" />
            </div>
            <Button
              onClick={handleOpenModal}
              className="bg-rgtviolet hover:bg-violet-900 rounded-xl py-6"
            >
              <ProfileAdd />
              Add New Employee
            </Button>
          </div>
        </section>

        <div className="h-full overflow-auto">
          <DepartmentEmployeeTable
            department={department}
            filterByName={searchName}
          />
        </div>
      </div>

      {isModalOpen && (
        <SideFormModal
          initialFormValues={initialValues}
          validationSchema={EmailSchema}
          onSubmit={handleSubmit}
          title="Add New Employee"
          back={true}
          backFn={handleCloseModal}
          formClassName="flex flex-col my-8 gap-6"
          isSubmitting={
            addEmployeeToDepartment.isPending ||
            addEmployeesToDepartment.isPending
          }
        >
          {({ values }) => {
            return (
              <FieldArray name="emails">
                {({ push, remove }) => {
                  return (
                    <div className="space-y-4">
                      {values.emails && values.emails.length > 0
                        ? values.emails.map((email, index) => {
                            return (
                              <div key={email || index} className="space-y-2">
                                <Field name={`emails.${index}`}>
                                  {({ field, form, meta }: FieldProps) => (
                                    <EmployeeSelector
                                      field={field}
                                      form={form}
                                      meta={meta}
                                      users={users || []}
                                      placeholder="Select An Employee To Add To This Department"
                                      showRemoveButton={
                                        values.emails.length > 1
                                      }
                                      onRemove={() => remove(index)}
                                      filterFn={(user) =>
                                        !values.emails.includes(
                                          user.id.toString()
                                        ) && department.managerId !== user.id
                                      }
                                    />
                                  )}
                                </Field>
                              </div>
                            );
                          })
                        : null}

                      <Button
                        type="button"
                        variant="link"
                        onClick={() => push("")}
                        className="w-full justify-start"
                      >
                        <Plus />
                        Add another
                      </Button>
                    </div>
                  );
                }}
              </FieldArray>
            );
          }}
        </SideFormModal>
      )}
    </>
  );
};

export default DepartmentPage;
