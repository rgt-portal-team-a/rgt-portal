import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useGetHeadcountByWorkType } from "@/api/query-hooks/reports.hooks";



const HomeOfficeHeadCount: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetHeadcountByWorkType();

  const totalHeadcount =
    data?.headCountData?.reduce((sum, item) => sum + Number(item.count), 0) ||
    0;

  // Render Loading State
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Home-Office HeadCount</CardTitle>
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching headcount data...</p>
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
                : "Unable to fetch headcount data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Empty State
  if (!data || !data.headCountData || data.headCountData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Home-Office HeadCount</CardTitle>
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
            <p className="text-center">No headcount data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom label function
  const renderLabel = ({ type, percent }: { type: string; percent: number }) =>
    `${type}: ${(percent * 100).toFixed(0)}%`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Home-Office HeadCount</CardTitle>
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
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data.headCountData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              label={({ name, percent }) =>
                renderLabel({
                  type: name || "",
                  percent: percent || 0,
                })
              }
            >
              {data.headCountData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} (${((Number(value) / totalHeadcount) * 100).toFixed(
                  0
                )}%)`,
                name,
              ]}
              contentStyle={{
                borderRadius: "8px",
                padding: "10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex justify-center mt-4 space-x-4">
          {data.headCountData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 mr-2 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs">
                {item.type}:{" "}
                {((Number(item.count) / totalHeadcount) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HomeOfficeHeadCount;
