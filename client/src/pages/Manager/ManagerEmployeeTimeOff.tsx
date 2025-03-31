import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import EmployeeTimeOffRequest from "../common/EmployeeTimeOffRequest";
import { useRequestPto } from "@/hooks/usePtoRequests";

const ManagerEmployeeTimeOff = () => {
  const { currentUser } = useAuthContextProvider();
  const departmentId = currentUser?.employee?.departmentId as number;

  const { departmentPtos, isDepartmentPtoLoading } =
    useRequestPto(departmentId);

  console.log("departmentPtos", departmentPtos);
  console.log("ManagerInfo:", currentUser)
  console.log("departmentId:", departmentId)

  return (
    <EmployeeTimeOffRequest
      data={departmentPtos}
      isDataLoading={isDepartmentPtoLoading}
    />
  );
};

export default ManagerEmployeeTimeOff;
