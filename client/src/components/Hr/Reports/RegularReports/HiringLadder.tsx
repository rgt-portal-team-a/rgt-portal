import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useGetHiringLadder } from "@/api/query-hooks/reports.hooks";

const HiringLadder: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetHiringLadder();

  // Calculate total value
  const total =
    data?.agencyData?.reduce((sum, item) => sum + Number(item.value), 0) || 0;

  // Render Loading State
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>The Hiring Ladder: Top Performing Agencies</CardTitle>
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching hiring ladder data...</p>
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
                : "Unable to fetch hiring ladder data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Empty State
  if (!data || !data.agencyData || data.agencyData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>The Hiring Ladder: Top Performing Agencies</CardTitle>
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
            <p className="text-center">No hiring ladder data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Normal State
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>The Hiring Ladder: Top Performing Agencies</CardTitle>

      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 mb-4">
          <p className="text-3xl font-extrabold">{total}</p>
          <p className="text-green-500">
            +15% <span className="text-sm text-gray-500">than last Month</span>
          </p>
        </div>

        <div className="w-full h-10 bg-gray-100 rounded-[6.25px] overflow-hidden flex">
          {data.agencyData.map((agency, index) => (
            <div
              key={index}
              className="h-full"
              style={{
                width: `${Number(agency.percent).toFixed(2)}%`,
                backgroundColor: agency.color,
              }}
            />
          ))}
        </div>

        <div className="flex justify-between mt-2">
          {data.agencyData.map((agency, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: agency.color }}
                />
                <span className="flex text-sm">{agency.name}</span>
              </div>
              <span className="font-bold text-xl items-center flex gap-2">
                {agency.value}
                <span className="text-sm" style={{ color: agency.color }}>
                  ({Number(agency.percent).toFixed(2)}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HiringLadder;
