import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, ChevronRight, ChevronLeft } from "lucide-react";

// Define the type for department data
interface DepartmentData {
  department: string;
  value: number;
  max: number;
}

// Define the type for chart configuration
interface ChartConfig {
  title: string;
  data: DepartmentData[];
  renderChart: (data: DepartmentData[]) => React.ReactNode;
  showFilters?: boolean;
}

export const DepartureDeploymentReport: React.FC = () => {
  const [currentChart, setCurrentChart] = useState<number>(0);

  const exitInterviewData: DepartmentData[] = [
    { department: "Figma", value: 56, max: 100 },
    { department: "Sketch", value: 64, max: 100 },
    { department: "XD", value: 76, max: 100 },
    { department: "Photoshop", value: 78, max: 100 },
    { department: "Illustrator", value: 70, max: 100 },
    { department: "AfterEffect", value: 37, max: 100 },
  ];

  const nspHiringData: DepartmentData[] = [
    { department: "Figma", value: 56, max: 100 },
    { department: "Sketch", value: 64, max: 100 },
    { department: "XD", value: 16, max: 100 },
    { department: "Photoshop", value: 78, max: 100 },
    { department: "Illustrator", value: 70, max: 100 },
    { department: "AfterEffect", value: 37, max: 100 },
  ];

  const charts: ChartConfig[] = [
    {
      title: "Exit Interview Analysis",
      data: exitInterviewData,
      showFilters: true,
      renderChart: (data: DepartmentData[]) => (
        <div className="space-y-4 relative">
          {/* Horizontal Grid Lines with Values */}
          <div className="absolute bottom-0 left-24 right-0 h-full pointer-events-none">
            {[0, 20, 40, 60, 80, 100].map((line) => (
              <div
                key={line}
                className="absolute w-full border-t border-gray-200"
                style={{ bottom: `${line}%` }}
              >
                <span className="absolute -left-20 text-xs text-gray-500">
                  {line}
                </span>
              </div>
            ))}
          </div>

          {data.map((item: DepartmentData, index: number) => (
            <div key={index} className="flex items-center relative z-10">
              <div className="w-24 text-sm font-medium">{item.department}</div>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${(item.value / item.max) * 100}%` }}
                ></div>
              </div>
              <div className="w-10 text-right ml-2 text-sm font-medium">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
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
    },
  ];

  const handleNextChart = () => {
    setCurrentChart((prev) => (prev + 1) % charts.length);
  };

  const handlePrevChart = () => {
    setCurrentChart((prev) => (prev - 1 + charts.length) % charts.length);
  };

  const currentChartData = charts[currentChart];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {/* Navigation Buttons with Conditional Rendering */}
      {currentChart > 0 && (
        <button
          onClick={handlePrevChart}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-purple-100 rounded-full p-2"
        >
          <ChevronLeft className="h-6 w-6 text-purple-600" />
        </button>
      )}

      {currentChart < charts.length - 1 && (
        <button
          onClick={handleNextChart}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-purple-100 rounded-full p-2"
        >
          <ChevronRight className="h-6 w-6 text-purple-600" />
        </button>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{currentChartData.title}</h2>
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

      {currentChartData.showFilters && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-48">
            <div className="text-sm text-gray-500 mb-1">Department</div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-48">
            <div className="text-sm text-gray-500 mb-1">Role</div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-48">
            <div className="text-sm text-gray-500 mb-1">Seniority</div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select seniority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" className="h-10">
              Reset
            </Button>
          </div>
        </div>
      )}

      {currentChartData.renderChart(currentChartData.data)}

      <div className="text-right text-xs text-gray-500 mt-4">© 2023</div>
    </div>
  );
};

export default DepartureDeploymentReport;
