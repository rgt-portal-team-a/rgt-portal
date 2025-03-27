import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
Tooltip,
ResponsiveContainer,
BarChart,
XAxis,
YAxis,
Bar,
TooltipProps,
CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useGetEmployeeCountByDepartment } from "@/api/query-hooks/reports.hooks";

interface CustomTooltipProps extends TooltipProps<string, string> {}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
active,
payload,
}) => {
if (!active || !payload || payload.length === 0) return null;

const data = payload[0].payload;

return (
  <div className="bg-white shadow-lg p-4 rounded-lg border border-gray-200">
    <p className="font-bold text-gray-800">{data.department}</p>
    <p className="text-gray-600">Employees: {data.count}</p>
    <p className="text-gray-600">
      Percentage: {data.percentage ? data.percentage.toFixed(2) : '0.00'}%
    </p>
  </div>
);
};

const EmployeeCountDepartment: React.FC = () => {
const { 
  data, 
  isLoading, 
  isError, 
  error, 
  refetch, 
  isFetching 
} = useGetEmployeeCountByDepartment();

// Prepare data with percentages
const processedData = React.useMemo(() => {
  if (!data?.employeeCountData) return [];

  const totalEmployeeCount = data.totalEmployeeCount;

  return data.employeeCountData
    .map(item => ({
      ...item,
      count: Number(item.count),
      percentage: totalEmployeeCount > 0 
        ? (Number(item.count) / totalEmployeeCount) * 100 
        : 0
    }))
    .sort((a, b) => b.count - a.count);
}, [data]);

// Render Loading State
if (isLoading) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employee Count per Department</CardTitle>
        <Button variant="outline" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <p>Fetching department employee count...</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Render Error State
if (isError) {
  return (
    <Card className="border-destructive/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-destructive">Data Fetch Error</CardTitle>
        <Button
          variant="destructive"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Retry
        </Button>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center text-destructive">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="text-center mb-2">
            {error instanceof Error
              ? error.message
              : "Unable to fetch department employee count"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Render Empty State
if (!data || !data.employeeCountData || data.employeeCountData.length === 0) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employee Count per Department</CardTitle>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center text-gray-500">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="text-center">No department employee data available</p>
        </div>
      </CardContent>
    </Card>
  );
}

return (
  <Card className="w-full">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-xl font-semibold">
        Employee Count per Department
      </CardTitle>
      <Button
        variant="outline"
        className="bg-[#6418C3] hover:text-white hover:bg-purple-700 py-[25px] rounded-[8px] text-white"
      >
        Generate Report
      </Button>
    </CardHeader>
    <CardContent>
      <div
        className="text-2xl font-bold mb-4 text-gray-800"
        aria-label={`Total Employees: ${data.totalEmployeeCount.toLocaleString()}`}
      >
        {data.totalEmployeeCount.toLocaleString()} Total Employees
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          layout="vertical"
          data={processedData}
          margin={{
            left: 100,
            right: 20,
            top: 10,
            bottom: 10,
          }}
          aria-label="Department Employee Count Bar Chart"
        >
          <CartesianGrid horizontal={false} stroke="#f3f4f6" />
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
};

EmployeeCountDepartment.displayName = "EmployeeCountDepartment";

export default EmployeeCountDepartment;