import CandidatesHiredPeriod from "@/components/Hr/Reports/RegularReports/CandidatesHiredPeriod";
import DropoutAnalysis from "@/components/Hr/Reports/RegularReports/DropoutAnalysis";
import EmployeeCountDepartment from "@/components/Hr/Reports/RegularReports/EmployeeCountDepartment";
import HiringTrendsOverTime from "@/components/Hr/Reports/RegularReports/HiringTrendsOverTime";
import HomeOfficeHeadCount from "@/components/Hr/Reports/RegularReports/HomeOfficeHeadCount";
// import BestSourceRetention from "@/components/Hr/Reports/RegularReports/BestSourceRetention";
import SourceToHireSuccessRate from "@/components/Hr/Reports/RegularReports/SourceToHireSuccessRate";
import ConversionRateStage from "@/components/Hr/Reports/RegularReports/ConversionRateStage";
import HiringLadder from "@/components/Hr/Reports/RegularReports/HiringLadder";
import NspCount from "@/components/Hr/Reports/RegularReports/NspCount";



const RegularReports = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="grid grid-cols-1 lg:flex lg:flex-row lg:w-full gap-6">
        <div className="w-2/3">
          <HiringLadder />
        </div>
        <div className="w-1/3">
          <NspCount />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionRateStage />
        <SourceToHireSuccessRate />
      </div>

      <div className="grid grid-cols-1  gap-6">
        {/* <BestSourceRetention /> */}
        <DropoutAnalysis />
      </div>

      <div className="grid grid-cols-1  ">
        <EmployeeCountDepartment />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HomeOfficeHeadCount />
        <HiringTrendsOverTime />
      </div>

      <CandidatesHiredPeriod />
    </div>
  );
};


export default RegularReports;