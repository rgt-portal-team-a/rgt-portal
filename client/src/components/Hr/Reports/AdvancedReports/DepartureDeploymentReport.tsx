import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

// Define the type for department data
interface DepartmentData {
  department: string;
  value: number;
  max: number;
}

export const DepartureDeploymentReport: React.FC = () => {
  const nspHiringData: DepartmentData[] = [
    { department: "Figma", value: 56, max: 100 },
    { department: "Sketch", value: 64, max: 100 },
    { department: "XD", value: 16, max: 100 },
    { department: "Photoshop", value: 78, max: 100 },
    { department: "Illustrator", value: 70, max: 100 },
    { department: "AfterEffect", value: 37, max: 100 },
  ];

  const nspChartConfig = {
    title: "NSP Hiring Success",
    data: nspHiringData,
    showFilters: false,
    renderChart: (data: DepartmentData[]) => (
      <div className="space-y-4 relative">
        {/* Vertical Grid Lines */}
        <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none">
          {[0, 20, 40, 60, 80, 100].map((line) => (
            <div
              key={line}
              className="absolute w-full border-l border-gray-200"
              style={{ left: `${line}%` }}
            >
              <span className="absolute -bottom-6 text-xs text-gray-500">
                {line}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-end h-64">
          {data.map((item: DepartmentData, index: number) => (
            <div
              key={index}
              className="flex flex-col items-center"
              style={{ height: `${(item.value / item.max) * 100}%` }}
            >
              <div
                className="w-12 bg-pink-500"
                style={{ height: "100%" }}
              ></div>
              <span className="text-xs mt-2">{item.department}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{nspChartConfig.title}</h2>
        <div className="flex gap-2">
          <Button
            variant="default"
            className="bg-purple-600 hover:bg-purple-700"
          >
            Analyze
          </Button>
          <Button
            variant="outline"
            className="border-purple-600 text-purple-600"
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Generate Report
          </Button>
        </div>
      </div>

      {nspChartConfig.renderChart(nspHiringData)}

      <div className="text-right text-xs text-gray-500 mt-4">© 2023</div>
    </div>
  );
};

// export default DepartureDeploymentReport;
