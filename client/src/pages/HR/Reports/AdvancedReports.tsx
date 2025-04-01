import { StayOrStrayPredictor } from "@/components/Hr/Reports/AdvancedReports/StayOrStrayPredictor";
import { JobGeniusMatcher } from "@/components/Hr/Reports/AdvancedReports/JobGeniusMatcher";
import { CandidateFallouts } from "@/components/Hr/Reports/AdvancedReports/CandidateFallouts";
import { DepartureDeploymentReport } from "@/components/Hr/Reports/AdvancedReports/DepartureDeploymentReport";
import { HirePower } from "@/components/Hr/Reports/AdvancedReports/HirePower";


const AdvancedReports = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <StayOrStrayPredictor />
        <div className=" grid grid-cols-2 space-x-4">
          <JobGeniusMatcher />
          <CandidateFallouts />
        </div>
        <DepartureDeploymentReport />
      </div>
    </div>
  );
};

export default AdvancedReports;
