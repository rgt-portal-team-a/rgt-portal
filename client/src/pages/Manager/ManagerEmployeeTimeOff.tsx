import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import EmployeeTimeOffRequest from "../common/EmployeeTimeOffRequest";
import { useRequestPto } from "@/hooks/usePtoRequests";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";

const ManagerEmployeeTimeOff = () => {
  const { currentUser } = useAuthContextProvider();
  const { departments } = useSelector((state: RootState) => state.sharedState);
  const departmentName = departments.find(
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
