import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import EmployeeTimeOffRequest from "../common/EmployeeTimeOffRequest";
import { useRequestPto } from "@/hooks/usePtoRequests";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";


const ManagerEmployeeTimeOff = () => {
  const { currentUser } = useAuthContextProvider();
  const { departments } = useDepartmentsData();
  const departmentName = departments?.find(
    (item) => item.managerId === currentUser?.id
  )?.name;

  const departmentId = currentUser?.employee?.departmentId as number;

  const { departmentPtos, isDepartmentPtoLoading } =
    useRequestPto(departmentId);

  return (
    <EmployeeTimeOffRequest
      data={departmentPtos}
      isDataLoading={isDepartmentPtoLoading}
      departmentName={departmentName}
    />
  );
};

export default ManagerEmployeeTimeOff;
