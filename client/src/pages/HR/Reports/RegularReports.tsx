import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { useGenerateReport } from "@/api/query-hooks/ai.hooks";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Loader2, Plus } from "lucide-react";

import CandidatesHiredPeriod from "@/components/Hr/Reports/RegularReports/CandidatesHiredPeriod";
import DropoutAnalysis from "@/components/Hr/Reports/RegularReports/DropoutAnalysis";
import EmployeeCountDepartment from "@/components/Hr/Reports/RegularReports/EmployeeCountDepartment";
import HomeOfficeHeadCount from "@/components/Hr/Reports/RegularReports/HomeOfficeHeadCount";
import SourceToHireSuccessRate from "@/components/Hr/Reports/RegularReports/SourceToHireSuccessRate";
import ConversionRateStage from "@/components/Hr/Reports/RegularReports/ConversionRateStage";
import HiringLadder from "@/components/Hr/Reports/RegularReports/HiringLadder";
import NspCount from "@/components/Hr/Reports/RegularReports/NspCount";

const RegularReports = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"employees" | "recruitment">(
    "recruitment"
  );

  const { data, isLoading, isFetching, isError, refetch } = useGenerateReport({
    type: reportType,
    format: "html",
  });

  const handleGenerateReport = async (type: "employees" | "recruitment") => {
    setReportType(type);
    setIsModalOpen(true);
    refetch();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("report-content");
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${reportType}_report.pdf`);
    }
  };

  return (
    <div className="flex flex-col gap-[15px] bg-white rounded-md">
      <section className="flex flex-col md:flex-row justify-between w-full items-center px-4 pt-4 ">
        <div className="flex flex-col w-full pb-4 md:pb-0">
          <h1 className="text-xl font-semibold text-[#706D8A]">Reports</h1>
          <h1 className="text-xs font-normal text-slate-500">
            These are your reports so far
          </h1>
        </div>

        <div className="w-full flex sm:flex-col gap-4 lg:flex-row items-center lg:justify-end h-full">
          <Button
            className="bg-rgtviolet rounded-[12px] hover:bg-violet-900 w-full lg:w-fit cursor-pointer text-white font-medium text-sm py-5 transition-colors duration-300 ease-in"
            onClick={() => handleGenerateReport("recruitment")}
          >
            {/* <img src="/Add.svg" alt="add" /> */}
            <Plus size={32} />
            Generate Recruitment Report
          </Button>
          <Button
            className="bg-rgtviolet rounded-[12px] w-full hover:bg-violet-900 lg:w-fit cursor-pointer text-white font-medium text-sm py-5 transition-colors duration-300 ease-in"
            onClick={() => handleGenerateReport("employees")}
          >
            {/* <img src="/Add.svg" alt="add" /> */}
            <Plus size={32} />
            Generate Employee Report
          </Button>
        </div>
      </section>

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-1010" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[90vw] h-[90vh] overflow-y-scroll max-w-4xl p-6 z-1020">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-semibold">
                {reportType === "recruitment" ? "Recruitment" : "Employee"}{" "}
                Report
              </Dialog.Title>
              <Button onClick={handleDownloadPDF} variant="ghost">
                Download as PDF
              </Button>
            </div>
            <Dialog.Description>
              {(isLoading || isFetching) && (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              {isError && (
                <div className="flex justify-center items-center h-40 text-red-500">
                  Failed to load report. Please try again.
                  <Button onClick={() => refetch()} variant={"outline"}>
                    Retry
                  </Button>
                </div>
              )}
            </Dialog.Description>
            {!isLoading && !isFetching && !isError && (
              <div
                id="report-content"
                dangerouslySetInnerHTML={{ __html: data || "" }}
                className="p-4"
              />
            )}
            <Dialog.Close asChild>
              <Button variant="ghost" className="mt-4">
                Close
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 lg:flex lg:flex-row lg:w-full gap-6">
          <div className="lg:w-2/3">
            <HiringLadder />
          </div>
          <div className="lg:w-1/3">
            <NspCount />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConversionRateStage />
          <SourceToHireSuccessRate />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <DropoutAnalysis />
        </div>

        <div className="grid grid-cols-1">
          <EmployeeCountDepartment />
        </div>

        <div className="grid grid-cols-1">
          <HomeOfficeHeadCount />
        </div>

        <CandidatesHiredPeriod />
      </div>
    </div>
  );
};

export default RegularReports;
