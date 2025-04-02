import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  TooltipProps,
} from "recharts";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { Employee } from "@/types/employee";
import { Department } from "@/types/department";
import { AlertCircle } from "lucide-react";

interface DepartmentCountData {
  department: string;
  count: number;
  percentage: number;
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload as DepartmentCountData;

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg border border-gray-200">
      <p className="font-bold text-gray-800">{data.department}</p>
      <p className="text-gray-600">Employees: {data.count.toLocaleString()}</p>
      <p className="text-gray-600">Percentage: {data.percentage.toFixed(2)}%</p>
    </div>
  );
};

const EmployeeCountDepartment: React.FC = React.memo(() => {
  const { employees, departments } = useSelector(
    (state: RootState) => state.sharedState
  );

  const departmentData = useMemo<DepartmentCountData[]>(() => {
    if (!departments?.length) return [];

    const processedData = departments
      .map((department: Department) => ({
        department: department.name,
        count: department.employees?.length + 1 || 0,
      }))
      .filter((dept) => dept.count > 0) 
      .sort((a, b) => b.count - a.count); 

    const totalEmployees = processedData.reduce(
      (sum, dept) => sum + dept.count,
      0
    );

    return processedData.map((dept) => ({
      ...dept,
      percentage: (dept.count / totalEmployees) * 100,
    }));
  }, [departments]);

  const totalEmployees = useMemo(
    () => departmentData.reduce((sum, dept) => sum + dept.count, 0),
    [departmentData]
  );

  // Empty state rendering
  if (!departmentData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Count per Department</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-center">
              No department or employee data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Employee Count per Department
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="text-2xl font-bold mb-4 text-gray-800"
          aria-label={`Total Employees: ${totalEmployees.toLocaleString()}`}
        >
          {totalEmployees.toLocaleString()} Total Employees
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            layout="vertical"
            data={departmentData}
            margin={{
              left: 100,
              right: 20,
              top: 10,
              bottom: 10,
            }}
            aria-label="Department Employee Count Bar Chart"
          >
            <XAxis
              type="number"
              label={{
                value: "Number of Employees",
                position: "insideBottom",
                offset: -10,
              }}
            />
            <YAxis dataKey="department" type="category" width={150} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(147, 51, 234, 0.1)" }}
            />
            <Bar
              dataKey="count"
              fill="#9333ea"
              barSize={30}
              background={{ fill: "#f3f4f6" }}
              label={{
                position: "right",
                formatter: (value: number) => value.toLocaleString(),
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

// Add display name for better debugging
EmployeeCountDepartment.displayName = "EmployeeCountDepartment";

export default EmployeeCountDepartment;
