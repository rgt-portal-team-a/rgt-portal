import { StayOrStrayPredictor } from "@/components/Hr/Reports/AdvancedReports/StayOrStrayPredictor";
import { JobGeniusMatcher } from "@/components/Hr/Reports/AdvancedReports/JobGeniusMatcher";
import { CandidateFallouts } from "@/components/Hr/Reports/AdvancedReports/CandidateFallouts";
import { DepartureDeploymentReport } from "@/components/Hr/Reports/AdvancedReports/DepartureDeploymentReport";


const AdvancedReports = () => {
  return (
      <div className="space-y-8 w-full h-full overflow-auto">
        <StayOrStrayPredictor />
        <div className=" flex flex-col md:flex-row gap-4">
          <JobGeniusMatcher />
          <CandidateFallouts />
        </div>
        <DepartureDeploymentReport />
      </div>
  );
};

export default AdvancedReports;
