import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useGetTurnoverByTenure } from "@/api/query-hooks/analytics.hooks";

// Custom Tooltip Component
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg border border-gray-200">
      <p className="font-bold text-gray-800">{data.tenure}</p>
      <p className="text-gray-600">Employees: {data.count}</p>
      <p className="text-gray-600">Percentage: {data.percentage}%</p>
    </div>
  );
};

export const TurnoverByTenure: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetTurnoverByTenure();

  // Render Loading State
  if (isLoading) {
    return (
      <Card className="rounded-[24px] shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Employee Turnover By Tenure
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching turnover by tenure data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Error State
  if (isError) {
    return (
      <Card className="rounded-[24px] shadow-lg border-destructive/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-destructive text-sm font-medium">
            Data Fetch Error
          </CardTitle>
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
                : "Unable to fetch turnover by tenure data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Empty State
  if (!data || data.length === 0) {
    return (
      <Card className="rounded-[24px] shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Employee Turnover By Tenure
          </CardTitle>
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
            <p className="text-center">No turnover by tenure data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total employees
//   const totalEmployees = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="rounded-[24px] shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          Employee Turnover By Tenure
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* <div className="text-lg font-bold flex gap-4 mb-4">
          {totalEmployees}
          <p className="text-green-500">Total Employees</p>
        </div> */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 0, right: 0, bottom: 0, left: -30 }}
            >
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              {/* <XAxis
                dataKey="tenure"
                tickLine={false}
                axisLine={{ stroke: "#f3f4f6" }}
              /> axisLine={false}*/}
              <YAxis tickLine={true} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="#6418C3"
                radius={[4, 4, 0, 0]}
                label={{
                  position: "top",
                  formatter: (value: number) => value.toLocaleString(),
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
