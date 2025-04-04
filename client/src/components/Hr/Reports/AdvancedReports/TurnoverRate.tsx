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
import { useGetTurnoverByPosition } from "@/api/query-hooks/analytics.hooks";

// Custom Tooltip Component
const CustomTooltip: React.FC<TooltipProps<string, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg border border-gray-200">
      <p className="font-bold text-gray-800">{data.position}</p>
      <p className="text-gray-600">Turnover Rate: {data.turnoverRate}%</p>
      <p className="text-gray-600">Employees: {data.employeeCount}</p>
    </div>
  );
};

export const TurnoverRate: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetTurnoverByPosition();

  // Render Loading State
  if (isLoading) {
    return (
      <Card className="rounded-[24px] shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Top Ten Positions By Turnover Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching turnover by position data...</p>
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
                : "Unable to fetch turnover by position data"}
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
            Top Ten Positions By Turnover Rate
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
            <p className="text-center">
              No turnover by position data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort data by turnover rate in descending order and take top 10
  const sortedData = [...data]
    .sort((a, b) => parseFloat(b.turnoverRate) - parseFloat(a.turnoverRate))
    .slice(0, 10);

  // Calculate total employees
  const totalEmployees = sortedData.reduce(
    (sum, item) => sum + item.employeeCount,
    0
  );

  return (
    <Card className="rounded-[24px] shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          Top Ten Positions By Turnover Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sortedData}
              margin={{ top: 0, right: 0, bottom: 0, left: -40 }}
            >
              <CartesianGrid horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="position"
                type="category"
                width={190}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="employeeCount"
                fill="#5ECFFF"
                label={{
                  position: "right",
                  formatter: (value: number) => value.toLocaleString(),
                  style: { fontSize: "12px", fontWeight: 500 },
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
