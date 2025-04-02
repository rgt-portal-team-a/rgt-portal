import { StayOrStrayPredictor } from "@/components/Hr/Reports/AdvancedReports/StayOrStrayPredictor";
import { JobGeniusMatcher } from "@/components/Hr/Reports/AdvancedReports/JobGeniusMatcher";
import { DepartureDeploymentReport } from "@/components/Hr/Reports/AdvancedReports/DepartureDeploymentReport";
import { HirePower } from "@/components/Hr/Reports/AdvancedReports/HirePower";


const AdvancedReports = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <StayOrStrayPredictor />
        <JobGeniusMatcher />
        <DepartureDeploymentReport />
        <HirePower />
      </div>
    </div>
  );
};

export default AdvancedReports;
