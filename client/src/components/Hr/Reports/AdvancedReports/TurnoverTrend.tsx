import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useGetTurnoverTrends } from "@/api/query-hooks/analytics.hooks";
import { format } from "date-fns";

// Custom Tooltip Component
const CustomTooltip: React.FC<TooltipProps<string, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg border border-gray-200">
      <p className="font-bold text-gray-800">
        {format(new Date(data.month), "MMM yyyy")}
      </p>
      <p className="text-gray-600">Turnover Count: {data.count}</p>
    </div>
  );
};

export const TurnoverTrend: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetTurnoverTrends();

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data?.monthlyData) return [];

    return data.monthlyData.map((item, index) => ({
      month: item.month,
      count: parseInt(item.count),
      movingAverage: data.movingAverage[index],
    }));
  }, [data]);

  // Render Loading State
  if (isLoading) {
    return (
      <Card className="rounded-[24px] shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Turnover Trend Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching turnover trends data...</p>
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
                : "Unable to fetch turnover trends data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Empty State
  if (!data?.monthlyData || data.monthlyData.length === 0) {
    return (
      <Card className="rounded-[24px] shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Turnover Trend Over Time
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
            <p className="text-center">No turnover trends data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="rounded-[24px] shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          Turnover Trend Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 0, right: 10, bottom: -10, left: -40 }}
            >
              <CartesianGrid
                stroke="#f3f4f6"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickFormatter={(tick) => format(new Date(tick), "MMM")}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#e91e63"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="movingAverage"
                stroke="#2196f3"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
