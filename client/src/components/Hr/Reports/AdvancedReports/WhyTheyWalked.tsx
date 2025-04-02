import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useGetReasonsForLeaving } from "@/api/query-hooks/analytics.hooks";

// Custom Tooltip Component
const CustomTooltip: React.FC<TooltipProps<string, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg border border-gray-200">
      <p className="font-bold text-gray-800">{data.reason}</p>
      <p className="text-gray-600">Count: {data.count}</p>
      <p className="text-gray-600">Percentage: {data.percentage}%</p>
    </div>
  );
};

export const WhyTheyWalked: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetReasonsForLeaving();

  // Predefined color palette
  const pieColors = ["#8571F4", "#C686F8", "#E8CFFC"];

  // Render Loading State
  if (isLoading) {
    return (
      <Card className="rounded-[24px] shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Reasons For Leaving High-Risk Positions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching reasons for leaving data...</p>
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
                : "Unable to fetch reasons for leaving data"}
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
            Reasons For Leaving High-Risk Positions
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
            <p className="text-center">No reasons for leaving data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="rounded-[24px] shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          Reasons For Leaving High-Risk Positions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
