import { useRequestPto } from "@/hooks/usePtoRequests";
import EmployeeTimeOffRequest from "@/pages/common/EmployeeTimeOffRequest";

const HrEmployeeTimeOff = () => {
  const { allPtoData, isAllPtosLoading } = useRequestPto();

  return (
    <EmployeeTimeOffRequest
      data={allPtoData}
      isDataLoading={isAllPtosLoading}
    />
  );
};

export default HrEmployeeTimeOff;
