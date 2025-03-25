import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import EmployeeTimeOffManagementTable from "@/components/Hr/Employees/EmployeeTimeOffManagementTable";
import { useRequestPto } from "@/hooks/usePtoRequests";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { useEffect } from "react";

const EmployeeTimeOffRequests = () => {
  const { currentUser } = useAuthContextProvider();
  const departmentId = currentUser?.employee?.departmentId as number;
  console.log("departmentId:", departmentId);

  // Only fetch department PTOs if departmentId is valid
  const { departmentPtos, isDepartmentPtoLoading } =
    useRequestPto(departmentId);

  useEffect(() => {
    console.log("Department ID:", departmentId);
  }, [departmentId]);

  console.log("departmentPto:", departmentPtos);

  return (
    <>
      <div className="flex flex-col gap-[15px] pt-[10px] h-full ">
        <section className="h-[62px] flex justify-between w-full items-center py-1">
          {/* Title */}
          <h1 className="text-2xl font-medium text-gray-600">
            Employee TimeOff Requestsdadfas
          </h1>

          <div className="md:flex md:flex-row gap-4 items-center h-full flex-col">
            <div className="relative justify-between items-center sm:w-[100px] md:w-[301px] md:max-w-[301px] flex-grow">
              <Input
                type="text"
                placeholder="Search Employee"
                className="pl-5 py-5 rounded-xl bg-gray-50 border-none outline-none shadow-none h-full"
              />
              <Search className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
            </div>

            <Button
              onClick={() => {}}
              className="bg-white text-gray-400 hover:bg-gray-100 rounded-xl h-full"
            >
              <img src={"/Filter 3.svg"} />
              Filter
            </Button>
          </div>
        </section>

        {/* Manage Employees Table Section */}

        <EmployeeTimeOffManagementTable
          initialData={departmentPtos || []}
          isDataLoading={isDepartmentPtoLoading}
        />
      </div>
    </>
  );
};

export default EmployeeTimeOffRequests;
